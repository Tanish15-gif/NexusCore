using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualBasic;
using NexusCore.AccountRepositories;
using NexusCore.DepositDto;
using NexusCore.TransactionDto;
using NexusCore.TransferDto;
using System.Collections.Generic;

namespace NexusCore.TransactionRepositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly string? conn;
        public TransactionRepository(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public async Task<int> GetDailyDepositCountAsync(int accountid)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                           SELECT COUNT(*) FROM Transactions 
                           WHERE AccountId = @aid 
                           AND TransactionType = 'Deposit'
                           AND Status = 'Completed'
                           AND TransactionDate >= DATEADD(DAY,-1,GETDATE())
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@aid", accountid);
                        var result = await cmd.ExecuteScalarAsync();
                        int rows = Convert.ToInt32(result);
                        return rows;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return 0;
            }
        }
        public async Task<bool> SavePendingDepositAsync(int accountid, decimal amount)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                                Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                values(@aid,'Deposit',@amount,'Pending','SYSTEM_DEPOSIT');
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@aid", accountid);
                        cmd.Parameters.AddWithValue("@amount", amount);

                        int rows = await cmd.ExecuteNonQueryAsync();
                        return rows > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
        public async Task<bool> SaveCompleteDepositAsync(int userid, int accountid, decimal amount)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                using (var transaction = (SqlTransaction)await connect.BeginTransactionAsync())
                {
                    try
                    {
                        string UpdateSql = @"
                                    Update Accounts 
                                    set Balance = Balance + @amount 
                                    where AccountId = @aid and UserId = @uid and AccountStatus = 'Active'
                        ";
                        using (var updatecmd = new SqlCommand(UpdateSql, connect, transaction))
                        {
                            updatecmd.Parameters.AddWithValue("@uid", userid);
                            updatecmd.Parameters.AddWithValue("@aid", accountid);
                            updatecmd.Parameters.AddWithValue("@amount", amount);

                            int rows = await updatecmd.ExecuteNonQueryAsync();

                            if (rows > 0)
                            {
                                string insertsql = @"
                                Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                values(@aid,'Deposit',@amount,'Completed','SYSTEM_DEPOSIT');
                                ";
                                using (var inscmd = new SqlCommand(insertsql, connect, transaction))
                                {
                                    inscmd.Parameters.AddWithValue("@aid", accountid);
                                    inscmd.Parameters.AddWithValue("@amount", amount);

                                    await inscmd.ExecuteNonQueryAsync();
                                }
                                await transaction.CommitAsync();
                                return true;
                            }
                            else
                            {
                                await transaction.RollbackAsync();
                                return false;
                            }
                        }
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine(ex.Message);
                        await transaction.RollbackAsync();
                        return false;
                    }
                }
            }
        }
        public async Task<bool> WithdrawAmountAsync(int userid, DepositAmount amount)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                using (var transaction = (SqlTransaction)await connect.BeginTransactionAsync())
                {
                    try
                    {
                        string updatesql = @"
                                Update Accounts Set Balance = Balance - @amount
                                where AccountId = @aid and UserId = @uid and AccountStatus = 'Active' and Balance >= @amount;
                        ";
                        using (var updatecmd = new SqlCommand(updatesql, connect, transaction))
                        {
                            updatecmd.Parameters.AddWithValue("@aid", amount.AccountId);
                            updatecmd.Parameters.AddWithValue("@uid", userid);
                            updatecmd.Parameters.AddWithValue("@amount", amount.Amount);

                            int rows = await updatecmd.ExecuteNonQueryAsync();
                            if (rows > 0)
                            {
                                string insertsql = @"
                                            Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                            Values(@aid,'Withdrawal',@amount,'Completed',@merchant);
                                ";
                                using (var insertcmd = new SqlCommand(insertsql, connect, transaction))
                                {
                                    insertcmd.Parameters.AddWithValue("@aid", amount.AccountId);
                                    insertcmd.Parameters.AddWithValue("@amount", amount.Amount);
                                    insertcmd.Parameters.AddWithValue("@merchant", amount.MerchantName ?? "SYSTEM_WITHDRAW");

                                    await insertcmd.ExecuteNonQueryAsync();
                                }
                                await transaction.CommitAsync();
                                return true;
                            }
                            else
                            {
                                await transaction.RollbackAsync();
                                return false;
                            }
                        }
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine(ex.Message);
                        await transaction.RollbackAsync();
                        return false;
                    }
                }
            }
        }
        public async Task<TransferResult> TransferAccountAsync(int userid, TransferAmount transferAmount)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                using (var transaction = (SqlTransaction)await connect.BeginTransactionAsync())
                {
                    try
                    {
                        string checksql = @"
                                    select AccountId from Accounts
                                    where AccountNumber = @accnum and AccountStatus = 'Active';
                                    ";
                        int targetAccountId = 0;
                        using (var checkcmd = new SqlCommand(checksql, connect, transaction))
                        {
                            checkcmd.Parameters.AddWithValue("@accnum", transferAmount.TargetAccountNumber);
                            var Id = await checkcmd.ExecuteScalarAsync();
                            if (Id == null)
                            {
                                await transaction.RollbackAsync();
                                return TransferResult.TargetAccountNotFound;
                            }
                            targetAccountId = (int)Id;
                            if (targetAccountId == transferAmount.SourceAccountId)
                            {
                                await transaction.RollbackAsync();
                                return TransferResult.CannotTransferToSelf;
                            }
                        }
                        string Updatesql = @"
                                        Update Accounts Set Balance = Balance - @amount
                                        where AccountId = @aid and UserId = @uid and AccountStatus = 'Active'
                                        and Balance >= @amount;
                                        ";
                        using (var updatecmd = new SqlCommand(Updatesql, connect, transaction))
                        {
                            updatecmd.Parameters.AddWithValue("@aid", transferAmount.SourceAccountId);
                            updatecmd.Parameters.AddWithValue("@uid", userid);
                            updatecmd.Parameters.AddWithValue("@amount", transferAmount.Amount);
                            int rows = await updatecmd.ExecuteNonQueryAsync();
                            if (rows == 0)
                            {
                                await transaction.RollbackAsync();
                                return TransferResult.InsufficientFunds; //Insufficient Balance.
                            }
                            else
                            {
                                string UpdateTargetSql = @"
                                                UPDATE Accounts SET Balance = Balance + @amount WHERE AccountId = @targetId
                                                ";
                                using (var Depositcmd = new SqlCommand(UpdateTargetSql, connect, transaction))
                                {
                                    Depositcmd.Parameters.AddWithValue("@amount", transferAmount.Amount);
                                    Depositcmd.Parameters.AddWithValue("@targetId", targetAccountId);

                                    await Depositcmd.ExecuteNonQueryAsync();
                                }
                                string targetname = "";
                                string sourcename = "";
                                string GetNameSql = @"
                                        SELECT 
                                        (SELECT cp.FullName FROM CustomerProfiles cp JOIN Accounts a ON cp.UserId = a.UserId WHERE a.AccountId = @targetId) as TargetName,
                                        (SELECT cp.FullName FROM CustomerProfiles cp JOIN Accounts a ON cp.UserId = a.UserId WHERE a.AccountId = @sourceId) as SourceName";
                                ;
                                using (var GetNamecmd = new SqlCommand(GetNameSql, connect, transaction))
                                {
                                    GetNamecmd.Parameters.AddWithValue("@targetId", targetAccountId);
                                    GetNamecmd.Parameters.AddWithValue("@sourceId", transferAmount.SourceAccountId);
                                    using (var reader = await GetNamecmd.ExecuteReaderAsync())
                                    {
                                        if (await reader.ReadAsync())
                                        {
                                            targetname = reader["TargetName"].ToString()! ?? "UNKNOWN";
                                            sourcename = reader["SourceName"].ToString()! ?? "UNKNOWN";
                                        }
                                    }
                                }
                                string FinalSql = @"
                                        INSERT INTO Transactions 
                                        (AccountId, TransactionType, Amount, DestinationAccountId, Status,MerchantName) 
                                        VALUES (@sourceId, 'Transfer', @amount, @targetId, 'Completed',@senderMerchant);

                                        INSERT INTO Transactions 
                                        (AccountId, TransactionType, Amount, DestinationAccountId, Status,MerchantName) 
                                        VALUES (@targetId, 'Transfer', @amount, @sourceId, 'Completed',@receiverMerchant);
                                        ";
                                using (var finalcmd = new SqlCommand(FinalSql, connect, transaction))
                                {
                                    string sender = "TRANSFER_OUT_TO_" + targetname.ToUpper().Replace(" ", "_");
                                    string reciever = "TRANSFER_IN_FROM_" + sourcename.ToUpper().Replace(" ", "_");
                                    finalcmd.Parameters.AddWithValue("@sourceId", transferAmount.SourceAccountId);
                                    finalcmd.Parameters.AddWithValue("@targetId", targetAccountId);
                                    finalcmd.Parameters.AddWithValue("@amount", transferAmount.Amount);
                                    finalcmd.Parameters.AddWithValue("@senderMerchant", sender);
                                    finalcmd.Parameters.AddWithValue("@receiverMerchant", reciever);

                                    await finalcmd.ExecuteNonQueryAsync();
                                }
                            }
                        }
                        await transaction.CommitAsync();
                        return TransferResult.Success;
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine(ex.Message.ToString());
                        await transaction.RollbackAsync();
                        return TransferResult.SystemError;
                    }
                }
            }
        }
        public async Task<int> GetUserIdFromAccountIdAsync(long AccountNumber)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                            Select UserId from Accounts
                            where AccountNumber = @accnum and AccountStatus = 'Active';
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@accnum", AccountNumber);
                        var result = await cmd.ExecuteScalarAsync();
                        if (result != null && result != DBNull.Value)
                        {
                            return Convert.ToInt32(result);
                        }
                        return 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return 0;
            }
        }

        public async Task<List<TransactionReceipt>> GetTransactionReceiptsAsync(int userid)
        {
            var transactionReceipt = new List<TransactionReceipt>();
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                    Select 
                    t.TransactionDate,
                    t.AccountId,
                    t.TransactionType,
                    t.Amount,
                    t.Status,
                    t.DestinationAccountId,
                    t.MerchantName
                    from Transactions t
                    Inner Join Accounts a on t.AccountId = a.AccountId 
                    where a.UserId = @uid
                    Order by t.TransactionDate DESC
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@uid", userid);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            transactionReceipt.Add(new TransactionReceipt
                            {
                                TransactionDate = Convert.ToDateTime(reader["TransactionDate"]),
                                AccountId = Convert.ToInt32(reader["AccountId"]),
                                TransactionType = reader["TransactionType"].ToString(),
                                Amount = Convert.ToDecimal(reader["Amount"]),
                                Status = reader["Status"].ToString(),
                                DestinationAccountId = reader["DestinationAccountId"] == DBNull.Value ? null : (int)reader["DestinationAccountId"],
                                MerchantName = reader["MerchantName"].ToString()
                            });
                        }
                    }
                }
            }
            return transactionReceipt;
        }

        public async Task<int> ApplyDailyInterestToSavingsAsync()
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                        BEGIN TRAN;
                            UPDATE a
                            SET a.Balance = a.Balance + (a.Balance * s.InterestRate / 365)
                            FROM Accounts a
                            JOIN SavingsDetails s ON a.AccountId = s.AccountId
                            WHERE a.AccountType = 'Savings' 
                                AND a.AccountStatus = 'Active' 
                                AND s.LastInterestAppliedDate < CAST(GETDATE() AS DATE);

                            UPDATE s
                            SET s.LastInterestAppliedDate = CAST(GETDATE() AS DATE)
                            FROM SavingsDetails s
                            JOIN Accounts a ON s.AccountId = a.AccountId
                            WHERE a.AccountType = 'Savings' 
                                AND a.AccountStatus = 'Active' 
                                AND s.LastInterestAppliedDate < CAST(GETDATE() AS DATE);
                        COMMIT TRAN;
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    int rows = await cmd.ExecuteNonQueryAsync();
                    return rows;
                }
            }
        }
        public async Task<int> TakeDailyDepositAmountAsync()
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                        Begin TRAN
                        Update a
                        Set a.Balance = a.Balance - d.DailyAmount 
                        from Accounts a
                        join DailyDepositDetails d on a.AccountId = d.AccountId
                        where a.AccountType = 'DailyDeposit' 
                            and a.AccountStatus = 'Active'
                            and d.LastProcessedDate < CAST(GETDATE() as DATE);

                        Update d
                        Set d.LastProcessedDate	 = CAST(GETDATE() as DATE),d.TotalReceivedAmount += d.DailyAmount
                        from DailyDepositDetails d
                        join Accounts a on d.AccountId = a.AccountId
                        where a.AccountType = 'DailyDeposit'
                            and a.AccountStatus = 'Active'
                            and d.LastProcessedDate < CAST(GETDATE() as DATE);
                        Commit Tran
                ";
                using (var cmd = new SqlCommand(sql,connect))
                {
                    int rows = await cmd.ExecuteNonQueryAsync();
                    return rows;
                }
            }
        }
    }
}
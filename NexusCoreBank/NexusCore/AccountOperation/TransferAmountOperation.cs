using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualBasic;
using NexusCore.TransferDto;

namespace NexusCore.AccountOperation
{
    public class MoneyTransfer
    {
        private readonly string? conn;
        public MoneyTransfer(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public int TransferAccount(int userid, TransferAmount transferAmount)
        {
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                var transaction = connect.BeginTransaction();
                try
                {
                    string checksql = @"
                                    select AccountId from Accounts
                                    where AccountNumber = @accnum and AccountStatus = 'Active';
                                    ";
                    int AccountId = 0;
                    using (var checkcmd = new SqlCommand(checksql, connect, transaction))
                    {
                        checkcmd.Parameters.AddWithValue("@accnum", transferAmount.TargetAccountNumber);
                        var Id = checkcmd.ExecuteScalar();
                        if (Id == null)
                        {
                            transaction.Rollback();
                            return 2;
                        }
                        AccountId = (int)Id;
                        if (AccountId == transferAmount.SourceAccountId)
                        {
                            transaction.Rollback();
                            return 4;
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
                        int rows = updatecmd.ExecuteNonQuery();
                        if (rows == 0)
                        {
                            transaction.Rollback();
                            return 3; //Insufficient Balance.
                        }
                        else
                        {
                            string DepositSql = @"
                                                UPDATE Accounts SET Balance = Balance + @amount WHERE AccountId = @targetId
                                                ";
                            using (var Depositcmd = new SqlCommand(DepositSql, connect, transaction))
                            {
                                Depositcmd.Parameters.AddWithValue("@amount", transferAmount.Amount);
                                Depositcmd.Parameters.AddWithValue("@targetId", AccountId);

                                Depositcmd.ExecuteNonQuery();
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
                                GetNamecmd.Parameters.AddWithValue("@targetId", AccountId);
                                GetNamecmd.Parameters.AddWithValue("@sourceId", transferAmount.SourceAccountId);
                                using (var reader = GetNamecmd.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        targetname = reader["TargetName"].ToString()!;
                                        sourcename = reader["SourceName"].ToString()!;
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
                                finalcmd.Parameters.AddWithValue("@targetId", AccountId);
                                finalcmd.Parameters.AddWithValue("@amount", transferAmount.Amount);
                                finalcmd.Parameters.AddWithValue("@senderMerchant", sender);
                                finalcmd.Parameters.AddWithValue("@receiverMerchant", reciever);

                                finalcmd.ExecuteNonQuery();
                            }
                        }
                    }
                    transaction.Commit();
                    return 1;
                }
                catch (System.Exception)
                {
                    transaction.Rollback();
                    return 5;
                }
            }
        }
    }
}
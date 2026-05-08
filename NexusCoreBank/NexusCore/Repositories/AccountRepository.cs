using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.AccountDisplayDto;
using NexusCore.DepositDto;
using NexusCore.OpenAccountsDto;
using NexusCore.TransferDto;
using System.Collections.Generic;

namespace NexusCore.AccountRepositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly string? conn;
        public AccountRepository(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public async Task<bool> CreateNewAccountAsync(int userid, OpenAccount openAccount)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                using (var transaction = (SqlTransaction)await connect.BeginTransactionAsync())
                {
                    try
                    {
                        long Uniqueseq;
                        string seqsql = "SELECT NEXT VALUE FOR AccountNumberSeq;"; //Getting the next value from database.
                        using (var seqcmd = new SqlCommand(seqsql, connect, transaction))
                        {
                            var result = await seqcmd.ExecuteScalarAsync();
                            if (result == null && result == DBNull.Value)
                                throw new Exception("Failed to get sequence value.");

                            Uniqueseq = Convert.ToInt64(result);

                        }
                        string Branchcode = "4443"; //Branch code
                        string typecode = openAccount.AccountType.ToLower() switch // type code for specific accounts
                        {
                            "savings" => "10",
                            "current" => "20",
                            "fixeddeposit" => "30",
                            "recurringdeposit" => "40",
                            "loan" => "50",
                            "dailydeposit" => "60",
                            _ => "99",
                        };
                        string seqstring = Uniqueseq.ToString("D7"); //Formatting the sequence

                        int checksum = (int)(Uniqueseq % 10); //last digit value

                        string finalAccountNumber = $"{Branchcode}{typecode}{seqstring}{checksum}"; // finaling the account number

                        long smartAccountNumber = Convert.ToInt64(finalAccountNumber); //casting the accountnumber
                        string sql = @"
                                Insert into Accounts(UserId,AccountNumber,AccountType,Balance,AccountStatus,SourceOfFunds,NomineeName,NomineeRelationship)
                                OUTPUT Inserted.AccountId
                                Values(@id,@smartAccNum,@acctype,@balance,'Pending',@sourceoffunds,@nominee,@relation)
                    ";
                        int newAccountId;
                        using (var cmd = new SqlCommand(sql, connect, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", userid);
                            cmd.Parameters.AddWithValue("@smartAccNum", smartAccountNumber);
                            cmd.Parameters.AddWithValue("@acctype", openAccount.AccountType);
                            cmd.Parameters.AddWithValue("@balance", openAccount.InitialDeposit);
                            cmd.Parameters.AddWithValue("@sourceoffunds", openAccount.SourceofFunds);
                            cmd.Parameters.AddWithValue("@nominee", openAccount.NomineeName);
                            cmd.Parameters.AddWithValue("@relation", openAccount.NomineeRelationship);

                            var row = await cmd.ExecuteScalarAsync();
                            newAccountId = (int)row!;
                        }
                        if (openAccount.AccountType == "Savings")
                        {
                            string insertquery = @"
                                    Insert into SavingsDetails(AccountId,InterestRate)
                                    Values (@newAccid,0.04);
                            ";
                            using (var savcmd = new SqlCommand(insertquery, connect, transaction))
                            {
                                savcmd.Parameters.AddWithValue("@newAccid", newAccountId);
                                await savcmd.ExecuteNonQueryAsync();
                            }
                        }
                        else if (openAccount.AccountType == "Current")
                        {
                            string insertquery = @"
                                    Insert into CurrentDetails(AccountId,OverDraftLimit, OverdraftFee)
                                    Values (@newAccid,0.00,500.00);
                            ";
                            using (var savcmd = new SqlCommand(insertquery, connect, transaction))
                            {
                                savcmd.Parameters.AddWithValue("@newAccid", newAccountId);
                                await savcmd.ExecuteNonQueryAsync();
                            }
                        }
                        else if (openAccount.AccountType == "FixedDeposit" && openAccount.TermDuration.HasValue)
                        {
                            string insertquery = @"
                                    Insert into FixedDepositDetails(AccountId,MaturityDate,InterestRate,PenaltyRate)
                                    Values (@newAccid,@MaturityDate, @InterestRate, 0.02);
                            ";
                            using (var savcmd = new SqlCommand(insertquery, connect, transaction))
                            {
                                DateTime maturitydate = DateTime.Now.AddMonths(openAccount.TermDuration.Value);
                                decimal InterestRate = openAccount.TermDuration.Value == 6 ? 0.055m :
                                                        openAccount.TermDuration.Value == 12 ? 0.07m : 0.085m;
                                savcmd.Parameters.AddWithValue("@newAccid", newAccountId);
                                savcmd.Parameters.AddWithValue("@MaturityDate", maturitydate);
                                savcmd.Parameters.AddWithValue("@InterestRate", InterestRate);
                                await savcmd.ExecuteNonQueryAsync();
                            }
                        }
                        else if (openAccount.AccountType == "RecurringDeposit" && openAccount.TermDuration.HasValue)
                        {
                            string insertRDSql = @"
                                INSERT INTO RecurringDepositDetails (AccountId, MaturityDate, InterestRate, MonthlyInstallment)
                                VALUES (@AccountId, @MaturityDate, @InterestRate, @MonthlyInstallment);";

                            using (var rdCmd = new SqlCommand(insertRDSql, connect, transaction))
                            {
                                DateTime maturityDate = DateTime.Now.AddMonths(openAccount.TermDuration.Value);

                                decimal interestRate = openAccount.TermDuration.Value == 6 ? 0.050m :
                                                       openAccount.TermDuration.Value == 12 ? 0.065m : 0.080m;

                                rdCmd.Parameters.AddWithValue("@AccountId", newAccountId);
                                rdCmd.Parameters.AddWithValue("@MaturityDate", maturityDate);
                                rdCmd.Parameters.AddWithValue("@InterestRate", interestRate);

                                rdCmd.Parameters.AddWithValue("@MonthlyInstallment", openAccount.InitialDeposit);

                                await rdCmd.ExecuteNonQueryAsync();
                            }
                        }
                        else if (openAccount.AccountType == "Loan" && openAccount.TermDuration.HasValue)
                        {
                            string insertLoanSql = @"
                                INSERT INTO LoanDetails (AccountId, PrincipalAmount, InterestRate, TermInMonths, EMI, NextPaymentDueDate)
                                VALUES (@AccountId, @Principal, @InterestRate, @Term, @EMI, @NextPayment);";

                            using (var loanCmd = new SqlCommand(insertLoanSql, connect, transaction))
                            {
                                decimal annualRate = 0.105m;

                                double p = (double)openAccount.InitialDeposit;
                                double r = (double)annualRate / 12;
                                int n = openAccount.TermDuration.Value;

                                double emi = (p * r * Math.Pow(1 + r, n)) / (Math.Pow(1 + r, n) - 1);

                                DateTime nextPayment = DateTime.Now.AddMonths(1);

                                loanCmd.Parameters.AddWithValue("@AccountId", newAccountId);
                                loanCmd.Parameters.AddWithValue("@Principal", openAccount.InitialDeposit);
                                loanCmd.Parameters.AddWithValue("@InterestRate", annualRate);
                                loanCmd.Parameters.AddWithValue("@Term", openAccount.TermDuration.Value);
                                loanCmd.Parameters.AddWithValue("@EMI", (decimal)emi);
                                loanCmd.Parameters.AddWithValue("@NextPayment", nextPayment);

                                await loanCmd.ExecuteNonQueryAsync();
                            }
                        }
                        else if (openAccount.AccountType == "DailyDeposit" && openAccount.DailyAmount.HasValue)
                        {
                            string insertdailyAmount = @"
                                Insert into DailyDepositDetails(AccountId,DailyAmount,IsActive)
                                Values(@AccountId,@dailyAmount,1);
                            ";
                            using (var dailycmd = new SqlCommand(insertdailyAmount, connect,transaction))
                            {
                                dailycmd.Parameters.AddWithValue("@AccountId", newAccountId);
                                dailycmd.Parameters.AddWithValue("@dailyAmount", openAccount.DailyAmount);
                                await dailycmd.ExecuteNonQueryAsync();
                            }
                        }
                        else
                        {
                            await transaction.RollbackAsync();
                            return false;
                        }
                        await transaction.CommitAsync();
                        return true;
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
        public async Task<List<DisplayAccount>> GetAccount(int userid)
        {
            List<DisplayAccount> displayAccounts = new List<DisplayAccount>();
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                            select 
                            c.FullName,
                            a.AccountId,
                            a.AccountNumber,
                            a.AccountType,
                            a.Balance,
                            a.AccountStatus
                            from Accounts a
                            join Users u on a.UserId = u.UserId
                            join CustomerProfiles c on u.UserId = c.UserId
                            where a.UserId = @uid;
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@uid", userid);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        int iFullName = reader.GetOrdinal("FullName");
                        int iAccountId = reader.GetOrdinal("AccountId");
                        int iAccountNumber = reader.GetOrdinal("AccountNumber");
                        int iAccountType = reader.GetOrdinal("AccountType");
                        int iBalance = reader.GetOrdinal("Balance");
                        int iStatus = reader.GetOrdinal("AccountStatus");
                        while (await reader.ReadAsync())
                        {
                            displayAccounts.Add(new DisplayAccount
                            {
                                FullName = reader.GetString(iFullName),
                                AccountId = reader.GetInt32(iAccountId),
                                AccountNumber = reader.GetInt64(iAccountNumber),
                                AccountType = reader.GetString(iAccountType),
                                Balance = reader.GetDecimal(iBalance),
                                Status = reader.GetString(iStatus)
                            });
                        }
                    }
                }
            }
            return displayAccounts;
        }

        public async Task<long> GetCurrentBalanceAsync(int accountid)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                            Select Balance from Accounts where AccountId = @accid and AccountStatus = 'Active';
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@accid", accountid);
                        var result = await cmd.ExecuteScalarAsync();
                        if (result == null || result == DBNull.Value)
                        {
                            throw new Exception("Account Not Found!!");
                        }
                        return Convert.ToInt64(result);
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                throw;
            }
        }
    }
}

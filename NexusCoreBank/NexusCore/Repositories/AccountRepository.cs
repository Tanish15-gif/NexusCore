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
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    long Uniqueseq;
                    string seqsql = "SELECT NEXT VALUE FOR AccountNumberSeq;"; //Getting the next value from database.
                    using(var seqcmd = new SqlCommand(seqsql,connect))
                    {
                        var result = await seqcmd.ExecuteScalarAsync();
                        if(result == null && result == DBNull.Value)
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
                        _ => "99",
                    };
                    string seqstring = Uniqueseq.ToString("D7"); //Formatting the sequence

                    int checksum = (int)(Uniqueseq % 10); //last digit value

                    string finalAccountNumber = $"{Branchcode}{typecode}{seqstring}{checksum}"; // finaling the account number

                    long smartAccountNumber = Convert.ToInt64(finalAccountNumber); //casting the accountnumber
                    string sql = @"
                                Insert into Accounts(UserId,AccountNumber,AccountType,Balance,AccountStatus)
                                Values(@id,@smartAccNum,@acctype,@balance,'Pending')
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@id", userid);
                        cmd.Parameters.AddWithValue("@smartAccNum",smartAccountNumber);
                        cmd.Parameters.AddWithValue("@acctype", openAccount.AccountType);
                        cmd.Parameters.AddWithValue("@balance", openAccount.InitialDeposit);

                        int rows = await cmd.ExecuteNonQueryAsync();
                        return rows > 0 ? true : false;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
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

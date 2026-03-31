using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.DepositDto;

namespace NexusCore.AccountOperation
{
    public class AmountDeposit
    {
        private readonly string? conn;
        public AmountDeposit(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public string DepositAccount(int userid, DepositAmount deposit)
        {
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                int dailyCount = 0;
                string velocitysql = @"
                                    select Count(*) from Transactions 
                                    where AccountId = @aid and TransactionType = 'Deposit' and 
                                    Status = 'Completed' and TransactionDate >= DATEADD(DAY,-1,GETDATE());
                ";
                using (var velocitycmd = new SqlCommand(velocitysql, connect))
                {
                    velocitycmd.Parameters.AddWithValue("@aid", deposit.AccountId);
                    dailyCount = (int)velocitycmd.ExecuteScalar();
                }
                if (deposit.Amount > 50000 || dailyCount >= 3)
                {
                    string sql = @"
                                Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                values(@aid,'Deposit',@amount,'Pending','SYSTEM_DEPOSIT');
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@aid", deposit.AccountId);
                        cmd.Parameters.AddWithValue("@amount", deposit.Amount);

                        cmd.ExecuteNonQuery();
                        return "Pending";
                    }
                }
                else
                {
                    var transaction = connect.BeginTransaction();
                    try
                    {
                        string sql = @"
                        Update Accounts 
                        set Balance = Balance + @amount 
                        where AccountId = @aid and  UserId = @uid and AccountStatus = 'Active'";
                        using (var cmd = new SqlCommand(sql, connect, transaction))
                        {
                            cmd.Parameters.AddWithValue("@uid", userid);
                            cmd.Parameters.AddWithValue("@aid", deposit.AccountId);
                            cmd.Parameters.AddWithValue("@amount", deposit.Amount);

                            int rows = cmd.ExecuteNonQuery();
                            if (rows > 0)
                            {
                                string transactionsql = @"
                                        Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                        Values(@aid,'Deposit',@amount,'Completed','SYSTEM_DEPOSIT');
                                        ";
                                using (var insertcmd = new SqlCommand(transactionsql, connect, transaction))
                                {
                                    insertcmd.Parameters.AddWithValue("@aid", deposit.AccountId);
                                    insertcmd.Parameters.AddWithValue("@amount", deposit.Amount);

                                    insertcmd.ExecuteNonQuery();
                                }
                                transaction.Commit();
                                return "Completed";
                            }
                            else
                            {
                                transaction.Rollback();
                                return "Failed";
                            }
                        }
                    }
                    catch (SqlException)
                    {
                        transaction.Rollback();
                        return "Failed";
                    }
                }
            }
        }
    }
}
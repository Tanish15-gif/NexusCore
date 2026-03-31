using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.DepositDto;

namespace NexusCore.AccountOperation
{
    public class AmountWithdraw
    {
        private readonly string? conn;
        public AmountWithdraw(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool WithdrawAmount(int userid, DepositAmount amount)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                var transaction = connect.BeginTransaction();
                try
                {
                    Console.WriteLine($"UID: {userid}, AID: {amount.AccountId}, AMOUNT: {amount.Amount}");
                    string sql = @"
                                Update Accounts Set Balance = Balance - @amount
                                where AccountId = @aid and UserId = @uid and AccountStatus = 'Active' and Balance >= @amount;
                                ";
                    using (var cmd = new SqlCommand(sql,connect,transaction))
                    {
                        cmd.Parameters.AddWithValue("@aid",amount.AccountId);
                        cmd.Parameters.AddWithValue("@uid",userid);
                        cmd.Parameters.AddWithValue("@amount",amount.Amount);

                        int rows = cmd.ExecuteNonQuery();
                        if(rows > 0)
                        {
                            Console.WriteLine(amount.MerchantName);
                            string transactionsql = @"
                                            Insert into Transactions(AccountId,TransactionType,Amount,Status,MerchantName)
                                            Values(@aid,'Withdrawal',@amount,'Completed',@merchant);
                                            ";
                            using(var inscmd = new SqlCommand(transactionsql,connect,transaction))
                            {
                                inscmd.Parameters.AddWithValue("@aid",amount.AccountId);
                                inscmd.Parameters.AddWithValue("@amount",amount.Amount);
                                inscmd.Parameters.AddWithValue("@merchant",amount.MerchantName ?? "SYSTEM_WITHDRAW");
                                
                                inscmd.ExecuteNonQuery();
                            }
                            transaction.Commit();
                            return true;
                        }   
                        else
                        {
                            transaction.Rollback();
                            return false;
                        }
                    }
                }
                catch (SqlException)
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }
    }
}
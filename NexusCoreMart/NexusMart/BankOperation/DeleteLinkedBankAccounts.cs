using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace NexusMart.BankAccountOperation
{
    public class DisconnectBank
    {
        private readonly string? conn;
        public DisconnectBank(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool DeleteBank(int customerid, long AccountNumber)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                            Delete From LinkedBankAccounts
                            where CustomerId = @cid and NexusCoreAccountNumber = @accNum;
                ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@cid", customerid);
                        cmd.Parameters.AddWithValue("@accNum", AccountNumber);
                        int rows = cmd.ExecuteNonQuery();

                        if (rows > 0)
                        {
                            return true;
                        }
                    }
                    return false;
                }
            }
            catch (SqlException)
            {
                return false;
            }

        }
    }
}
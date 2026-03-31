using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.OpenAccountsDto;

namespace NexusCore.AccountOperation
{
    public class CreateAccount
    {
        private readonly string? conn;
        public CreateAccount(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool CreateNewAccount(int userid, OpenAccount openAccount)
        {
            Random random = new Random();
            long AccountNumber = random.NextInt64(1000000000L, 10000000000L);
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                            Insert into Accounts(UserId,AccountNumber,AccountType,Balance,AccountStatus)
                            Values(@id,@AccNum,@acctype,@balance,'Pending')";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@id", userid);
                        cmd.Parameters.AddWithValue("@AccNum", AccountNumber);
                        cmd.Parameters.AddWithValue("@acctype", openAccount.AccountType);
                        cmd.Parameters.AddWithValue("@balance", openAccount.InitialDeposit);

                        int rows = cmd.ExecuteNonQuery();
                        if (rows > 0)
                        {
                            return true;
                        }
                    }
                }
                return false;
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
    }
}
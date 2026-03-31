using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.ShowAllCustomerInManagerDto;

namespace NexusCore.ManagerOperation
{
    public class ListManager
    {
        private readonly string? conn;
        public ListManager(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool FreezeAccount(long accountNumber)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            UPDATE Accounts SET AccountStatus = 'Frozen'
                            WHERE AccountNumber = @accNum AND AccountStatus != 'Closed' AND AccountStatus != 'Frozen'
                            ";
                using(var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@accNum",accountNumber);
                    int rows = cmd.ExecuteNonQuery();
                    if(rows > 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        public bool UnFreezeAccount(long accountNumber)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            UPDATE Accounts SET AccountStatus = 'Active'
                            WHERE AccountNumber = @accNum AND AccountStatus = 'Frozen';
                            ";
                using(var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@accNum",accountNumber);
                    int rows = cmd.ExecuteNonQuery();
                    if(rows > 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        public bool UpdateCustomerEmail(int accountid,string newEmail)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Update Users Set Email = @email where UserId = (Select UserId From Accounts Where AccountId = @aid);
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@email",newEmail);
                    cmd.Parameters.AddWithValue("@aid",accountid);
                    
                    int rows = cmd.ExecuteNonQuery();
                    if(rows > 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
    }
}
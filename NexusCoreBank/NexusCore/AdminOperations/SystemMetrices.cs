using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.SystemMetricesDto;

namespace NexusCore.AdminOperation
{
    public class SystemInfo
    {
        private readonly string? conn;
        public SystemInfo(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public SystemMetrices GetSystemInfo()
        {
            SystemMetrices systemMetrices = new SystemMetrices();   
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                    select
                        (Select Count(*) from Users) as TotalUsers,
                        (Select ISNULL(Sum(Balance),0) from Accounts) as TotalBalance,
                        (select count(*) from Accounts where AccountStatus = 'Frozen') as TotalFreeze;
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    using(var reader = cmd.ExecuteReader())
                    {
                        if(reader.Read())
                        {
                            systemMetrices.TotalUsers = Convert.ToInt32(reader["TotalUsers"]);
                            systemMetrices.TotalLiquidity = Convert.ToDecimal(reader["TotalBalance"]);
                            systemMetrices.TotalFrozenAccounts = Convert.ToInt32(reader["TotalFreeze"]);   
                        }
                    }
                }
            }
            return systemMetrices;
        }
    }
}
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.EmployeeDetailsDto;

namespace NexusCore.EmployeeOperation
{
    public class FetchEmployee
    {
        private readonly string? conn;
        public FetchEmployee(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public EmpDetails? FetchDetails(int userid)
        {
            EmpDetails details = new EmpDetails();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select e.EmployeeId,e.EmployeeName
                            from EmployeeProfiles e
                            join Users u on e.UserId = u.UserId
                            where u.UserId = @uid;
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@uid",userid);
                    using(var reader = cmd.ExecuteReader())
                    {
                        if(reader.Read())
                        {
                            details.Userid = userid;
                            details.EmployeeId = (int)reader["EmployeeId"];
                            details.FullName = reader["EmployeeName"].ToString();
                            return details;
                        }
                    }
                }
            }
            return null;
        }
    }
}
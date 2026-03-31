using Microsoft.Data.SqlClient;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using NexusCore.UserSignupDto;
using System.Transactions;
using System.Diagnostics;

namespace NexusCore.AdminOperation
{
    public class StaffRegistration
    {
        public readonly string? conn;
        public StaffRegistration(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool RegisterStaff(SignUpUsers signUp)
        {
            string PasswordHash = BCrypt.Net.BCrypt.HashPassword(signUp.Password);
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                var transaction = connect.BeginTransaction();
                try
                {
                    string sql = @"
                            Insert into Users(Email,PasswordHash,Role)
							Output Inserted.UserId
							values(@email,@password,@role);							
                            ";
                    int userid;
                    using(var cmd = new SqlCommand(sql,connect,transaction))
                    {
                        cmd.Parameters.AddWithValue("@email",signUp.Email);
                        cmd.Parameters.AddWithValue("@password",PasswordHash);
                        cmd.Parameters.AddWithValue("@role",signUp.Role);
                        
                        userid = (int)cmd.ExecuteScalar();
                    }
                    string profile = @"
                            insert into EmployeeProfiles(UserId,EmployeeName,Department)
							values(@UserId,@emp,@dept)";
                    using(var cmd = new SqlCommand(profile,connect,transaction))
                    {
                        cmd.Parameters.AddWithValue("@UserId",userid);
                        cmd.Parameters.AddWithValue("@emp",signUp.FullName);
                        cmd.Parameters.AddWithValue("@dept",signUp.Department);
                        cmd.ExecuteNonQuery();
                    }
                    transaction.Commit();
                    return true;
                }
                catch (SqlException )
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }
    }
}
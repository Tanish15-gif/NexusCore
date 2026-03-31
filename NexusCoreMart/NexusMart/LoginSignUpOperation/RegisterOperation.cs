using Microsoft.Data.SqlClient;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using NexusMart.RegisterDto;

namespace NexusMart.LoginSignUpOperation
{
    public class SignUpUser
    {
        private readonly string? conn;
        public SignUpUser(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public int RegisterUser(SignUp signUp)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string EmailQuery = "select Count(*) from MartCustomers where Email = @email";
                    using (var cmd = new SqlCommand(EmailQuery, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", signUp.Email);
                        int count = (int)cmd.ExecuteScalar();
                        if (count > 0)
                        {
                            return 2;
                        }
                    }
                    string hashpassword = BCrypt.Net.BCrypt.HashPassword(signUp.Password);
                    string sql = @"
                            Insert into MartCustomers(FullName,Email,PasswordHash,Role)
                            values(@name,@email,@password,'Customer');
                            ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        
                        cmd.Parameters.AddWithValue("@name", signUp.Name);
                        cmd.Parameters.AddWithValue("@email", signUp.Email);
                        cmd.Parameters.AddWithValue("@password", hashpassword);

                        int rows = cmd.ExecuteNonQuery();

                        return rows > 0 ? 1 : 0;
                    }
                }
            }
            catch (SqlException)
            {
                return 0;
            }

        }
    }
}
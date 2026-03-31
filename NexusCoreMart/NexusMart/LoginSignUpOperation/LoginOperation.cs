using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;
using NexusMart.LoginDto;
using NexusMart.LoginResponseDto;

namespace NexusMart.LoginSignUpOperation
{
    public class LoginUser
    {
        private readonly string? conn;
        public LoginUser(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public LoginResponse Login(Login login)
        {
            var result = new LoginResponse();
            if (string.IsNullOrEmpty(login.Email) || string.IsNullOrEmpty(login.Password))
            {
                result.Success = false;
                return result;
            }
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = "Select CustomerId,PasswordHash,Role from MartCustomers where Email = @email";
                    string? storedpass = null;
                    int userid = 0;
                    string? role = null;
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", login.Email);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                userid = (int)reader["CustomerId"];
                                storedpass = reader["PasswordHash"].ToString()!;
                                role = reader["Role"].ToString();
                            }
                            else
                            {
                                result.Success = false;
                                return result;
                            }
                        }
                    }
                    if (string.IsNullOrEmpty(storedpass))
                    {
                        result.Success = false;
                        return result;
                    }
                    bool isPass = BCrypt.Net.BCrypt.Verify(login.Password, storedpass);
                    if (isPass)
                    {
                        result.Success = true;
                        result.UserId = userid;
                        result.Role = role;
                        return result;
                    }
                    else
                    {
                        result.Success = false;
                    }
                    return result;
                }
            }
            catch (SqlException)
            {
                result.Success = false;
                return result;
            }
        }
    }
}
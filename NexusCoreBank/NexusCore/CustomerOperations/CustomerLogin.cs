using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.CustomerLoginDTO;
using BCrypt.Net;
using NexusCore.LoginResponseDto;

namespace NexusCore.CustomerOperation
{
    public class CustomerLogin
    {
        private readonly string? conn;
        public CustomerLogin(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public LoginResponse Login(LogIn logIn)
        {
            var result = new LoginResponse();
            if (string.IsNullOrEmpty(logIn.Email) || string.IsNullOrEmpty(logIn.Password))
            {
                result.Success = false;
                return result;
            }
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = "Select UserId,PasswordHash,Role from Users where Email = @email";
                    string? storedpass = null;
                    int userid = 0;
                    string? role = null;
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", logIn.Email);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                userid = (int)reader["UserId"];
                                storedpass = reader["PasswordHash"].ToString()!;
                                role = reader["Role"].ToString()!;
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
                    bool isPass = BCrypt.Net.BCrypt.Verify(logIn.Password, storedpass);
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
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                result.Success = false;
                return result;
            }
        }
    }
}
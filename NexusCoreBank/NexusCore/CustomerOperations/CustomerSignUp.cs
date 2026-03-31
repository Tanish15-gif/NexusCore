using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;
using NexusCore.CustomerSignIn;

namespace NexusCore.CustomerOperation
{
    public class RegistrationOperation
    {
        private readonly string? conn;
        public RegistrationOperation(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public int RegisterCustomer(Register register)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string EmailQuery = "select Count(*) from Users where Email = @email";
                    using (var cmd = new SqlCommand(EmailQuery, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", register.Email);
                        int count = (int)cmd.ExecuteScalar();
                        if (count > 0)
                        {
                            return 2;  
                        }
                    }
                    string hashpassword = BCrypt.Net.BCrypt.HashPassword(register.Password);
                    string sql = @"
                            begin try
                                begin transaction
                                    Insert into Users(Email,PasswordHash,Role) 
                                    values(@email,@password,'Customer');
                                    Declare @NewUserId INT =  SCOPE_IDENTITY();

                                    insert into CustomerProfiles(UserId,FullName,DateofBirth,PhoneNumber,Address)
                                    values(@NewUserId,@name,@dob,@phone,@address)
                                COMMIT TRANSACTION
                            end try

                            begin catch
                                ROLLBACK TRANSACTION
                                Throw
                            end catch
                            ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", register.Email);
                        cmd.Parameters.AddWithValue("@password", hashpassword);
                        cmd.Parameters.AddWithValue("@name", register.FullName);
                        cmd.Parameters.AddWithValue("@dob", register.DateofBirth);
                        cmd.Parameters.AddWithValue("@phone", register.PhoneNumber);
                        cmd.Parameters.AddWithValue("@address", register.Address);

                        int rows = cmd.ExecuteNonQuery();

                        return rows > 0 ? 1 : 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return 0;
            }
        }
    }
}
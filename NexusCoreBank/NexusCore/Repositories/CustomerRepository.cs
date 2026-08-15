using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerSignIn;
using NexusCore.LoginResponseDto;
using System.Threading.Tasks;
using BCrypt.Net;
using NexusCore.UpdatePersonalInformation;

namespace NexusCore.CustomerRepositories
{
    public class CustomerRepository : ICustomerRepositories
    {
        private readonly string? conn;
        public CustomerRepository(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = "Select Count(1) From Users where Email = @email";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", email);
                        var result = await cmd.ExecuteScalarAsync();
                        return (int)result! > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return true;
            }
        }
        public async Task<bool> CheckPhoneNumberExistsAsync(string phoneNumber)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = "Select Count(1) From CustomerProfiles where PhoneNumber = @phone";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@phone", phoneNumber);
                        var result = await cmd.ExecuteScalarAsync();
                        return (int)result! > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return true;
            }
        }
        public async Task<bool> CompleteUserRegistration(Register register)
        {
            try
            {
                string storedPass = BCrypt.Net.BCrypt.HashPassword(register.Password);
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
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
                        cmd.Parameters.AddWithValue("@password", storedPass);
                        cmd.Parameters.AddWithValue("@name", register.FullName);
                        cmd.Parameters.AddWithValue("@dob", register.DateofBirth);
                        cmd.Parameters.AddWithValue("@phone", register.PhoneNumber);
                        cmd.Parameters.AddWithValue("@address", register.Address);
                        int result = await cmd.ExecuteNonQueryAsync();

                        return result > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
        public async Task<LoginResponse> UserLoginAsync(LogIn logIn)
        {
            var result = new LoginResponse();
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = "Select UserId,PasswordHash,Role from Users where Email = @email";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", logIn.Email);
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                int userid = (int)reader["UserId"];
                                string storedpass = reader["PasswordHash"].ToString()!;
                                string role = reader["Role"].ToString()!;

                                if (BCrypt.Net.BCrypt.Verify(logIn.Password, storedpass))
                                {
                                    result.status = CustomerLoginResult.Success;
                                    result.UserId = userid;
                                    result.Role = role;
                                    return result;
                                }
                                else
                                {
                                    result.status = CustomerLoginResult.InvalidPassword;
                                    return result;
                                }
                            }
                            else
                            {
                                result.status = CustomerLoginResult.InvalidEmail;
                                return result;
                            }
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                result.status = CustomerLoginResult.SystemError;
                return result;
            }
        }
        public async Task<Register> GetUserProfile(int userid)
        {
            Register register = null!;
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                        select u.Email,c.FullName,c.PhoneNumber,c.DateofBirth,c.Address
                        from Users u
                        join CustomerProfiles c on u.UserId = c.UserId
                        where u.UserId = @uid;
                    ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@uid", userid);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            register = new Register
                            {
                                FullName = reader["FullName"].ToString() ?? "",
                                Email = reader["Email"].ToString() ?? "",
                                PhoneNumber = reader["PhoneNumber"].ToString(),
                                DateofBirth = DateOnly.FromDateTime((DateTime)reader["DateofBirth"]),
                                Address = reader["Address"].ToString()
                            };
                        }
                    }
                }
            }
            return register;
        }
        public async Task<bool> UpdateLegalInfo(int userid, UpdatePersonalInfo updatePersonalInfo)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                        Update CustomerProfiles Set
                        FullName = @fullname , DateofBirth = @dob , Address = @address
                        where UserId = @uid
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@uid", userid);
                        cmd.Parameters.AddWithValue("@fullname", updatePersonalInfo!.LegalName);
                        cmd.Parameters.AddWithValue("@dob", updatePersonalInfo.DOB);
                        cmd.Parameters.AddWithValue("@address", updatePersonalInfo.Address);

                        int rows = await cmd.ExecuteNonQueryAsync();
                        return rows > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
    }
}
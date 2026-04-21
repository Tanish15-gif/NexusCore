using Microsoft.Data.SqlClient;
using NexusCore.CustomerProfileViaGoogle;

namespace NexusCore.CustomerOperation
{
    public class RegisterViaGoogle
    {
        private readonly string? conn;
        public RegisterViaGoogle(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public (int UserId, string Role, bool Success) RegisterGoogleUser(string email)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();

                    string checkSql = "SELECT UserId, Role FROM Users WHERE Email = @email;";

                    using (var cmd = new SqlCommand(checkSql, connect))
                    {
                        cmd.Parameters.AddWithValue("@email", email);
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int existingUserId = (int)reader["UserId"];
                                string existingRole = reader["Role"].ToString()!;
                                return (existingUserId, existingRole, true);
                            }
                        }
                    }

                    string insertQuery = @"
                    INSERT INTO Users(Email, PasswordHash, Role)
                    VALUES(@email, 'GOOGLE_ACCOUNT', 'Customer');
                    SELECT SCOPE_IDENTITY();
                    ";

                    using (var inscmd = new SqlCommand(insertQuery, connect))
                    {
                        inscmd.Parameters.AddWithValue("@email", email);

                        int newUserId = Convert.ToInt32(inscmd.ExecuteScalar());
                        return (newUserId, "Customer", true);
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return (0, "", false);
            }
        }
        public bool CompleteProfile(int userid,GoogleProfileRegistration googleProfile)
        {
            try
            {
                using(var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                            Insert into CustomerProfiles(UserId,FullName,DateofBirth,PhoneNumber,Address,KYCStatus)
                            Values(@userid,@fullname,@dob,@phoneNumber,@address,'Pending');
                    ";
                    using(var cmd = new SqlCommand(sql,connect)) 
                    {
                        cmd.Parameters.AddWithValue("@userid",userid);
                        cmd.Parameters.AddWithValue("@fullname",googleProfile.FullName);
                        cmd.Parameters.AddWithValue("@dob",googleProfile.DateofBirth);
                        cmd.Parameters.AddWithValue("@phoneNumber",googleProfile.PhoneNumber);
                        cmd.Parameters.AddWithValue("@address",googleProfile.Address);

                        int rows = cmd.ExecuteNonQuery();
                        return rows > 0 ? true : false;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
        public bool CheckIfProfileExists(int userid)
        {
            try
            {
                using(var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = "Select Count(*) from CustomerProfiles where Userid = @uid";
                    using(var cmd = new SqlCommand(sql,connect))
                    {
                        cmd.Parameters.AddWithValue("@uid",userid);
                        int count = (int)cmd.ExecuteScalar();
                        return count > 0;
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
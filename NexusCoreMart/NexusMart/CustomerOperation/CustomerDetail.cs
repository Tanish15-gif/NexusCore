using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.CustomerDetailsDto;

namespace NexusMart.CustomerOperation
{
    public class Details
    {
        private readonly string? conn;
        public Details(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public CustomerDetails GetDetails(int CustomerId)
        {
            CustomerDetails customerDetails = new CustomerDetails();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Select FullName,Email from MartCustomers
                            where CustomerId = @cid;
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@cid",CustomerId);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if(reader.Read())
                        {
                            customerDetails.Name = reader["FullName"].ToString();
                            customerDetails.Email = reader["Email"].ToString();
                        }
                    }
                }
            }
            return customerDetails;
        }
    }
}
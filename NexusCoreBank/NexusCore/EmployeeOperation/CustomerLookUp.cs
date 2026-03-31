using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.CustomerSearchDto;

namespace NexusCore.EmployeeOperation
{
    public class FindCustomers
    {
        private readonly string? conn;
        public FindCustomers(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public CustomerSearch? LookupCustomer(long accountNumber)
        {
            CustomerSearch customerSearch;
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select c.FullName,u.Email,a.AccountNumber,a.AccountType,a.Balance,a.AccountStatus
                            from Users u
                            Join CustomerProfiles c on u.UserId = c.UserId
                            Join Accounts a on u.UserId = a.UserId
                            where a.AccountNumber = @accnum
                            ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@accnum",accountNumber);
                    using(var reader = cmd.ExecuteReader())
                    {
                        
                        if (reader.Read())
                        {
                            customerSearch = new CustomerSearch
                            {
                                FullName = reader["FullName"].ToString()!,
                                Email = reader["Email"].ToString()!,
                                AccountNumber = (long)reader["AccountNumber"],
                                AccountType = reader["AccountType"].ToString()!,
                                Balance = (decimal)reader["Balance"],
                                Status = reader["AccountStatus"].ToString()!
                            };
                            return customerSearch;
                        }
                        return null;
                    }
                }
            }
        }
    }
}
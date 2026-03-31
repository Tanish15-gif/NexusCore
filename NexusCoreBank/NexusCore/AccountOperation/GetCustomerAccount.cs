using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.AccountDisplayDto;

namespace NexusCore.AccountOperation
{
    public class GetCustomerAccount
    {
        private readonly string? conn;
        public GetCustomerAccount(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<DisplayAccount> GetAccount(int userid)
        {
            List<DisplayAccount> displayAccounts = new List<DisplayAccount>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select 
                            c.FullName,
                            a.AccountId,
                            a.AccountNumber,
                            a.AccountType,
                            a.Balance,
                            a.AccountStatus
                            from Accounts a
                            join Users u on a.UserId = u.UserId
                            join CustomerProfiles c on u.UserId = c.UserId
                            where a.UserId = @uid
                            ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@uid", userid);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            displayAccounts.Add(new DisplayAccount
                            {
                                FullName = reader["FullName"].ToString(),
                                AccountId = (int)reader["AccountId"],
                                AccountNumber = (long)reader["AccountNumber"],
                                AccountType = reader["AccountType"].ToString(),
                                Balance = (decimal)reader["Balance"],
                                Status = reader["AccountStatus"].ToString()
                            });
                        }
                    }
                }
            }
            return displayAccounts;
        }
    }
}
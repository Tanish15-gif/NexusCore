using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.AccountDisplayDto;
using NexusCore.ApprovalAccountDto;
namespace NexusCore.EmployeeOperation
{
    public class DisplayPendingAccount
    {
        private readonly string? conn;
        public DisplayPendingAccount(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<DisplayAccount> PendingAccount()
        {
            List<DisplayAccount> displayAccounts = new List<DisplayAccount>();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = "Select AccountId,AccountNumber,AccountType,AccountStatus,Balance from Accounts where AccountStatus = 'Pending'";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    using(var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            displayAccounts.Add(new DisplayAccount
                            {
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
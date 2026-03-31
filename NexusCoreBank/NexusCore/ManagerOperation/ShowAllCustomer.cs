using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.ShowAllCustomerInManagerDto;

namespace NexusCore.ManagerOperation
{
    public class AllCustomerListManager
    {
        private readonly string? conn;
        public AllCustomerListManager(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<GlobalLedgerDto> GetallCustomer()
        {
            List<GlobalLedgerDto> globalLedgers = new List<GlobalLedgerDto>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"            
                            select
                            a.AccountId,
                            a.AccountNumber,
                            c.FullName,
                            u.Email,
                            a.AccountType,
                            a.Balance,
                            a.AccountStatus
                            from Users u
                            Inner Join Accounts a on u.UserId = a.UserId
                            Inner Join CustomerProfiles c on u.UserId = c.UserId
                            where a.AccountStatus != 'Pending'
                            ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            globalLedgers.Add(new GlobalLedgerDto
                            {
                                AccountId = (int)reader["AccountId"],
                                AccountNumber = (long)reader["AccountNumber"],
                                FullName = reader["FullName"].ToString()!,
                                Email = reader["Email"].ToString()!,
                                AccountType = reader["AccountType"].ToString()!,
                                Balance = (decimal)reader["Balance"],
                                AccountStatus = reader["AccountStatus"].ToString()!,
                            });
                        }
                    }
                }
            }
            return globalLedgers;
        }
    }
}
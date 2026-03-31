using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.LinkBankAccountDto;
using System.Collections.Generic;

namespace NexusMart.BankAccountOperation
{
    public class DisplayBank
    {
        private readonly string? conn;
        public DisplayBank(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<LinkBankAccount> GetBankDetails(int customerid)
        {
            List<LinkBankAccount> linkBankAccounts = new List<LinkBankAccount>();
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"          
                            select  LinkId,NexusCoreAccountNumber,AccountHolderName from LinkedBankAccounts
                            where CustomerId = @cid;
                ";
                using(var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@cid",customerid);
                    using(var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            linkBankAccounts.Add(new LinkBankAccount
                            {
                                LinkId = (int)reader["LinkId"],
                                AccountNumber = (long)reader["NexusCoreAccountNumber"],
                                FullName = reader["AccountHolderName"].ToString()
                            });
                        }
                    }
                }
            }
            return linkBankAccounts;
        }
    }
}
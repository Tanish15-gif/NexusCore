using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.TransactionDto;

namespace NexusCore.AccountOperation
{
    public class TransactionReceiptHistory
    {
        private readonly string? conn;
        public TransactionReceiptHistory(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<TransactionReceipt> GetTransactionHistory(int userid)
        {
            List<TransactionReceipt> transactionReceipts = new List<TransactionReceipt>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Select 
                            t.TransactionDate,
                            t.AccountId,
                            t.TransactionType,
                            t.Amount,
                            t.Status,
                            t.DestinationAccountId,
                            t.MerchantName
                            from Transactions t
                            Inner Join Accounts a on t.AccountId = a.AccountId 
                            where a.UserId = @uid
                            Order by t.TransactionDate DESC
                            ";
                using (var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@uid",userid);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            transactionReceipts.Add(new TransactionReceipt
                            {
                                TransactionDate = Convert.ToDateTime(reader["TransactionDate"]),
                                AccountId = (int)reader["AccountId"],
                                TransactionType = reader["TransactionType"].ToString(), 
                                Amount = (decimal)reader["Amount"],
                                Status = reader["Status"].ToString(),
                                DestinationAccountId = reader["DestinationAccountId"] == DBNull.Value ? null : (int)reader["DestinationAccountId"],
                                MerchantName = reader["MerchantName"].ToString()
                            });
                        }
                    }
                }
            }
            return transactionReceipts;
        }
    }
}
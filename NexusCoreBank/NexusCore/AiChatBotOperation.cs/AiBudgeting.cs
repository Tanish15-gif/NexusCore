using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.SpendingSummayDto;
using System.Collections.Generic;

namespace NexusCore.AiOperation
{
    public class BudgetingService
    {
        private readonly string? conn;
        public BudgetingService(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<SpendingSummay> GetSummay(int userid)
        {
            List<SpendingSummay> spendingSummay = new List<SpendingSummay>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select 
                            t.MerchantName,
                            Sum(t.Amount) as TotalAmountSpent,
                            Count(t.TransactionId) as TransactionCount 
                            from Transactions t 
                            inner join Accounts a on t.AccountId = a.AccountId
                            where a.UserId = @uid and t.TransactionDate >= DATEADD(day,-30,GETDATE())
                            and  t.Status = 'Completed'
                            group by t.MerchantName;
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@uid", userid);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while(reader.Read())
                        {
                            spendingSummay.Add(new SpendingSummay
                            {
                                MerchantName = reader["MerchantName"].ToString(),
                                TotalAmountSpent = Convert.ToDecimal(reader["TotalAmountSpent"]),
                                TransactionCount = Convert.ToInt32(reader["TransactionCount"]), 
                            });
                        }
                    }
                }
            }
            return spendingSummay;
        }
    }
}
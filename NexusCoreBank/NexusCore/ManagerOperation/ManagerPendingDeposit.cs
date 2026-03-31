using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusCore.PendingDepositDto;

namespace NexusCore.ManagerOperation
{
    public class PendingDeposit
    {
        private readonly string? conn;
        public PendingDeposit(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<PendingDepositList> GetPendingDeposit()
        {
            List<PendingDepositList> transactionReceipts = new List<PendingDepositList>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            select 
                            t.TransactionId,
                            c.FullName,
                            a.AccountNumber,
                            t.Amount,
                            t.TransactionType,
                            t.Status,
                            t.TransactionDate
                            from Transactions t
                            Inner Join Accounts a on t.AccountId = a.AccountId
                            Inner Join CustomerProfiles c on c.UserId= a.UserId
                            where t.TransactionType = 'Deposit' and t.Status = 'Pending';
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            transactionReceipts.Add(new PendingDepositList
                            {
                                TransactionId = (int)reader["TransactionId"],
                                FullName = reader["FullName"].ToString(),
                                AccountNumber = (long)reader["AccountNumber"],
                                Amount = (decimal)reader["Amount"],
                                TransactionType = reader["TransactionType"].ToString(),
                                Status = reader["Status"].ToString(),
                                TransactionDate = Convert.ToDateTime(reader["TransactionDate"])
                            });
                        }
                    }
                }
            }
            return transactionReceipts;
        }

        public bool RejectDeposit(int transactionId)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                            Update Transactions Set Status = 'Failed' 
                            where TransactionId = @tid and Status = 'Pending';
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@tid", transactionId);

                        int rows = cmd.ExecuteNonQuery();
                        if(rows > 0)
                        {
                            return true;
                        }
                    }
                    return false;
                }
            }
            catch (SqlException)
            {
                return false;
            }
        }

        public bool ApproveDeposit(int TransactionId)
        {
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                int AccountId = 0;
                decimal Amount = 0;
                string Getsql = @"
                                Select AccountId,Amount from Transactions
                                where TransactionId = @aid and Status = 'Pending';
                "; 
                using(var Getcmd = new SqlCommand(Getsql,connect))
                {
                    Getcmd.Parameters.AddWithValue("@aid",TransactionId);
                    using(var reader = Getcmd.ExecuteReader())
                    {
                        if(reader.Read())
                        {
                            AccountId = (int)reader["AccountId"];
                            Amount = (decimal)reader["Amount"];
                        }
                        else
                        {
                            return false;
                        }
                    }
                }
                var transaction = connect.BeginTransaction();
                try
                {
                    string sql = @"
                                Update Accounts Set Balance = Balance + @amt
                                where AccountId = @aid;
                    ";
                    using (var cmd = new SqlCommand(sql,connect,transaction))
                    {
                        cmd.Parameters.AddWithValue("@aid",AccountId);
                        cmd.Parameters.AddWithValue("@amt",Amount);
                        cmd.ExecuteNonQuery();
                    }
                    string transactionsql = @"
                                        UPDATE Transactions SET Status = 'Completed'
                                        where TransactionId = @tid;
                    ";
                    using (var trancmd = new SqlCommand(transactionsql,connect,transaction))
                    {
                        trancmd.Parameters.AddWithValue("@tid",TransactionId);
                        trancmd.ExecuteNonQuery();
                    }
                    transaction.Commit();
                    return true;
                }
                catch (SqlException)
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }
    }
}
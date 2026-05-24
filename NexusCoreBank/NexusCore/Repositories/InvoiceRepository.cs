using Microsoft.Data.SqlClient;
using NexusCore.InvoiceInsertDto;
using Microsoft.Extensions.Configuration;
using NexusCore.InvoiceItemDto;
using NexusCore.InvoiceDashboardDto;

namespace NexusCore.InvoiceRepositories
{
    public class InvoiceRepository : IInvoiceRepositories
    {
        private readonly string? conn;
        public InvoiceRepository(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public async Task<bool> CreateNewInvoiceAsync(int userid, InsertInvoice insertInvoice)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                using (var transaction = (SqlTransaction)await connect.BeginTransactionAsync())
                {
                    try
                    {
                        string sql = @"
                            Insert into Invoices(AccountId,ClientName,ClientEmail,IssueDate,DueDate,Status)
                            Output inserted.InvoiceId
                            Values(@aid,@name,@email,@issue,@due,'Draft');
                        ";
                        int invoiceid = 0;
                        using (var cmd = new SqlCommand(sql, connect, transaction))
                        {
                            cmd.Parameters.AddWithValue("@aid", insertInvoice.AccountId);
                            cmd.Parameters.AddWithValue("@name", insertInvoice.ClientName);
                            cmd.Parameters.AddWithValue("@email", insertInvoice.ClientEmail);
                            cmd.Parameters.AddWithValue("@issue", insertInvoice.IssueDate);
                            cmd.Parameters.AddWithValue("@due", insertInvoice.DueDate);
                            var result = await cmd.ExecuteScalarAsync();
                            invoiceid = (int)result!;

                            if (invoiceid > 0)
                            {
                                string itemsql = @"
                                    Insert into InvoiceItems(InvoiceId,Description,Quantity,UnitPrice)
                                    Values(@id,@desc,@quan,@price);
                                ";
                                foreach (var item in insertInvoice.Items!)
                                {
                                    using (var itemcmd = new SqlCommand(itemsql, connect, transaction))
                                    {
                                        itemcmd.Parameters.AddWithValue("@id", invoiceid);
                                        itemcmd.Parameters.AddWithValue("@desc", item.Description);
                                        itemcmd.Parameters.AddWithValue("@quan", item.Quantity);
                                        itemcmd.Parameters.AddWithValue("@price", item.UnitPrice);

                                        await itemcmd.ExecuteNonQueryAsync();
                                    }
                                }
                            }
                            await transaction.CommitAsync();
                            return true;
                        }
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine(ex.Message);
                        await transaction.RollbackAsync();
                        return false;
                    }
                }
            }
        }
        public async Task<List<InvoiceDashboard>> GetUserInvoiceAsync(int userid)
        {
            var invoiceDashboards = new List<InvoiceDashboard>();
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                    select 
                        i.InvoiceNumber,
                        i.ClientName,
                        i.IssueDate,
                        i.Status,
                        Coalesce(Sum(it.LineTotal), 0) As Amount
                    from Invoices i
                    join Accounts a on i.AccountId = a.AccountId
                    left join InvoiceItems it on i.InvoiceId = it.InvoiceId
                    where a.UserId = @userid
                    group by i.InvoiceNumber,i.ClientName,i.IssueDate,i.Status
                ";
                using (var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@userid",userid);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            invoiceDashboards.Add(new InvoiceDashboard
                            {
                                InvoiceNumber = reader["InvoiceNumber"].ToString(),
                                ClientName = reader["ClientName"].ToString(),
                                IssueDate = Convert.ToDateTime(reader["IssueDate"]),
                                Status = reader["Status"].ToString(),
                                Amount = (decimal)reader["Amount"]
                            });
                        }
                    }
                }
            }
            return invoiceDashboards;
        }
        public async Task<bool> UpdateStatusAsync(string InvoiceNumber,string status)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                string sql = @"
                    Update Invoices
                    Set Status = @status where InvoiceNumber = @invnum;
                ";
                using (var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@invnum",InvoiceNumber);
                    cmd.Parameters.AddWithValue("@status",status);
                    int rows = await cmd.ExecuteNonQueryAsync();
                    return rows > 0;
                }
            }
        }
    }
}
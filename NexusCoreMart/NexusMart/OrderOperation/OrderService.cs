using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using NexusMart.OrderHistoryDto;
using NexusMart.CartItemDto;
using System.Runtime.CompilerServices;
using System;
using System.Threading.Tasks;
using System.Data;
using System.Text;
using System.Text.Json;
using System.Net.Http;

namespace NexusMart.OrderOperation
{
    public class OrderService
    {
        private readonly string? conn;
        public OrderService(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<OrderHistory> GetOrderHistory(int customerid)
        {
            List<OrderHistory> orders = new List<OrderHistory>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            SELECT 
                            OrderId, 
                            OrderDate, 
                            TotalAmount, 
                            PaymentStatus
                            FROM Orders 
                            WHERE CustomerId = @cid
                            ORDER BY OrderDate DESC;
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@cid", customerid);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            orders.Add(new OrderHistory
                            {
                                OrderId = (int)reader["OrderId"],
                                OrderDate = Convert.ToDateTime(reader["OrderDate"]),
                                TotalAmount = (decimal)reader["TotalAmount"],
                                Status = reader["PaymentStatus"].ToString()
                            });
                        }
                    }
                }
            }
            return orders;
        }
        public async Task<int> PlaceNewOrder(int customerid, OrderPayload orderPayload)
        {
            using (var connect = new SqlConnection(conn))
            {
                await connect.OpenAsync();
                var transaction = connect.BeginTransaction();
                try
                {
                    decimal grandtotal = 0;
                    int orderid = 0;
                    foreach (var item in orderPayload.Items)
                    {
                        string sql = "Select Price from Products where ProductId = @pid";
                        using (var cmd = new SqlCommand(sql, connect, transaction))
                        {
                            cmd.Parameters.AddWithValue("@pid", item.ProductId);
                            var result = await cmd.ExecuteScalarAsync();
                            if (result == null)
                                throw new Exception($"Product {item.ProductId} Not Found");

                            decimal unitprice = Convert.ToDecimal(result);

                            grandtotal += unitprice * item.Quantity;
                        }
                        string checksql = "Select StockQuantity from Products where ProductId = @pid";
                        using (var cmd = new SqlCommand(checksql, connect, transaction))
                        {
                            cmd.Parameters.AddWithValue("@pid", item.ProductId);
                            var result = await cmd.ExecuteScalarAsync();
                            if (result == null || result == DBNull.Value)
                            {
                                throw new Exception("Product stock not found!!");
                            }
                            int StockQuantity = (int)result;
                            if (StockQuantity < item.Quantity)
                            {
                                throw new Exception("This Item is Out of Stock!!");
                            }
                        }
                    }
                    string accsql = @"
                                SELECT NexusCoreAccountNumber FROM LinkedBankAccounts WHERE LinkId = @lid AND CustomerId = @cid;
                    ";
                    long accountNumber = 0;
                    using (var acccmd = new SqlCommand(accsql, connect, transaction))
                    {
                        acccmd.Parameters.AddWithValue("@lid", orderPayload.LinkId);
                        acccmd.Parameters.AddWithValue("@cid", customerid);
                        var rows = await acccmd.ExecuteScalarAsync();

                        if (rows == null || rows == DBNull.Value)
                        {
                            throw new Exception("Invalid Bank Account Selected.");
                        }
                        accountNumber = Convert.ToInt64(rows);
                    }
                    string ordersql = @"
                                    Insert into Orders(CustomerId,LinkId,TotalAmount,OrderDate,PaymentStatus)
                                    OUTPUT INSERTED.OrderId
                                    Values(@cid,@lid,@tAmount,GETDATE(),'Success');
                    ";
                    using (var ordercmd = new SqlCommand(ordersql, connect, transaction))
                    {
                        ordercmd.Parameters.AddWithValue("@cid", customerid);
                        ordercmd.Parameters.AddWithValue("@lid", orderPayload.LinkId);
                        ordercmd.Parameters.AddWithValue("@tAmount", grandtotal);

                        orderid = Convert.ToInt32(await ordercmd.ExecuteScalarAsync());
                    }
                    string merchantName = "NEXUSMART_ORDER_#"+orderid;
                    var paymentPayload = new
                    {
                        AccountNumber = accountNumber,
                        Amount = grandtotal,
                        MerchantName = merchantName
                    };
                    using var client = new HttpClient();
                    var json = JsonSerializer.Serialize(paymentPayload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = await client.PostAsync("http://localhost:5066/Account/deduct-funds", content);
                    if (!response.IsSuccessStatusCode)
                    {
                        var error = await response.Content.ReadAsStringAsync();
                        throw new Exception($"Payment Failed: {error}");
                    }


                    foreach (var item in orderPayload.Items)
                    {
                        string pricesql = @"Select Price from Products where ProductId = @pid";
                        using (var pricecmd = new SqlCommand(pricesql, connect, transaction))
                        {
                            pricecmd.Parameters.AddWithValue("@pid", item.ProductId);

                            decimal unitprice = Convert.ToDecimal(await pricecmd.ExecuteScalarAsync());

                            string itemsql = @"
                                            Insert into OrderItems(OrderId,ProductId,Quantity,UnitPrice)
                                            Values(@id,@pid,@quantity,@price);
                                ";
                            using (var itemcmd = new SqlCommand(itemsql, connect, transaction))
                            {
                                itemcmd.Parameters.AddWithValue("@id", orderid);
                                itemcmd.Parameters.AddWithValue("@pid", item.ProductId);
                                itemcmd.Parameters.AddWithValue("@quantity", item.Quantity);
                                itemcmd.Parameters.AddWithValue("@price", unitprice);

                                await itemcmd.ExecuteNonQueryAsync();
                            }
                        }
                        string updatesql = @"
                                                    UPDATE Products 
                                                    SET StockQuantity = StockQuantity - @quantity 
                                                    WHERE ProductId = @pid
                                    ";
                        using (var updatecmd = new SqlCommand(updatesql, connect, transaction))
                        {
                            updatecmd.Parameters.AddWithValue("@pid", item.ProductId);
                            updatecmd.Parameters.AddWithValue("@quantity", item.Quantity);

                            await updatecmd.ExecuteNonQueryAsync();
                        }
                    }
                    await transaction.CommitAsync();
                    return orderid;

                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
    }
}
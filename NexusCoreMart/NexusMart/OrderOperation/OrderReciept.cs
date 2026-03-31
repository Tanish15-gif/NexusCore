using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.OrderItemDetailDto;
using System.Collections.Generic;

namespace NexusMart.OrderOperation
{
    public class OrderReciept
    {
        private readonly string? conn;
        public OrderReciept(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<OrderItemDetail> GetOrderDetails(int orderId, int customerid)
        {
            List<OrderItemDetail> orderItemDetails = new List<OrderItemDetail>();

            string validsql = "Select CustomerId from Orders where OrderId = @oid";
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                using (var cmd = new SqlCommand(validsql, connect))
                {
                    cmd.Parameters.AddWithValue("@oid", orderId);
                    var result = cmd.ExecuteScalar();

                    if (result == null || result == DBNull.Value || (int)result != customerid)
                    {
                        throw new UnauthorizedAccessException("You do not have permission to view this order.");
                    }
                    else
                    {
                        string sql = @"
                            select p.ProductName,p.ImageUrl,oi.Quantity,oi.UnitPrice,(oi.Quantity * oi.UnitPrice) as Subtotal
                            from Products p
                            inner join OrderItems oi on p.ProductId = oi.ProductId
                            where oi.OrderId = @orderid;
                        ";
                        using (var getcmd = new SqlCommand(sql,connect))
                        {
                            getcmd.Parameters.AddWithValue("@orderid",orderId);
                            using (var reader = getcmd.ExecuteReader())
                            {
                                while(reader.Read())
                                {
                                    orderItemDetails.Add(new OrderItemDetail
                                    {
                                        ProductName = reader["ProductName"].ToString(),
                                        Quantity = (int)reader["Quantity"],
                                        UnitPrice = (decimal)reader["UnitPrice"],
                                        Subtotal = (decimal)reader["Subtotal"],
                                        ImageUrl = reader["ImageUrl"].ToString(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return orderItemDetails;
        }
    }
}
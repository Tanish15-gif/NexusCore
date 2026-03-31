using System.Runtime.InteropServices;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.AddProductInCartDto;

namespace NexusMart.CartOperation
{
    public class CreateProduct
    {
        private readonly string? conn;
        public CreateProduct(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public bool StoreProduct(AddProduct addProduct)
        {
            using(var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Insert into Products (ProductName,Description,Price,Category,StockQuantity,ImageUrl)
                            Values(@Pname,@desc,@price,@category,@stock,@img)
                ";
                using (var cmd = new SqlCommand(sql,connect))
                {
                    cmd.Parameters.AddWithValue("@Pname",addProduct.ProductName);
                    cmd.Parameters.AddWithValue("@desc",addProduct.Description);
                    cmd.Parameters.AddWithValue("@price",addProduct.Price);
                    cmd.Parameters.AddWithValue("@category",addProduct.Category);
                    cmd.Parameters.AddWithValue("@stock",addProduct.StockQuantity);
                    cmd.Parameters.AddWithValue("@img",addProduct.ImageUrl);

                    int rows = cmd.ExecuteNonQuery();
                    if(rows > 0)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.EditProductDto;

namespace NexusMart.CartOperation
{
    public class EditProductInAdmin
    {
        private readonly string? conn;
        public EditProductInAdmin(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public int EditProduct(EditProduct editProduct)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                                Update Products Set 
                                ProductName = @name,
                                Description = @desc,
                                Price = @price,
                                Category = @category,
                                StockQuantity = @quantity,
                                ImageUrl = @url
                                where ProductId = @pid
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@pid", editProduct.ProductId);
                        cmd.Parameters.AddWithValue("@name", editProduct.ProductName);
                        cmd.Parameters.AddWithValue("@desc",
                                string.IsNullOrWhiteSpace(editProduct.Description)
                                ? DBNull.Value
                                : editProduct.Description);
                        cmd.Parameters.AddWithValue("@price", editProduct.Price);
                        cmd.Parameters.AddWithValue("@category", editProduct.Category);
                        cmd.Parameters.AddWithValue("@quantity", editProduct.StockQuantity);
                        cmd.Parameters.AddWithValue("@url",
                        string.IsNullOrWhiteSpace(editProduct.ImageUrl)
                        ? DBNull.Value
                        : editProduct.ImageUrl);

                        int rows = cmd.ExecuteNonQuery();
                        return rows > 0 ? 1 : 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return -1;
            }
        }
        public int DeleteProducts(int id)
        {
            try
            {
                using (var connect = new SqlConnection(conn))
                {
                    connect.Open();
                    string sql = @"
                            Delete from Products
                            where ProductID = @pid;
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@pid", id);

                        return cmd.ExecuteNonQuery() > 0 ? 1 : 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.Message);
                return -1;
            }

        }
    }
}
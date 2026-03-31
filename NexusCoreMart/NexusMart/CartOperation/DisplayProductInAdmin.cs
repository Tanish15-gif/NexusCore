using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using NexusMart.AddProductInCartDto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace NexusMart.CartOperation
{
    public class ProductDisplayInAdmin
    {
        private readonly string? conn;
        public ProductDisplayInAdmin(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<AddProduct> GetAdminProducts()
        {
            List<AddProduct> addProductslist = new List<AddProduct>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                            Select ProductId,ProductName,Price,Category,StockQuantity,Description, ImageUrl
                            from Products;
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            AddProduct addProduct = new AddProduct
                            {
                                Productid = (int)reader["ProductId"],
                                ProductName = reader["ProductName"].ToString(),
                                Price = (decimal)reader["Price"],
                                Category = reader["Category"].ToString(),
                                StockQuantity = (int)reader["StockQuantity"],
                                Description = reader["Description"].ToString(),  
                            };
                            if (reader["ImageUrl"] != DBNull.Value)
                            {
                                addProduct.ImageUrl = reader["ImageUrl"].ToString()!;
                            }
                            else
                            {
                                addProduct.ImageUrl = "/images/default.jpg";
                            }

                            addProductslist.Add(addProduct);
                        }
                    }
                }
            }
            return addProductslist;
        }
        public AddProduct? GetProductById(int id)
        {
            AddProduct? addProduct = null;
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = "Select * from Products where ProductId = @id";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            addProduct = new AddProduct
                            {
                                Productid = (int)reader["ProductId"],
                                ProductName = reader["ProductName"].ToString(),
                                Price = (decimal)reader["Price"],
                                Category = reader["Category"].ToString(),
                                StockQuantity = (int)reader["StockQuantity"],
                                Description = reader["Description"].ToString(),
                                ImageUrl = reader["ImageUrl"].ToString()
                            };
                        }
                    }
                }
            }
            return addProduct;
        }
    }
}
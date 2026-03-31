using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NexusMart.AddProductInCartDto;
using NexusMart.CartOperation;
using NexusMart.EditProductDto;

namespace NexusMart.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly CreateProduct _createProduct;
        private readonly ProductDisplayInAdmin _productDisplayInAdmin;
        private readonly EditProductInAdmin _editProductInAdmin;
        public ProductController
        (
            CreateProduct createProduct,
            ProductDisplayInAdmin productDisplayInAdmin,
            EditProductInAdmin editProductInAdmin
        )
        {
            _createProduct = createProduct;
            _productDisplayInAdmin = productDisplayInAdmin;
            _editProductInAdmin = editProductInAdmin;
        }
        [HttpPost("add-product")]
        public IActionResult ProductAdd(AddProduct addProduct)
        {
            bool success = _createProduct.StoreProduct(addProduct);
            if (success == true)
            {
                return Ok(new { message = "Product Added SuccessFully" });
            }
            else
            {
                return BadRequest(new { message = "Something Went Wrong" });
            }
        }
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm]IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No File Uploaded");

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "ProductImages");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var dbPath = $"/images/ProductImages/{fileName}";

            return Ok(new { url = dbPath });
        }
        [AllowAnonymous]
        [HttpGet("all")]
        public IActionResult GetAllProduct()
        {
            var list = _productDisplayInAdmin.GetAdminProducts();
            return Ok(list);
        }
        [HttpPut("update-product")]
        public IActionResult EditProduct(EditProduct editProduct)
        {
            int result = _editProductInAdmin.EditProduct(editProduct);
            if(result == 1)
            {
                return Ok(new {message = "Product Edited SuccessFully"});
            }
            else if(result == 0)
            {
                return NotFound(new {message = "Product Not Found"});
            }
            else
            {
                return StatusCode(500 , new {message = "Database Error"});
            }
        }
        [AllowAnonymous]
        [HttpGet("{id}")]
        public IActionResult GetProductById(int id)
        {
            var product = _productDisplayInAdmin.GetProductById(id);
            if(product != null)
            {
                return Ok(product);
            }
            else
            {
                return NotFound();
            }
        }
        [HttpDelete("remove/{id}")]
        public IActionResult DeleteProducts(int id)
        {
            int result = _editProductInAdmin.DeleteProducts(id);
            if(result == 1)
            {
                return Ok(new {message = "Product Deleted SuccessFully"});
            }
            else if(result == 0)
            {
                return NotFound(new {message = "Product Not Found"});
            }
            else
            {
                return StatusCode(500, new {message = "Server Error"});
            }
        }
    }
}
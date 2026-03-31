namespace NexusMart.AddProductInCartDto
{
    public class AddProduct
    {
        public int Productid {get;set;}
        public string? ProductName {get;set;}
        public string? Description {get;set;}
        public decimal Price {get;set;}
        public string? Category {get;set;}
        public int StockQuantity {get;set;}
        public string? ImageUrl {get;set;} ="/images/default-product.png";
    }
}
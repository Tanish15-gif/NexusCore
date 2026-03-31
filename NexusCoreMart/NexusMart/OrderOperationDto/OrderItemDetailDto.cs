namespace NexusMart.OrderItemDetailDto
{
    public class OrderItemDetail
    {
        public string? ProductName {get;set;}
        public int Quantity {get;set;}
        public decimal UnitPrice {get;set;}
        public decimal Subtotal {get;set;}
        public string? ImageUrl {get;set;}
    }
}
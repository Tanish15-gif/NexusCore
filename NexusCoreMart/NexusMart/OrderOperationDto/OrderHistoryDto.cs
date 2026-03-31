namespace NexusMart.OrderHistoryDto
{
    public class OrderHistory
    {
        public int OrderId {get;set;}
        public DateTime OrderDate {get;set;}
        public decimal TotalAmount {get;set;}
        public string? Status {get;set;}
    }
}
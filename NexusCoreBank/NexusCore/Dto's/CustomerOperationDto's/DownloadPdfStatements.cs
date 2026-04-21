namespace NexusCore.TransactionStatementsDto
{
    public class TransactionStatement
    {
        public System.DateTime Date { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public string? Status { get; set; }
    }
}
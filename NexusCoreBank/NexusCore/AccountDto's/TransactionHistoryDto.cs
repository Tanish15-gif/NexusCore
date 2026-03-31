namespace NexusCore.TransactionDto
{
    public class TransactionReceipt
    {
        public DateTime TransactionDate {get;set;}
        public int AccountId {get;set;}
        public string? TransactionType {get;set;} = "";
        public decimal Amount {get;set;}
        public string? Status {get;set;} = "";
        public int? DestinationAccountId {get;set;}
        public string? MerchantName { get; set; }
    }
}
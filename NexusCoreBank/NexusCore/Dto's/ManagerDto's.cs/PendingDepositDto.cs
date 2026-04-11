namespace NexusCore.PendingDepositDto
{
    public class PendingDepositList
    {
        public int TransactionId {get;set;}
        public string? FullName {get;set;}
        public long AccountNumber {get;set;}
        public decimal Amount {get;set;}
        public string? TransactionType {get;set;}
        public string? Status {get;set;}
        public DateTime TransactionDate {get;set;}
        //public string? MerchantName { get; set; }
    }
}
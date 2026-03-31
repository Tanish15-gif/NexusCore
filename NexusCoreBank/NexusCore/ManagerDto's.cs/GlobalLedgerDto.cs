namespace NexusCore.ShowAllCustomerInManagerDto
{
    public class GlobalLedgerDto
    {
        public int AccountId {get;set;}
        public long AccountNumber { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email {get;set;} = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string AccountStatus { get; set; } = string.Empty;
    }
}
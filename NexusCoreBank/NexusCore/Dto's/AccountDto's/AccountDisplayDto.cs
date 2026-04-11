namespace NexusCore.AccountDisplayDto
{
    public class DisplayAccount
    {
        public string? FullName {get;set;} = "";
        public int AccountId {get;set;}
        public long AccountNumber {get;set;}
        public string? AccountType {get;set;} = "";
        public decimal Balance {get;set;}
        public string? Status {get;set;} = "";
    }
}
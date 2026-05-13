namespace NexusCore.DepositDto
{
    public class DepositAmount
    {
        public int AccountId {get;set;}
        public decimal Amount {get;set;}
        public string? MerchantName {get;set;}
        public string? AccountType {get;set;}
    }
}
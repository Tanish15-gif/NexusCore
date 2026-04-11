namespace NexusCore.DeductRequestDto
{
    public class DeductRequest
    {
        public long AccountNumber {get;set;}
        public decimal Amount {get;set;}
        public string? MerchantName {get;set;}
    }
}
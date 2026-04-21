using NexusCore.TransferDto;

namespace NexusCore.TransactionServices
{
    public class OtpVerifyDto
    {
        public string OtpCode {get;set;} = string.Empty;
        public TransferAmount? TransferDetails{get;set;}
    }
}
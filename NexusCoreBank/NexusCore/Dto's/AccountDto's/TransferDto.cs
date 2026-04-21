namespace NexusCore.TransferDto
{
    public class TransferAmount
    {
        public int SourceAccountId {get;set;}
        private long _TargetAccountNumber;
        public long TargetAccountNumber
        {
            get
            {
                return _TargetAccountNumber;
            }
            set
            {
                if(value.ToString().Length <= 14)
                {
                    _TargetAccountNumber = value;
                }
                else
                {
                    throw new ArgumentOutOfRangeException("Invalid Account Number Length");
                }
            }
        }
        public decimal Amount {get;set;}
    }
}
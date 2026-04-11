namespace NexusCore.CustomerSearchDto
{
    public class CustomerSearch
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public long AccountNumber { get; set; }
        public string AccountType { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
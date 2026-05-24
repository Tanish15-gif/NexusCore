namespace NexusCore.InvoiceDashboardDto
{
    public class InvoiceDashboard
    {
        public string? InvoiceNumber {get;set;}
        public string? ClientName {get;set;}
        public DateTime IssueDate {get;set;}
        public decimal Amount {get;set;}
        public string? Status {get;set;}
    }
}
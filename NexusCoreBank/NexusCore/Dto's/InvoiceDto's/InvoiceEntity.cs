namespace NexusCore.InvoiceEntityDto
{
    public class Invoice
    {
        public int AccountId {get;set;}
        public string? ClientName {get;set;}
        public string? ClientEmail {get;set;}
        public DateTime IssueDate {get;set;}
        public DateTime DueDate {get;set;}
        public string? Status {get;set;}
    }
}
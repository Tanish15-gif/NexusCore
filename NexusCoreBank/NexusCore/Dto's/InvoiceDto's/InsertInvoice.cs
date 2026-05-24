using NexusCore.InvoiceItemDto;
namespace NexusCore.InvoiceInsertDto
{
    public class InsertInvoice
    {
        public int AccountId {get;set;}
        public string? ClientName {get;set;}
        public string? ClientEmail {get;set;}
        public DateTime IssueDate {get;set;}
        public DateTime DueDate {get;set;}
        public List<InvoiceItem>? Items {get;set;}
    }
}
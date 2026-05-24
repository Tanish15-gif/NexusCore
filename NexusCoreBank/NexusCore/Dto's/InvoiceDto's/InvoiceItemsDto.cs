using System.Collections.Generic;

namespace NexusCore.InvoiceItemDto 
{
    public class InvoiceItem
    {
        public string? Description {get;set;}
        public float Quantity {get;set;}
        public float UnitPrice {get;set;}
    }
}
using System.Threading.Tasks;
using NexusCore.InvoiceDashboardDto;
using NexusCore.InvoiceInsertDto;
using NexusCore.InvoiceRepositories;

namespace NexusCore.InvoiceServices
{
    public class InvoiceService
    {
        private readonly IInvoiceRepositories _invoiceRepository;
        public InvoiceService(IInvoiceRepositories invoiceRepository)
        {
            _invoiceRepository = invoiceRepository;
        }
        public async Task<bool> NewInvoiceAsync(int userid,InsertInvoice insert)
        {
            return await _invoiceRepository.CreateNewInvoiceAsync(userid,insert);
        }
        public async Task<List<InvoiceDashboard>> GetUserInvoiceAsync(int userid)
        {
            return await _invoiceRepository.GetUserInvoiceAsync(userid);
        }
        public async Task<bool> UpdateInvoiceStatusAsync(string invoicenum, string status)
        {
            return await _invoiceRepository.UpdateStatusAsync(invoicenum,status);
        }
    }    
}
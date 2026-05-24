using System.Threading.Tasks;
using NexusCore.InvoiceDashboardDto;
using NexusCore.InvoiceInsertDto;

namespace NexusCore.InvoiceRepositories
{
    public interface IInvoiceRepositories
    {
        Task<bool> CreateNewInvoiceAsync(int userid,InsertInvoice insert);
        Task<List<InvoiceDashboard>> GetUserInvoiceAsync(int userid);
        Task<bool> UpdateStatusAsync(string InvoiceNumber,string status);
    }
}
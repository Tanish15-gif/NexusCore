using System.Threading.Tasks;
using NexusCore.AccountDisplayDto;
using NexusCore.DepositDto;
using NexusCore.OpenAccountsDto;

namespace NexusCore.AccountRepositories
{
    public interface IAccountRepository
    {
        Task<bool> CreateNewAccountAsync(int userid,OpenAccount openAccount);
        Task<List<DisplayAccount>> GetAccount(int userid);
        Task<long> GetCurrentBalanceAsync(int accountid);
    }
}
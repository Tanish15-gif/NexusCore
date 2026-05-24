using NexusCore.AccountDisplayDto;
using NexusCore.AccountRepositories;
using NexusCore.DepositDto;
using NexusCore.OpenAccountsDto;
using NexusCore.TransferDto;
using System.Threading.Tasks;
using System.Linq;

namespace NexusCore.AccountServices
{
    public class AccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;
        public AccountService(IAccountRepository accountRepository,ITransactionRepository transactionRepository)
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
        }
        public async Task<string> OpenNewAccountAsync(int userid,OpenAccount openAccount)
        {
            string safetype = openAccount.AccountType.ToLower();
            if(safetype != "savings" && safetype != "current" && safetype != "fixeddeposit" && safetype != "recurringdeposit" && safetype != "loan" && safetype != "dailydeposit")
            {
                return "Invalid Account Type";
            }
            bool isCreated = await _accountRepository.CreateNewAccountAsync(userid,openAccount);
            return isCreated ? "Success" : "Failed to create account";
        }
        public async Task<List<DisplayAccount>> GetAccountsAsync(int userid)
        {
            return await _accountRepository.GetAccount(userid);
        }
        public async Task<List<DisplayAccount>> GetActiveAccountAsync(int userid)
        {
            var accounts = await _accountRepository.GetAccount(userid);
            return accounts.Where(a => a.Status == "Active").ToList();
        }
    }
}
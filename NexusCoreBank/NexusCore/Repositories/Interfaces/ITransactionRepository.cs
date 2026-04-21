using System.Threading.Tasks;
using NexusCore.DepositDto;
using NexusCore.TransactionDto;
using NexusCore.TransferDto;
namespace NexusCore.AccountRepositories
{
    public interface ITransactionRepository
    {
        //Deposit
        Task<bool> SavePendingDepositAsync(int accountid, decimal amount);
        Task<bool> SaveCompleteDepositAsync(int userid, int accountid, decimal amount);
        Task<int> GetDailyDepositCountAsync(int accountid);

        //Withdraw
        Task<bool> WithdrawAmountAsync(int userid,DepositAmount amount);
        //Transfer
        Task<TransferResult> TransferAccountAsync(int userid,TransferAmount transferAmount);

        Task<int> GetUserIdFromAccountIdAsync(long accountnumber);

        //Printing Transaction Reciept
        Task<List<TransactionReceipt>> GetTransactionReceiptsAsync(int userid);

        Task<int> ApplyDailyInterestToSavingsAsync();
    }
}
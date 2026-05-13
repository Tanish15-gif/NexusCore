using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Identity.Client;
using NexusCore.AccountRepositories;
using NexusCore.DepositDto;
using NexusCore.Hubs;
using NexusCore.Services;
using NexusCore.TransactionDto;
using NexusCore.TransferDto;

namespace NexusCore.TransactionServices
{
    public class TransactionService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        //Email Transaction Service

        private readonly IEmailServices _emailServices;
        private readonly IMemoryCache _memoryCache;
        public TransactionService
        (
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository,
            IHubContext<NotificationHub> hubContext,

            //Email Contructor Parameters

            IEmailServices emailServices,
            IMemoryCache memoryCache
        )
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
            _hubContext = hubContext;

            //connectecting the email

            _emailServices = emailServices;
            _memoryCache = memoryCache;
        }
        public async Task<string> ProcessDepositAsync(int userid, DepositAmount depositAmount)
        {
            int dailyCount = await _transactionRepository.GetDailyDepositCountAsync(depositAmount.AccountId);
            if (depositAmount.Amount > 50000 || dailyCount >= 3)
            {
                var pendingSaved = await _transactionRepository.SavePendingDepositAsync(depositAmount.AccountId, depositAmount.Amount);
                return pendingSaved ? "Pending" : "Failed";
            }
            else
            {
                bool completeSaved = await _transactionRepository.SaveCompleteDepositAsync(userid, depositAmount.AccountId, depositAmount.Amount);
                return completeSaved ? "Completed" : "Failed";
            }
        }
        public async Task<WithdrawAmountResult> ProcessWithdrawAsync(int userid, DepositAmount amount)
        {
            if (amount.AccountType!.Equals("current", StringComparison.OrdinalIgnoreCase))
            {
                return await _transactionRepository.CurrentAccountWithdrawalAsync(userid, amount);
            }
            long CurrentBalance = await _accountRepository.GetCurrentBalanceAsync(amount.AccountId);
            if (CurrentBalance >= amount.Amount)
            {
                return await _transactionRepository.WithdrawAmountAsync(userid,amount);
            }
            else
            {
                return WithdrawAmountResult.NotEnoughBalance;
            }
        }

        public async Task<List<TransactionReceipt>> GetTransactionReceiptsAsync(int userid)
        {
            return await _transactionRepository.GetTransactionReceiptsAsync(userid);
        }
        //Email Methods
        public async Task<TransferResult> ProcessTransferRequestAsync(int userid, TransferAmount transferAmount, string userEmail)
        {
            if (transferAmount.Amount >= 50000)
            {
                Random rnd = new Random();
                string otpcode = rnd.Next(100000, 999999).ToString();
                string cachekey = $"OTP_{userid}";

                var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));

                _memoryCache.Set(cachekey, otpcode, cacheOptions);

                bool emailsent = await _emailServices.SendOTpEmailAsync(userEmail, otpcode);

                return emailsent ? TransferResult.RequireOtp : TransferResult.SystemError;
            }
            return await ExecuteFinalTransferAsync(userid, transferAmount);
        }

        public async Task<TransferResult> VerifyOtpAndTransferAsync(int userid, TransferAmount transferAmount, string Entercode)
        {
            string cachekey = $"OTP_{userid}";
            if (_memoryCache.TryGetValue(cachekey, out string? savecode))
            {
                if (savecode == Entercode)
                {
                    _memoryCache.Remove(cachekey);
                    return await ExecuteFinalTransferAsync(userid, transferAmount);
                }
            }
            return TransferResult.InvalidOtp;
        }
        private async Task<TransferResult> ExecuteFinalTransferAsync(int userid, TransferAmount transferAmount)
        {
            var result = await _transactionRepository.TransferAccountAsync(userid, transferAmount);
            if (result == TransferResult.Success)
            {
                int receiverUserId = await _transactionRepository.GetUserIdFromAccountIdAsync(transferAmount.TargetAccountNumber);
                if (receiverUserId > 0)
                {
                    await _hubContext.Clients.User(receiverUserId.ToString())
                        .SendAsync("ReceiveTransferNotification", transferAmount.Amount);
                }
            }
            return result;
        }
    }
}
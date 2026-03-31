using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using NexusCore.DepositDto;
using NexusCore.OpenAccountsDto;
using NexusCore.AccountOperation;
using NexusCore.TransferDto;
using NexusMart.LinkBankAccountDto;
using Microsoft.Data.SqlClient;
using System.Runtime.CompilerServices;
using NexusCore.DeductRequestDto;
using Microsoft.AspNetCore.Identity;

namespace AuthorizeController.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly CreateAccount _createAccount;
        private readonly GetCustomerAccount _getCustomerAccount;
        private readonly AmountDeposit _depositAmount;
        private readonly AmountWithdraw _amountWithdraw;
        private readonly MoneyTransfer _moneyTransfer;
        private readonly TransactionReceiptHistory _transactionReceiptHistory;
        private readonly string? _connectionstring;
        public AccountController
        (
            CreateAccount createAccount,
            GetCustomerAccount getCustomerAccount,
            AmountDeposit amountDeposit,
            AmountWithdraw amountWithdraw,
            MoneyTransfer moneyTransfer,
            TransactionReceiptHistory transactionReceiptHistory,
            IConfiguration config
        )
        {
            _createAccount = createAccount;
            _getCustomerAccount = getCustomerAccount;
            _depositAmount = amountDeposit;
            _amountWithdraw = amountWithdraw;
            _moneyTransfer = moneyTransfer;
            _transactionReceiptHistory = transactionReceiptHistory;
            _connectionstring = config.GetConnectionString("DefaultConnection");
        }
        [HttpPost("create")]
        public IActionResult Create(OpenAccount open)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool result = _createAccount.CreateNewAccount(secureid, open);
            if (result == true)
            {
                return Ok(new { message = "Account pending approval" });
            }
            else
            {
                return BadRequest(new { message = "Something Went Wrong" });
            }
        }
        [HttpGet("my-accounts")]
        public IActionResult GetMyAccounts()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var result = _getCustomerAccount.GetAccount(secureid);
            return Ok(result);
        }
        [HttpPost("deposit")]
        [Authorize(Roles = "Customer")]
        public IActionResult Deposit([FromBody] DepositAmount deposit)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            string result = _depositAmount.DepositAccount(secureid, deposit);
            switch (result)
            {
                case "Completed":
                    return Ok(new { message = "Amount Deposited SuccessFully." });
                case "Pending":
                    return Accepted(new { message = "Amount Is Currently Under Manager Review." });
                default:
                    return BadRequest(new { message = "Depositing Amount Failed." });
            }
        }
        [HttpPost("withdraw")]
        [Authorize(Roles = "Customer")]
        public IActionResult Withdraw([FromBody] DepositAmount amount)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool result = _amountWithdraw.WithdrawAmount(secureid, amount);
            if (result == true)
            {
                return Ok(new { message = "Amount Withdrawn SuccessFully." });
            }
            else
            {
                return Conflict(new { message = "Insufficient balance or inactive account." });
            }
        }
        [HttpPost("transfer")]
        [Authorize(Roles = "Customer")]
        public IActionResult TransferMoney([FromBody] TransferAmount transferAmount)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            int success = _moneyTransfer.TransferAccount(secureid, transferAmount);
            switch (success)
            {
                case 1:
                    return Ok(new { message = "Transfer Successful." });
                case 2:
                    return BadRequest(new { message = "Destination account not found or inactive." });
                case 3:
                    return BadRequest(new { message = "Insufficient balance or invalid source account." });
                case 4:
                    return BadRequest(new { message = "You cannot transfer money to your own account." });
                default:
                    return StatusCode(500, new { message = "An internal server error occurred during the transfer." });
            }
        }
        [HttpGet("transactions")]
        [Authorize(Roles = "Customer")]
        public IActionResult GetHistory()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = _transactionReceiptHistory.GetTransactionHistory(secureid);
            return Ok(list);
        }
        [HttpPost("verify-account")]
        public async Task<IActionResult> VerifyAccount(LinkBankAccount dto)
        {
            string sql = @"
                        SELECT COUNT(*) 
                        FROM Accounts A
                        INNER JOIN CustomerProfiles P ON A.UserId = P.UserId
                        WHERE A.AccountNumber = @accNum 
                        AND LTRIM(RTRIM(LOWER(P.FullName))) = LTRIM(RTRIM(LOWER(@name)))
                        AND A.AccountStatus = 'Active'";
            try
            {
                using var connect = new SqlConnection(_connectionstring);
                using (var cmd = new SqlCommand(sql, connect))
                {
                    cmd.Parameters.AddWithValue("@accNum", dto.AccountNumber);
                    cmd.Parameters.AddWithValue("@name", dto.FullName);

                    await connect.OpenAsync();
                    int count = (int)await cmd.ExecuteScalarAsync();
                    if (count > 0)
                    {
                        return Ok(new { isValid = true });
                    }
                    return Unauthorized(new { isValid = false, message = "Bank details do not match or account is inactive." });
                }

            }
            catch (System.Exception)
            {
                return StatusCode(500, "A Database Error Occured");
            }
        }
        [HttpPost("deduct-funds")]
        public async Task<IActionResult> PaytoMart([FromBody] DeductRequest deductRequest)
        {
            using (var connect = new SqlConnection(_connectionstring))
            {
                await connect.OpenAsync();
                var transaction = connect.BeginTransaction();
                try
                {
                    string sql = @"
                            Select AccountId,Balance From Accounts
                            where AccountNumber = @accnum and AccountStatus = 'Active';
                    ";
                    using (var cmd = new SqlCommand(sql, connect, transaction))
                    {
                        cmd.Parameters.AddWithValue("@accnum", deductRequest.AccountNumber);
                        decimal Balance = 0;
                        int AccountId = 0;
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (reader.Read())
                            {
                                Balance = Convert.ToDecimal(reader["Balance"]);
                                AccountId = Convert.ToInt32(reader["AccountId"]);
                            }
                        }
                        if (Balance < deductRequest.Amount)
                        {
                            return BadRequest(new { message = "Insufficient Funds." });
                        }
                        else
                        {
                            string UpdateSql = @"
                                            Update Accounts Set Balance = Balance - @amount 
                                            where AccountNumber = @accNum;

                                            INSERT INTO Transactions 
                                            (AccountId, TransactionType, Amount, Status,MerchantName) 
                                            VALUES (@accid, 'Withdrawal', @amount, 'Completed',@merchantName);
                            ";
                            using (var UpdateCmd = new SqlCommand(UpdateSql, connect, transaction))
                            {
                                UpdateCmd.Parameters.AddWithValue("@amount", deductRequest.Amount);
                                UpdateCmd.Parameters.AddWithValue("@accNum", deductRequest.AccountNumber);
                                UpdateCmd.Parameters.AddWithValue("@accid", AccountId);
                                UpdateCmd.Parameters.AddWithValue("@merchantName", deductRequest.MerchantName);
                                int rows = await UpdateCmd.ExecuteNonQueryAsync();
                                if (rows > 0)
                                {
                                    transaction.Commit();
                                    return Ok();
                                }
                                else
                                {
                                    return BadRequest(new { message = "Account update failed." });
                                }
                            }
                        }
                    }
                }
                catch (System.Exception ex) 
                {
                    transaction.Rollback();
                    Console.WriteLine(ex.Message);
                    return StatusCode(500,"Bank Server Error");
                }
            }
        }
    }
}
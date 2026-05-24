using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using NexusCore.DepositDto;
using NexusCore.OpenAccountsDto;
using NexusCore.TransferDto;
using NexusMart.LinkBankAccountDto;
using Microsoft.Data.SqlClient;
using System.Runtime.CompilerServices;
using NexusCore.DeductRequestDto;
using Microsoft.AspNetCore.Identity;
using NexusCore.AccountRepositories;
using NexusCore.AccountServices;
using NexusCore.TransactionServices;
using System.Security.Claims;
using NexusCore.TransactionStatementsDto;
using NexusCore.Services;
using NexusCore.InvoiceInsertDto;
using NexusCore.InvoiceServices;
using NexusCore.StatusUpdateDto;

namespace AuthorizeController.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;
        private readonly TransactionService _transactionService;
        private readonly PdfStatementService _pdfStatementService;
        private readonly InvoiceService _invoiceService;
        private readonly string? _connectionstring;
        public AccountController
        (
            AccountService accountService,
            TransactionService transactionService,
            PdfStatementService pdfStatementService,
            InvoiceService invoiceService,
            IConfiguration config
        )
        {
            _accountService = accountService;
            _transactionService = transactionService;
            _invoiceService = invoiceService;
            _pdfStatementService = pdfStatementService;
            _connectionstring = config.GetConnectionString("DefaultConnection");
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create(OpenAccount open)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            string result = await _accountService.OpenNewAccountAsync(secureid, open);
            if (result == "Success")
            {
                return Ok(new { message = "Account pending approval" });
            }
            else
            {
                return BadRequest(new { message = "Something Went Wrong" });
            }
        }
        [HttpGet("my-accounts")]
        public async Task<IActionResult> GetMyAccounts()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var result = await _accountService.GetAccountsAsync(secureid);
            return Ok(result);
        }
        [HttpPost("deposit")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Deposit([FromBody] DepositAmount deposit)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            string result = await _transactionService.ProcessDepositAsync(secureid, deposit);
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
        public async Task<IActionResult> Withdraw([FromBody] DepositAmount amount)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var result = await _transactionService.ProcessWithdrawAsync(secureid, amount);
            switch (result)
            {
                case WithdrawAmountResult.Success:
                    return Ok(new { message = "Amount Withdrawal SuccessFull" });
                case WithdrawAmountResult.NotEnoughBalance:
                    return BadRequest(new { message = "Not Enough Balance" });
                case WithdrawAmountResult.Failed:
                    return BadRequest(new { message = "Withdrawal Failed" });
                case WithdrawAmountResult.OverDraftLimitExceeds:
                    return BadRequest(new {message = "Overdraft limit Exceeds"});
                default:
                    return StatusCode(500,new {message = "Server Error"});
            }
        }
        [HttpPost("transfer")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RequestTransfer([FromBody] TransferAmount transferAmount)
        {
            int secureid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            string currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            if (secureid == 0 || string.IsNullOrEmpty(currentUserEmail))
            {
                return Unauthorized(new { message = "Invalid Security Token. Please log in again." });
            }
            var Status = await _transactionService.ProcessTransferRequestAsync(secureid, transferAmount, currentUserEmail);
            switch (Status)
            {
                case TransferResult.Success:
                    return Ok(new { action = "COMPLETED", message = "Transfer Completed Successful." });
                case TransferResult.InsufficientFunds:
                    return BadRequest(new { message = "Insufficient balance or invalid source account." });
                case TransferResult.RequireOtp:
                    return Ok(new { action = "SHOW_OTP", message = "Security Verification Required! Check Email." });
                case TransferResult.CannotTransferToSelf:
                    return BadRequest(new { message = "You cannot transfer money to your own account." });
                case TransferResult.TargetAccountNotFound:
                    return NotFound(new { message = "Destination account not found or inactive." });
                default:
                    return StatusCode(500, new { message = "An internal server error occurred during the transfer." });
            }
        }
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyAndExecute([FromBody] OtpVerifyDto otpVerify)
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var Status = await _transactionService.VerifyOtpAndTransferAsync(userid, otpVerify.TransferDetails!, otpVerify.OtpCode);
            switch (Status)
            {
                case TransferResult.Success:
                    return Ok(new { action = "COMPLETED", message = "Verification successful. Money transferred!" });

                case TransferResult.InvalidOtp:
                    return BadRequest(new { message = "Invalid or Expired OTP." });

                case TransferResult.InsufficientFunds:
                    return BadRequest(new { message = "OTP Verified, but you have insufficient funds." });

                case TransferResult.TargetAccountNotFound:
                    return NotFound(new { message = "OTP Verified, but the receiving account number is invalid or not Active." });

                case TransferResult.CannotTransferToSelf:
                    return BadRequest(new { message = "OTP Verified, but you cannot transfer money to your own account." });

                case TransferResult.SystemError:
                    return StatusCode(500, new { message = "OTP Verified, but a Database System Error occurred." });

                default:
                    return StatusCode(500, new { message = "Transfer failed after verification." });
            }
        }
        [HttpGet("transactions")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetHistory()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = await _transactionService.GetTransactionReceiptsAsync(secureid);
            return Ok(list);
        }
        [HttpPost("verify-account")]
        [AllowAnonymous]
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
                    int count = (int?)await cmd.ExecuteScalarAsync() ?? 0;
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
        [HttpGet("get-activeAccounts")]
        public async Task<IActionResult> GetActiveAccounts()
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = await _accountService.GetActiveAccountAsync(userid);
            return Ok(result);
        }
        [HttpPost("deduct-funds")]
        [AllowAnonymous]
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
                    return StatusCode(500, "Bank Server Error");
                }
            }
        }
        [HttpGet("download-statement/{accountId}")]
        [AllowAnonymous] 
        public async Task<IActionResult> DownloadStatement(int accountId)
        {
            string accountName = "Tanish Gupta";
            string accountNumber = "NEXUS-789456123";

            var history = new List<TransactionStatement>
        {
            new TransactionStatement { Date = System.DateTime.Now.AddDays(-2), Description = "TRANSFER_IN_FROM_ANANDI", Amount = 5000, Status = "Completed" },
            new TransactionStatement { Date = System.DateTime.Now.AddDays(-1), Description = "Amazon Purchase", Amount = -1200, Status = "Completed" },
            new TransactionStatement { Date = System.DateTime.Now, Description = "Interest Credited", Amount = 150, Status = "Completed" }
        };

            var pdfBytes = _pdfStatementService.GenerateStatement(accountName, accountNumber, history);

            return File(pdfBytes, "application/pdf", $"NexusCore_Statement_{accountId}.pdf");
        }
        [HttpPost("newInvoice")]
        public async Task<IActionResult> InsertNewInvoice(InsertInvoice insertInvoice)
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = await _invoiceService.NewInvoiceAsync(userid,insertInvoice);
            if(result == true)
            {
                return Ok(new {message = "Invoice Added SuccessFully"});
            }
            else
            {
                return StatusCode(500, new {message = "Server Error"});
            }
        }
        [HttpGet("showInvoice")]
        public async Task<IActionResult> DisplayInvoiceDashboard()
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = await _invoiceService.GetUserInvoiceAsync(userid);
            return Ok(result);
        }
        [HttpPut("{invoiceNumber}/Invoicestatus")]
        public async Task<IActionResult> ChangeInvoiceStatus(string invoiceNumber,[FromBody] StatusUpdate dto)
        {
            var result = await _invoiceService.UpdateInvoiceStatusAsync(invoiceNumber,dto.Status!);
            if(result)
            {
                return Ok(new {message = "Status Update SuccessFully"});
            }
            else
            {
                return BadRequest(new {message = "Error Occured while changing the status"});
            }
        }
    }
}
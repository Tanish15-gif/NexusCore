using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using NexusCore.ShowAllCustomerInManagerDto;
using NexusCore.ManagerOperation;
using NexusCore.UpdateEmailDto;

namespace ControllerManager.Controllers
{
    [Authorize (Roles ="Manager")]
    [ApiController]
    [Route("[controller]")]
    public class ManagerController : ControllerBase
    {
        private readonly AllCustomerListManager _allCustomer;
        private readonly ListManager _listManager;
        private readonly ListEmployeeAuditLog _employeeAuditLog;
        private readonly PendingDeposit _pendingDeposit;
        public ManagerController
        (
            AllCustomerListManager allCustomer,
            ListManager listManager,
            ListEmployeeAuditLog employeeAuditLog,
            PendingDeposit pendingDeposit
        )
        {
            _allCustomer = allCustomer;
            _listManager = listManager;
            _employeeAuditLog = employeeAuditLog;
            _pendingDeposit = pendingDeposit;
        }
        [HttpGet("global-ledger")]
        public IActionResult ShowAllCustomer()
        {
            var list = _allCustomer.GetallCustomer();
            return Ok(list);
        }
        [HttpPut("freeze/{accountNumber}")]
        public IActionResult FreezeCustomerAccount(long accountNumber)
        {
            bool success = _listManager.FreezeAccount(accountNumber);
            if(success == true)
            {
                return Ok(new {message = "Account successfully frozen."});
            }
            else
            {
                return NotFound(new {message = "Account not found, or it is already frozen/closed."});
            }
        }
        [HttpPut("unfreeze/{accountNumber}")]
        public IActionResult UnFreezeCustomerAccount(long accountNumber)
        {
            bool success = _listManager.UnFreezeAccount(accountNumber);
            if(success == true)
            {
                return Ok(new {message = "Account successfully unfrozen and restored to Active."});
            }
            else
            {
                return NotFound(new {message = "Account not found, or it is not currently frozen."});
            }
        }
        [HttpPut("update-email/{accountId}")]
        public IActionResult UpdateEmail(int accountId, [FromBody] EditEmail request)
        {
            bool success = _listManager.UpdateCustomerEmail(accountId,request.NewEmail);
            if(success == true)
            {
                return Ok(new {message = "Customer email successfully overridden."});
            }
            else
            {
                return BadRequest(new {message = "Failed to update email. Account may not exist."});
            }
        }
        [HttpGet("audit-logs")]
        public IActionResult EmployeeAuditLog()
        {
            var list = _employeeAuditLog.GetAuditLog();
            return Ok(list);
        }
        [Authorize(Roles = "Manager, Superadmin")]
        [HttpGet("Pending-Deposit")]
        public IActionResult GetPendingAmount()
        {
            var list = _pendingDeposit.GetPendingDeposit();
            return Ok(list);
        }
        [Authorize(Roles = "Manager, Superadmin")]
        [HttpPut("approve/{id}")]
        public IActionResult ApprovePending(int id)
        {
            bool approve = _pendingDeposit.ApproveDeposit(id);
            if(approve == true)
            {
                return Ok(new {message = "Deposit Approved successfully."});
            }
            else
            {
                return BadRequest(new {message = "Something went Wrong"});
            }
        }
        [Authorize(Roles = "Manager, Superadmin")]
        [HttpPut("reject/{id}")]
        public IActionResult RejectPending(int id)
        {
            bool reject = _pendingDeposit.RejectDeposit(id);
            if(reject == true)
            {
                return Ok(new {message = "Deposit Rejected successfully."});
            }
            else
            {
                return BadRequest(new {message = "Something went Wrong"});
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using NexusCore.ApprovalAccountDto;
using NexusCore.EmployeeOperation;
using NexusCore.EmployeeDetailsDto;
using System.Security.Claims;
using NexusCore.CustomerSearchDto;

namespace EmployController.Controllers
{
    [Authorize(Roles = "Employee")]
    [ApiController]
    [Route("[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly DisplayPendingAccount _employeeApprovals;
        private readonly Approval _approval;
        private readonly FetchEmployee _fetchEmployee;
        private readonly FindCustomers _customerSearch;
        public EmployeeController
        (
            DisplayPendingAccount employeeApprovals,
            Approval approval,
            FetchEmployee fetchEmployee,
            FindCustomers customerSearch
        )
        {
            _employeeApprovals = employeeApprovals;
            _approval = approval;
            _fetchEmployee = fetchEmployee;
            _customerSearch = customerSearch;
        }
        [HttpGet("pending-accounts")]
        public IActionResult PendingApproval()
        {
            var list = _employeeApprovals.PendingAccount();
            return Ok(list);
        }
        [HttpGet("fetchdetails")]
        public IActionResult FetchDetails()
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            EmpDetails? details = _fetchEmployee.FetchDetails(userid);

            if (details != null)
            {
                return Ok(details);
            }

            return NotFound();
        }
        [HttpPut("approve")]
        public IActionResult ApproveAccount([FromBody] AccountApprove account)
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            EmpDetails? details = _fetchEmployee.FetchDetails(userid);
            if (details == null)
            {
                return BadRequest(new { message = "Employee profile not found." });
            }
            bool result = _approval.Approve(account, details.EmployeeId);

            if (result == true)
            {
                return Ok(new { message = "Account successfully activated!" });
            }
            else
            {
                return BadRequest(new { message = "Something Went Wrong" });
            }
        }
        [HttpPut("reject")]
        public IActionResult RejectAccount([FromBody] AccountApprove account)
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            EmpDetails? details = _fetchEmployee.FetchDetails(userid);
            if (details == null)
            {
                return BadRequest(new { message = "Employee profile not found." });
            }

            bool result = _approval.Reject(account, details.EmployeeId);
            if (result == true)
            {
                return Ok(new { message = "Application rejected." });
            }
            else
            {
                return BadRequest();
            }
        }
        [HttpGet("search/{accountNumber}")]
        public IActionResult SearchCustomer(long accountNumber)
        {
            var find = _customerSearch.LookupCustomer(accountNumber);
            if (find != null)
            {
                return Ok(find);
            }
            else
            {
                return NotFound(new { message = "Account not found." });
            }
        }
    }
}
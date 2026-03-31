using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using NexusCore.UserSignupDto;
using NexusCore.AdminOperation;
using NexusCore.PromotionDto;

namespace Administrator.Controllers
{
    [Authorize (Roles = "SuperAdmin, Admin")]
    [ApiController]
    [Route("[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly StaffRegistration _staffRegistration;
        private readonly PromoteUser _promoteUser;
        private readonly ShowStaffListInAdmin _showStaffListInAdmin;
        private readonly SystemInfo _systemInfo;
        private readonly MasterAudiLog _masterAudiLog;
        public AdminController
        (
            StaffRegistration staffRegistration,
            PromoteUser promoteUser,
            ShowStaffListInAdmin showStaffListInAdmin,
            SystemInfo systemInfo,
            MasterAudiLog masterAudiLog
        )
        {
            _staffRegistration = staffRegistration;
            _promoteUser = promoteUser;
            _showStaffListInAdmin = showStaffListInAdmin;
            _systemInfo = systemInfo;
            _masterAudiLog = masterAudiLog;
        }
        [HttpPost("register-staff")]
        public IActionResult RegisterStaff([FromBody]SignUpUsers signUpEmployee)
        {
            var result = _staffRegistration.RegisterStaff(signUpEmployee);
            if(result == true)
            {
                return Ok(new {message = "Registration SuccessFull"});
            }
            else
            {
                return BadRequest(new {message = "Something Went Wrong"});
            }
        }
        [HttpPost("promote-staff")]
        public IActionResult Promotion([FromBody] Promotion promotion)
        {
            bool success = _promoteUser.Promote(promotion);
            if(success == true) return Ok(new {message = "Promotion SuccessFully"});
            else return BadRequest(new {message = "Something went wrong"});
        }
        [HttpGet("staff-list")]
        public IActionResult GetStaff()
        {
            var list = _showStaffListInAdmin.GetStaffList();
            return Ok(list);
        }
        [HttpGet("system-metrics")]
        public IActionResult GetSystemMetrices()
        {
            var result = _systemInfo.GetSystemInfo();
            return Ok(result);
        }
        [HttpGet("audit-logs")]
        public IActionResult AuditTracker()
        {
            var list = _masterAudiLog.AuditLogTracker();
            return Ok(list);
        }
    }
}
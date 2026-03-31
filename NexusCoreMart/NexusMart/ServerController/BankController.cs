using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Data.SqlClient;
using NexusMart.LinkBankAccountDto;
using NexusMart.BankAccountOperation;

namespace NexusMart.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class BankController : ControllerBase
    {
        private readonly DisplayBank _displayBank;
        private readonly DisconnectBank _disconnectBank;
        private readonly LinkUserBank _linkUserBank;
        public BankController
        (
            DisplayBank displayBank,
            LinkUserBank linkUserBank,
            DisconnectBank disconnectBank
        )
        {
            _displayBank = displayBank;
            _linkUserBank = linkUserBank;
            _disconnectBank = disconnectBank;
        }
        [HttpGet("Get-Bank")]
        public IActionResult GetBank()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = _displayBank.GetBankDetails(secureid);
            return Ok(list);
        }
        [HttpDelete("disconnect-bank")]
        public IActionResult Disconnect([FromQuery] long AccountNumber)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool success = _disconnectBank.DeleteBank(secureid,AccountNumber);
            if(success == true)
            {
                return Ok(new {message = "Account Disconnected from this Account SuccessFull"});
            }
            else
            {
                return BadRequest(new {message = "Server Error"});
            }
        }
        [HttpPost("link-bank")]
        public async Task<IActionResult> LinkBank([FromBody]LinkBankAccount dto)
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            int result = await _linkUserBank.VerifyAndLinkBank(dto,secureid);
            {
                if(result == 1)
                {
                    return Ok(new { message = "Bank Linked Successfully!" });
                }
                if(result == 2)
                {
                    return BadRequest(new { message = "Bank rejected these details." });
                }
                else
                {
                    return StatusCode(500, new { message = "Server Error" });
                }
            }
        }
    }
}
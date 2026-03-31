using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using NexusMart.LoginSignUpOperation;
using NexusMart.LoginDto;
using NexusMart.RegisterDto;
using Microsoft.Data.SqlClient;
using NexusMart.LinkBankAccountDto;
using NexusMart.Security;
using NexusMart.CustomerOperation;

namespace NexusMart.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly SignUpUser _signUpUser;
        private readonly LoginUser _loginUser;
        private readonly TokenService _tokenService;
        private readonly Details _details;
        public UsersController
        (
            SignUpUser signUpUser,
            LoginUser loginUser,
            TokenService tokenService,
            Details details
        )
        {
            _signUpUser = signUpUser;
            _loginUser = loginUser;
            _tokenService = tokenService;
            _details = details;
        }
        [HttpPost("register")]
        public IActionResult Register([FromBody] SignUp signUp)
        {
            int success = _signUpUser.RegisterUser(signUp);
            if (success == 1)
            {
                return Ok(new { message = "Registration SuccessFully" });
            }
            else if (success == 2)
            {
                return Conflict(new { message = "Email Already Exists" });
            }
            else
            {
                return BadRequest(new { message = "Server Error" });
            }
        }
        [HttpPost("login")]
        public IActionResult Login(Login login)
        {
            var response = _loginUser.Login(login);
            if (response.Success)
            {
                string token = _tokenService.GenerateToken(response.UserId, response.Role);
                return Ok(new {token = token, message = "Login Successful" });
            }
            else
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
        } 
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCustomerDetails()
        {
            int secureid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var result = _details.GetDetails(secureid);
            return Ok(result);
        }  
    }
}
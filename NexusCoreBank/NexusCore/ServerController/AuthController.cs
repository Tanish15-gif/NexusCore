using Microsoft.AspNetCore.Mvc;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerOperation;
using System.IdentityModel.Tokens.Jwt;
using NexusCore.CustomerSignIn;
using Microsoft.AspNetCore.Authorization;
using NexusCore.EmployeeOperation;
using NexusCore.UserSignupDto;
using NexusCore.AdminOperation;

namespace AuthController.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly RegistrationOperation _registrationOperation;
        private readonly CustomerLogin _customerLogin;
        private readonly TokenService _tokenService;
        public UsersController
        (
            RegistrationOperation registration,
            CustomerLogin login,
            TokenService tokenService
        )
        {
            _registrationOperation = registration;
            _customerLogin = login;
            _tokenService = tokenService;
        }
        [HttpPost("register")]
        public IActionResult SignInCustomer([FromBody] Register register)
        {
            int success = _registrationOperation.RegisterCustomer(register);
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
        [HttpPost("Login")]
        public IActionResult LoginCustomer(LogIn logIn)
        {
            var response = _customerLogin.Login(logIn);
            if (response.Success)
            {
                string token = _tokenService.GenerateToken(response.UserId, response.Role);
                return Ok(new { token = token, message = "Login Successful" });
            }
            else
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
        }
    }
}
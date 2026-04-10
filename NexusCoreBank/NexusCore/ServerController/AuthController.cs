using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Google;
using System.Security.Claims;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerOperation;
using System.IdentityModel.Tokens.Jwt;
using NexusCore.CustomerSignIn;
using Microsoft.AspNetCore.Authorization;
using NexusCore.EmployeeOperation;
using NexusCore.UserSignupDto;
using NexusCore.AdminOperation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using NexusCore.CustomerProfileViaGoogle;

namespace AuthController.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly RegistrationOperation _registrationOperation;
        private readonly CustomerLogin _customerLogin;
        private readonly TokenService _tokenService;
        private readonly RegisterViaGoogle _registerViaGoogle;
        public UsersController
        (
            RegistrationOperation registration,
            CustomerLogin login,
            RegisterViaGoogle registerViaGoogle,
            TokenService tokenService
        )
        {
            _registrationOperation = registration;
            _customerLogin = login;
            _registerViaGoogle = registerViaGoogle;
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
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            string name = _customerLogin.GetProfile(userid);
            return Ok(new {fullName = name});
        }
        [HttpGet("login-google")]
        public IActionResult LoginWithGoogle()
        {
            var properties = new AuthenticationProperties { RedirectUri = Url.Action("GoogleCallback") };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Cookies");
            if (!authenticateResult.Succeeded)
            {
                return BadRequest("Google authentication failed.");
            }
            var email = authenticateResult.Principal.FindFirstValue(ClaimTypes.Email);

            var googleName = authenticateResult.Principal.FindFirstValue(ClaimTypes.Name) ?? "Customer";
            var safeGoogleName = Uri.EscapeDataString(googleName);

            var dbresult = _registerViaGoogle.RegisterGoogleUser(email!);
            if (dbresult.Success)
            {
                string token = _tokenService.GenerateToken(dbresult.UserId, dbresult.Role);

                var cookieOptions = new CookieOptions
                {
                    HttpOnly = false,
                    Secure = false,
                    Expires = DateTime.UtcNow.AddMinutes(10),

                    Path = "/",
                    SameSite = SameSiteMode.Lax,

                    IsEssential = true
                };

                Response.Cookies.Append("temp_nexus_token", token, cookieOptions);

                Response.Cookies.Append("temp_nexus_name", safeGoogleName, cookieOptions);

                return Redirect($"http://localhost:5066/customer-dashboard.html");
            }
            else
            {
                return BadRequest(new { Message = "Something went wrong with the database." });
            }
        }
        [Authorize]
        [HttpPost("complete-profile")]
        public IActionResult CompleteRegister([FromBody] GoogleProfileRegistration googleProfile)
        {
            int userid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool result = _registerViaGoogle.CompleteProfile(userid, googleProfile);
            if (result == true)
            {
                return Ok(new { message = "Profile completed successfully!" });
            }
            else
            {
                return StatusCode(500, new { message = "DataBase Error" });
            }
        }
        [Authorize]
        [HttpGet("check-kyc")]
        public IActionResult CheckKycStatus()
        {
            int userid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool hasprofile = _registerViaGoogle.CheckIfProfileExists(userid);
            return Ok(new {needsProfile = !hasprofile});
        }
    }
}
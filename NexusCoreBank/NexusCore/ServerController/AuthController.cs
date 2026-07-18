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
using NexusCore.CustomerServices;
using NexusCore.CustomerRepositories;
using NexusCore.UpdatePersonalInformation;

namespace AuthController.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly CustomerService _customerService;
        private readonly TokenService _tokenService;
        private readonly RegisterViaGoogle _registerViaGoogle;
        public UsersController
        (
            CustomerService customerService,
            RegisterViaGoogle registerViaGoogle,
            TokenService tokenService
        )
        {
            _customerService = customerService;
            _registerViaGoogle = registerViaGoogle;
            _tokenService = tokenService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> SignInCustomer([FromBody] Register register)
        {
            var success = await _customerService.RegisterNewUserAsync(register);
            switch (success)
            {
                case CustomerSignUpResult.Success:
                    return Ok(new { message = "Registration SuccessFully" });
                case CustomerSignUpResult.EmailExists:
                    return BadRequest(new { message = "Entered E-Mail Already Exists" });
                case CustomerSignUpResult.PhoneNumberExists:
                    return BadRequest(new { message = "Entered Phone-Number Already Exists" });
                case CustomerSignUpResult.SystemError:
                default:
                    return StatusCode(500, new { message = "A System Error Occured" });
            }
        }
        [HttpPost("Login")]
        public async Task<IActionResult> LoginCustomer([FromBody] LogIn logIn)
        {
            var response = await _customerService.CompleteLoginAsync(logIn);
            switch (response.status)
            {
                case CustomerLoginResult.Success:
                    string token = _tokenService.GenerateToken(response.UserId, response.Role, logIn.Email!);
                    return Ok(new { message = "Login Successfull", token = token, });
                case CustomerLoginResult.InvalidEmailPassword:
                    return BadRequest(new { message = "Invalid Email and Password" });
                case CustomerLoginResult.InvalidEmail:
                    return Unauthorized(new { message = "Invalid Email" });
                case CustomerLoginResult.InvalidPassword:
                    return Unauthorized(new { message = "Invalid Password" });
                default:
                    return StatusCode(500, new { message = "A System Error Has Occured" });
            }
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            int userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = await _customerService.GetProfile(userid);
            return Ok(new
            {
                fullName = result.FullName,
                email = result.Email,
                phoneNumber = result.PhoneNumber,
                dateofBirth = result.DateofBirth,
                address = result.Address
            });
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
            var authenticateResult =
                await HttpContext.AuthenticateAsync(
                    "Cookies"
                );

            if (
                !authenticateResult.Succeeded ||
                authenticateResult.Principal == null
            )
            {
                return BadRequest(
                    "Google authentication failed."
                );
            }

            var principal =
                authenticateResult.Principal;

            var email =
                principal.FindFirstValue(
                    ClaimTypes.Email
                );

            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(
                    "Google email was not received."
                );
            }

            var googleName =
                principal.FindFirstValue(
                    ClaimTypes.Name
                ) ?? "Customer";

            var pictureUrl =
                principal.FindFirstValue(
                    "urn:google:picture"
                );

            Console.WriteLine(
                $"Google picture URL: {pictureUrl}"
            );

            var dbResult =
                _registerViaGoogle.RegisterGoogleUser(
                    email
                );

            if (!dbResult.Success)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Something went wrong with the database."
                    }
                );
            }

            var token =
                _tokenService.GenerateToken(
                    dbResult.UserId,
                    dbResult.Role,
                    email
                );

            var cookieOptions =
                new CookieOptions
                {
                    HttpOnly = false,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Path = "/",
                    Expires =
                        DateTimeOffset.UtcNow.AddMinutes(
                            10
                        ),
                    IsEssential = true
                };

            Response.Cookies.Append(
                "temp_nexus_token",
                token,
                cookieOptions
            );

            Response.Cookies.Append(
                "temp_nexus_name",
                googleName,
                cookieOptions
            );

            if (
                !string.IsNullOrWhiteSpace(
                    pictureUrl
                )
            )
            {
                Response.Cookies.Append(
                    "temp_nexus_picture",
                    pictureUrl,
                    cookieOptions
                );
            }

            return Redirect(
                "http://localhost:5173/dashboard/accounts"
            );
        }
        [Authorize]
        [HttpPost("complete-profile")]
        public IActionResult CompleteRegister([FromBody] GoogleProfileRegistration googleProfile)
        {
            var useridValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;

            if (!int.TryParse(useridValue, out int userid))
            {
                return Unauthorized(new
                {
                    message = "Invalid authentication token."
                });
            }
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
            return Ok(new { needsProfile = !hasprofile });
        }
        [Authorize]
        [HttpPut("update-legal-info")]
        public async Task<IActionResult> UpdateInfo(UpdatePersonalInfo updatePersonalInfo)
        {
            int userid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            bool success = await _customerService.CompleteUpdateAsync(userid, updatePersonalInfo);
            if (success)
            {
                return Ok(new { message = "Legal Info updated successfully!" });
            }

            return BadRequest(new { message = "Failed to update name." });
        }
    }
}
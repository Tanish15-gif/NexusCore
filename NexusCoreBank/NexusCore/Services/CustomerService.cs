using System.Threading.Tasks;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerRepositories;
using NexusCore.CustomerSignIn;
using NexusCore.LoginResponseDto;

namespace NexusCore.CustomerServices
{
    public class CustomerService
    {
        private readonly ICustomerRepositories _customerRepositories;
        public CustomerService(ICustomerRepositories customerRepositories)
        {
            _customerRepositories = customerRepositories;
        }
        public async Task<Register> GetProfile(int userid)
        {
            return await _customerRepositories.GetUserProfile(userid);
        }
        public async Task<LoginResponse> CompleteLoginAsync(LogIn logIn)
        {
            if (string.IsNullOrEmpty(logIn.Email) || string.IsNullOrEmpty(logIn.Password))
            {
                return new LoginResponse
                {
                    status = CustomerLoginResult.InvalidEmailPassword
                };
            }
            var result = await _customerRepositories.UserLoginAsync(logIn);
            return result;
        }
        public async Task<CustomerSignUpResult> RegisterNewUserAsync(Register register)
        {
            bool checkemail = await _customerRepositories.CheckEmailExistsAsync(register.Email!);
            if(checkemail)
            {
                return CustomerSignUpResult.EmailExists;
            }

            bool checkphone = await _customerRepositories.CheckPhoneNumberExistsAsync(register.PhoneNumber!);
            if(checkphone)
            {
                return CustomerSignUpResult.PhoneNumberExists;
            }

            bool isSaved = await _customerRepositories.CompleteUserRegistration(register);
            if(isSaved)
            {
                return CustomerSignUpResult.Success;
            }
            else
            {
                return CustomerSignUpResult.SystemError;
            }
        }
    }
}
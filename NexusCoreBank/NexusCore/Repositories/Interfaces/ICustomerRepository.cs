using System.Threading.Tasks;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerSignIn;
using NexusCore.LoginResponseDto;

namespace NexusCore.CustomerRepositories
{
    public interface ICustomerRepositories
    {
        //Signing Up the Users
        Task<bool> CheckEmailExistsAsync(string email);
        Task<bool> CheckPhoneNumberExistsAsync(string phoneNumber);

        Task<bool> CompleteUserRegistration(Register register);

        //Login for Users
        Task<LoginResponse> UserLoginAsync(LogIn logIn);
        Task<Register> GetUserProfile(int userid);
        
    }
}
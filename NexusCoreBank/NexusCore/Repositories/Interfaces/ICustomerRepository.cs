using System.Threading.Tasks;
using NexusCore.CustomerLoginDTO;
using NexusCore.CustomerSignIn;
using NexusCore.LoginResponseDto;
using NexusCore.UpdatePersonalInformation;

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
        
        Task<bool> UpdateLegalInfo(int userid,UpdatePersonalInfo updatePersonalInfo);
    }
}
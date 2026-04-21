using NexusCore.CustomerRepositories;

namespace NexusCore.LoginResponseDto
{
    public class LoginResponse
    {
        public CustomerLoginResult status;
        public int UserId {get;set;}
        public string Role {get;set;} = "";
    }
}
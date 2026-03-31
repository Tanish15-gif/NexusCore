namespace NexusCore.LoginResponseDto
{
    public class LoginResponse
    {
        public int UserId {get;set;}
        public string Role {get;set;} = "";
        public bool Success {get;set;}
    }
}
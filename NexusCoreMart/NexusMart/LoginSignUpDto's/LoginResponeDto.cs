namespace NexusMart.LoginResponseDto
{
    public class LoginResponse
    {
        public int UserId {get;set;}
        public bool Success {get;set;}
        public string? Role {get;set;}
    }
}
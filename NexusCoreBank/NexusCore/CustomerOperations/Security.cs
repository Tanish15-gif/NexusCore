using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NexusCore.CustomerOperation
{
    public class TokenService
    {
        private readonly string token;

        public TokenService(IConfiguration config)
        {
            token = config["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JWT Secret Key is missing!");
        }
        public string GenerateToken(int userId, string role,string email)
        {
            var key = Encoding.UTF8.GetBytes(token);

            var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256Signature
            );

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.Email, email)
            };

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = credentials
            };

            var handler = new JwtSecurityTokenHandler();
            var securityToken = handler.CreateToken(descriptor);

            return handler.WriteToken(securityToken);
        }
    }
}
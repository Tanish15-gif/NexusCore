using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Threading.Tasks;

namespace NexusCore.Services
{
    public interface IEmailServices
    {
        Task<bool> SendOTpEmailAsync(string toEmail,string otpCode);
    }
    public class MailKitService : IEmailServices
    {
        private readonly IConfiguration _config;
        public MailKitService(IConfiguration config)
        {
            _config = config;
        }
        public async Task<bool> SendOTpEmailAsync(string toEmail,string otpCode)
        {
            try
            {
                var email = new MimeMessage();

                email.From.Add(new MailboxAddress("NexusNexusCore Security", _config["Email:SmtpUser"]!));
                email.To.Add(new MailboxAddress("Customer" , toEmail));

                email.Subject = "NexusCore: Action Required - Verification Code";

                email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px;'>
                            <h2 style='color: #2563eb;'>NexusCore Security</h2>
                            <p>You have initiated a high-value transaction or security action.</p>
                            <p>Your One-Time Password (OTP) is: <strong style='font-size: 24px; color: #0f172a;'>{otpCode}</strong></p>
                            <p style='color: #dc2626; font-size: 12px;'>Never share this code with anyone. NexusCore employees will never ask for this code.</p>
                        </div>"
                };
                using (var smtp = new SmtpClient())
                {
                    await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

                    await smtp.AuthenticateAsync(_config["Email:SmtpUser"]!, _config["Email:SmtpPass"]!);

                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMTP Postman Failed: {ex.Message}");
                return false;
            }
        }
    }
}
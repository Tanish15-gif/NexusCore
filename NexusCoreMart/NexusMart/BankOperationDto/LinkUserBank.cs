using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusMart.LinkBankAccountDto;
using System.Text;
using System.Text.Json;

namespace NexusMart.BankAccountOperation
{
    public class LinkUserBank
    {
        private readonly string? conn;
        public LinkUserBank(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public async Task<int> VerifyAndLinkBank(LinkBankAccount dto, int customerid)
        {
            try
            {
                using var client = new HttpClient();
                var json = JsonSerializer.Serialize(dto);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("http://localhost:5066/Account/verify-account", content);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return 2;
                }
                

                using (var connect = new SqlConnection(conn))
                {
                    await connect.OpenAsync();
                    string sql = @"
                                INSERT INTO LinkedBankAccounts (CustomerId, NexusCoreAccountNumber, AccountHolderName, IsVerified)
                                VALUES (@custId, @accNum, @name, 1)
                    ";
                    using (var cmd = new SqlCommand(sql, connect))
                    {
                        cmd.Parameters.AddWithValue("@custId", customerid);
                        cmd.Parameters.AddWithValue("@accNum", dto.AccountNumber);
                        cmd.Parameters.AddWithValue("@name", dto.FullName);

                        int rows = await cmd.ExecuteNonQueryAsync();

                        return rows > 0 ? 1 : 0;
                    }
                }
            }
            catch (Exception)
            {
                return 0;
            }
        }
    }
}
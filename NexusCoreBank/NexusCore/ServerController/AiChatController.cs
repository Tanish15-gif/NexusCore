using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using NexusCore.AiOperation;
using Microsoft.Data.SqlClient;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Identity;
using NexusCore.SpendingSummayDto;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using NexusCore.CustomerOperation;

namespace AiChatBotController.ControllerBase
{
    [ApiController]
    [Route("[controller]")]
    public class AiChatController : Controller
    {
        private readonly BudgetingService _budgetingService;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        public AiChatController
        (
            BudgetingService budgetingService,
            IHttpClientFactory httpClientFactory,
            IConfiguration config
        )
        {
            _budgetingService = budgetingService;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }
        [Authorize(Roles = "Customer")]
        [HttpPost("ask")]
        public async Task<IActionResult> AskAi([FromBody] ChatRequest chatRequest)
        {
            int userid = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            var list = _budgetingService.GetSummay(userid);
            string json = JsonSerializer.Serialize(list);

            string message = @"
            You are the NexusCore Wealth Manager. You have the user's total 30-day transaction summary,
            including income and expenses. Calculate the net balance,
            identify if they are in a deficit or surplus, 
            and give 2 specific pieces of advice to improve their financial health.
            Be professional and encouraging. Data: " + json;

            var payload = new
            {
                model = "openrouter/free",
                messages = new[]
                {
                    new{ role = "system",content = message},
                    new{role = "user",content = chatRequest.UserMessage}
                }
            };
            if (string.IsNullOrWhiteSpace(chatRequest.UserMessage))
            {
                return BadRequest("Message cannot be empty");
            }
            string? apiKey = _config["OpenAI:ApiKey"]; //Extracting the API Key from the Dotnet Secrets
            string jsonpayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonpayload, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",apiKey);

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            var response = await client.PostAsync("https://openrouter.ai/api/v1/chat/completions", content);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "AI service error");
            }
            string result = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(result);
            string aiReply = doc
                .RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString()!;
            return Ok(new
            {
                reply = aiReply
            });
        }
    }
}
public class ChatRequest
{
    public string UserMessage { get; set; } = "";
}
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.AI;
using OpenAI;
var builder = WebApplication.CreateBuilder(args);
var openAiKey = builder.Configuration["AI:OpenAI:ApiKey"];
if(!string.IsNullOrEmpty(openAiKey))
{
    builder.Services.AddSingleton(new OpenAIClient(openAiKey));
}
else
{
    Console.WriteLine("WARNING: OpenAI API Key is missing from User Secrets!");
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies";
    options.DefaultChallengeScheme = "Google"; 
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = builder.Configuration["JwtSettings:SecretKey"];

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),

        ValidateIssuer = false,
        ValidateAudience = false,

        ValidateLifetime = true
    };
})
.AddCookie("Cookies")
.AddGoogle("Google",googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
});
builder.Services.AddScoped<NexusCore.CustomerOperation.RegistrationOperation>();
builder.Services.AddScoped<NexusCore.CustomerOperation.CustomerLogin>();
builder.Services.AddScoped<NexusCore.CustomerOperation.RegisterViaGoogle>();
builder.Services.AddScoped<NexusCore.CustomerOperation.TokenService>();
builder.Services.AddScoped<NexusCore.AccountOperation.CreateAccount>();
builder.Services.AddScoped<NexusCore.AccountOperation.GetCustomerAccount>();
builder.Services.AddScoped<NexusCore.AccountOperation.AmountDeposit>();
builder.Services.AddScoped<NexusCore.AccountOperation.MoneyTransfer>();
builder.Services.AddScoped<NexusCore.AccountOperation.TransactionReceiptHistory>();
builder.Services.AddScoped<NexusCore.AccountOperation.AmountWithdraw>();
builder.Services.AddScoped<NexusCore.EmployeeOperation.DisplayPendingAccount>();
builder.Services.AddScoped<NexusCore.EmployeeOperation.Approval>();
builder.Services.AddScoped<NexusCore.EmployeeOperation.FetchEmployee>();
builder.Services.AddScoped<NexusCore.EmployeeOperation.FindCustomers>();
builder.Services.AddScoped<NexusCore.ManagerOperation.AllCustomerListManager>();
builder.Services.AddScoped<NexusCore.ManagerOperation.ListManager>();
builder.Services.AddScoped<NexusCore.ManagerOperation.ListEmployeeAuditLog>();
builder.Services.AddScoped<NexusCore.ManagerOperation.PendingDeposit>();
builder.Services.AddScoped<NexusCore.AdminOperation.StaffRegistration>();
builder.Services.AddScoped<NexusCore.AdminOperation.PromoteUser>();
builder.Services.AddScoped<NexusCore.AdminOperation.ShowStaffListInAdmin>();
builder.Services.AddScoped<NexusCore.AdminOperation.SystemInfo>();
builder.Services.AddScoped<NexusCore.AdminOperation.MasterAudiLog>();
builder.Services.AddScoped<NexusCore.AiOperation.BudgetingService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapControllers();
app.MapGet("/",() => Results.Redirect("/index.html"));

// string testpass = "123456";
// string hash  = BCrypt.Net.BCrypt.HashPassword(testpass);
// Console.WriteLine($"Copy this [{hash}]");
app.Run();
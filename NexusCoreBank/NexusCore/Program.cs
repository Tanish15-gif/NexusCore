using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.AI;
using OpenAI;
using NexusCore.AccountRepositories;
using NexusCore.AccountServices;
using NexusCore.TransactionServices;
using NexusCore.TransactionRepositories;
using NexusCore.Hubs;
using NexusCore.CustomerRepositories;
using NexusCore.CustomerServices;
using NexusCore.Services;
using NexusCore.BackGroundServices;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);
var openAiKey = builder.Configuration["AI:OpenAI:ApiKey"];
if (!string.IsNullOrEmpty(openAiKey))
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
        policy.WithOrigins("http://localhost:5066")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

    options.DefaultSignInScheme = "Cookies";
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
    options.Events  =new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if(!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
})
.AddCookie("Cookies")
.AddGoogle("Google", googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;

    googleOptions.Scope.Add("profile");
    googleOptions.ClaimActions.MapJsonKey("picture", "picture", "url");
});
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddHttpClient();

builder.Services.AddScoped<NexusCore.CustomerOperation.RegisterViaGoogle>();
builder.Services.AddScoped<NexusCore.CustomerOperation.TokenService>();
//Customer Dependency Injection
builder.Services.AddScoped<ICustomerRepositories, CustomerRepository>();
builder.Services.AddScoped<CustomerService>();

//Accounts Dependency Injection.
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<AccountService>();
//Transaction Dependency Injection.
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<TransactionService>();

//Email Kit DependencyInjection.
builder.Services.AddTransient<IEmailServices, MailKitService>();
builder.Services.AddMemoryCache();

//Midnight Robot DependencyInjection.
builder.Services.AddHostedService<MidNightInterestRobot>();

//Download Pdf Statement Pdf..
builder.Services.AddScoped<PdfStatementService>();

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

QuestPDF.Settings.License = LicenseType.Community;

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
app.MapHub<NotificationHub>("/notificationHub");
app.MapGet("/", () => Results.Redirect("/index.html"));

// string testpass = "123456";
// string hash  = BCrypt.Net.BCrypt.HashPassword(testpass);
// Console.WriteLine($"Copy this [{hash}]");
app.Run();
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NexusMart.Security;
using System.Text;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",policy =>
    {
        policy.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
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
});
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<NexusMart.LoginSignUpOperation.SignUpUser>();
builder.Services.AddScoped<NexusMart.LoginSignUpOperation.LoginUser>();
builder.Services.AddScoped<NexusMart.BankAccountOperation.LinkUserBank>();
builder.Services.AddScoped<NexusMart.BankAccountOperation.DisplayBank>();
builder.Services.AddScoped<NexusMart.BankAccountOperation.DisconnectBank>();
builder.Services.AddScoped<NexusMart.CustomerOperation.Details>();
builder.Services.AddScoped<NexusMart.CartOperation.CreateProduct>();
builder.Services.AddScoped<NexusMart.CartOperation.ProductDisplayInAdmin>();
builder.Services.AddScoped<NexusMart.CartOperation.EditProductInAdmin>();
builder.Services.AddScoped<NexusMart.OrderOperation.OrderService>();
builder.Services.AddScoped<NexusMart.OrderOperation.OrderReciept>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseDefaultFiles();
app.MapControllers();

app.MapGet("/",() => Results.Redirect("/index.html"));
app.Run();
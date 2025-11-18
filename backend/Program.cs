using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using DotNetEnv;

using System.Text;
using System.Security.Claims;

using backend.Services;
using backend.Endpoints;

Env.Load();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options => options.AddPolicy("AllowReactApp", policy => policy.WithOrigins("http://localhost:5174", "http://localhost:5173").AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key"));

    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

builder.Services.AddAuthorization();

builder.Services.AddDbContext<ApplicationDbContext>(options => {
    string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
    options.UseSqlServer(connectionString);
});

builder.Services.AddHttpClient();

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

string apiKey = Environment.GetEnvironmentVariable("RIOT_API_KEY") ?? "";

app.MapAuthEndpoints();
app.MapFavoritesEndpoints();
app.MapSearchAccountsEndpoints();
app.MapProfileEndpoint(apiKey);
app.MapUpdateProfileEndpoint(apiKey);
app.MapLiveGameEndpoint();
app.MapRacesEndpoints();

app.Run();
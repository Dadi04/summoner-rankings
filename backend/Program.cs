using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);
Env.Load();
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5174")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

builder.Services.AddDbContext<ApplicationDbContext>(options => {
    string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
    options.UseSqlServer(connectionString);
});

// Register HttpClient for external API calls
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowReactApp");

app.MapGet("/lol/profile/{region}/{SummonerName}-{SummonerTag}", async (string region, string summonerName, string SummonerTag, IHttpClientFactory httpClientFactory) => {
    string apiKey = Environment.GetEnvironmentVariable("RIOT_API_KEY") ?? "";
    
    var regionMapping = new Dictionary<string, string> {
        {"na1", "americas"},
        {"euw1", "europe"},
        {"eun1", "europe"},
        {"kr", "asia"},
        {"oc1", "sea"},
        {"br1", "americas"},
        {"la1", "americas"},
        {"la2", "americas"},
        {"jp1", "asia"},
        {"ru", "asia"},
        {"tr1", "asia"},
        {"sg2", "asia"},
        {"tw2", "asia"},
        {"vn2", "asia"},
        {"me1", "asia"},
    };

    if (!regionMapping.TryGetValue(region, out var continent)) {
        return Results.Problem("Invalid region specified.");
    }

    string url = $"https://{continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summonerName}/{SummonerTag}?api_key={apiKey}";

    var client = httpClientFactory.CreateClient();
    var response = await client.GetAsync(url);

    if (!response.IsSuccessStatusCode) {
        return Results.Problem($"Error calling Riot API: {response.ReasonPhrase}");
    }

    var json = await response.Content.ReadAsStreamAsync();
    var riotPlayer = JsonSerializer.Deserialize<RiotPlayerDto>(json, new JsonSerializerOptions {
        PropertyNameCaseInsensitive = true
    });

    if (riotPlayer is null) {
        return Results.NotFound("Player data not found");
    }

    return Results.Ok(riotPlayer);
});

app.Run();

public class RiotPlayerDto {
    public int Id {get; set;}
    public string Puuid { get; set; } = string.Empty;
    public string gameName { get; set; } = string.Empty;
    public string tagLine {get; set;} = string.Empty;
}
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
    {"ru", "europe"},
    {"tr1", "europe"},
    {"sg2", "sea"},
    {"tw2", "sea"},
    {"vn2", "sea"},
    {"me1", "europe"},
};

app.MapGet("/api/lol/profile/{region}/{SummonerName}-{SummonerTag}", async (string region, string summonerName, string SummonerTag, IHttpClientFactory httpClientFactory) => {
    if (!regionMapping.TryGetValue(region, out var continent)) {
        return Results.Problem("Invalid region specified.");
    }

    string accountUrl = $"https://{continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summonerName}/{SummonerTag}?api_key={apiKey}";

    var client = httpClientFactory.CreateClient();
    var accountResponse = await client.GetAsync(accountUrl);

    if (!accountResponse.IsSuccessStatusCode) {
        return Results.Problem($"Error calling Riot API: {accountResponse.ReasonPhrase}");
    }

    var accountJson = await accountResponse.Content.ReadAsStreamAsync();
    var riotAccount = JsonSerializer.Deserialize<RiotPlayerDto>(accountJson, new JsonSerializerOptions {
        PropertyNameCaseInsensitive = true
    });

    if (riotAccount is null) {
        return Results.NotFound("Player data not found");
    }
    // djole : oZ5OlpgjpgT62U26fLl86VVRTewH_6MUyyoNAjYViWXhh8PJVoaf7FCqZn2_fDaA6CDb6QsSp3wTFw
    string puuid = riotAccount.Puuid;

    string summonerUrl = $"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={apiKey}";
    string entriesUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}?api_key={apiKey}";
    // count
    string topMasteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3&api_key={apiKey}";
    // matchesUrl ima startTIme (sec), endTime (sec), queue, type, start, count
    string matchesUrl = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=20&api_key={apiKey}";
    string challengesUrl = $"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}?api_key={apiKey}";
    string spectatorUrl = $"https://{region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}?api_key={apiKey}"; // ukoliko nisi u gameu vraca 404
    string clashUrl = $"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}?api_key={apiKey}"; // ukoliko nisi u clashu vraca [] i vraca 200

    var summonerTask = client.GetStringAsync(summonerUrl);
    var entriesTask = client.GetStringAsync(entriesUrl);
    var topMasteriesTask = client.GetStringAsync(topMasteriesUrl);
    var matchesTask = client.GetStringAsync(matchesUrl);
    var challengesTask = client.GetStringAsync(challengesUrl);
    var clashTask = client.GetStringAsync(clashUrl);

    await Task.WhenAll(summonerTask, entriesTask, topMasteriesTask, matchesTask, challengesTask, clashTask);

    var spectatorResponse = await client.GetAsync(spectatorUrl);
    object? spectatorData = null;
    if (spectatorResponse.IsSuccessStatusCode) {
        var spectatorJson = await spectatorResponse.Content.ReadAsStringAsync();
        spectatorData = JsonSerializer.Deserialize<object>(spectatorJson);
    } else if (spectatorResponse.StatusCode == System.Net.HttpStatusCode.NotFound) {
        spectatorData = null;
    } else {
        Console.WriteLine($"Error calling spectator API: {spectatorResponse.StatusCode}");
    }

    var playerInfo = new {
        Player = riotAccount,
        Summoner = JsonSerializer.Deserialize<object>(await summonerTask),
        Entries = JsonSerializer.Deserialize<object>(await entriesTask),
        TopMasteries = JsonSerializer.Deserialize<object>(await topMasteriesTask),
        Matches = JsonSerializer.Deserialize<object>(await matchesTask),
        Challenges = JsonSerializer.Deserialize<object>(await challengesTask),
        Spectator = spectatorData,
        Clash = JsonSerializer.Deserialize<object>(await clashTask),
        Region = region,
    };

    return Results.Ok(playerInfo);
});

app.MapGet("/api/lol/profile/{region}/by-puuid/{puuid}/livegame", async (string region, string puuid, IHttpClientFactory httpClientFactory) => {
    var client = httpClientFactory.CreateClient();

    string summonerUrl = $"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={apiKey}";
    string entriesUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}?api_key={apiKey}";

    var summonerTask = client.GetStringAsync(summonerUrl);
    var entriesTask = client.GetStringAsync(entriesUrl);

    await Task.WhenAll(summonerTask, entriesTask);

    var liveGameInfo = new {
        Summoner = JsonSerializer.Deserialize<object>(await summonerTask),
        Entries = JsonSerializer.Deserialize<object>(await entriesTask),
    };

    return Results.Ok(liveGameInfo);
});


app.Run();

public class RiotPlayerDto {
    public int Id {get; set;}
    public string Puuid { get; set; } = string.Empty;
    public string gameName { get; set; } = string.Empty;
    public string tagLine {get; set;} = string.Empty;
}
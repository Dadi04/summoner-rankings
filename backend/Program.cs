using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using DotNetEnv;
using Azure;
using Polly;
using Polly.RateLimit;
using Microsoft.AspNetCore.Identity;

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

    string puuid = riotAccount.puuid;

    string entriesUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}?api_key={apiKey}";
    var entriesResponse = await client.GetAsync(entriesUrl);
    var entriesJson = await entriesResponse.Content.ReadAsStreamAsync();
    var entries = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(entriesJson, new JsonSerializerOptions {
        PropertyNameCaseInsensitive = true
    });

    var allMatches = new List<string>();
    var rankedSoloEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_SOLO_5x5"));
    if (rankedSoloEntry == null) return null;

    int wins = rankedSoloEntry.wins;
    int losses = rankedSoloEntry.losses;
    int totalMatches = wins+losses;

    int loopTimes = (int)Math.Ceiling((double)totalMatches/100);
    var rankedMatchesTasks = Enumerable.Range(0, loopTimes).Select(i => {
        int startAt = i * 100;
        string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime=1736452800&queue=420&start={startAt}&count=100&api_key={apiKey}";
        return client.GetStringAsync(url);
    }).ToList();

    var batchResults = await Task.WhenAll(rankedMatchesTasks);
    foreach (var result in batchResults) {
        var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
        if (rankedMatchArray != null) {
            allMatches.AddRange(rankedMatchArray);
        }
    }

    var retryPolicy = Policy
        .Handle<HttpRequestException>()
        .OrResult<HttpResponseMessage>(r => r.StatusCode == (HttpStatusCode)429)
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromMilliseconds(500)
        );

    int maxConcurrentRequests = 3;
    var semaphore = new SemaphoreSlim(maxConcurrentRequests);
    var rankedMatchDetailsTasks = allMatches.Select(async matchId => {
        await semaphore.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicy.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphore.Release();
        }
    }).ToList();

    var rankedMatchDetailsResponses = await Task.WhenAll(rankedMatchDetailsTasks);
    var rankedMatchInfoList = rankedMatchDetailsResponses.Where(info => info != null).ToList();

    var championStatsMap = new Dictionary<int, ChampionStats>();
    var preferredRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase){
        { "TOP", new PrefferedRole() },
        { "JUNGLE", new PrefferedRole() },
        { "MIDDLE", new PrefferedRole() },
        { "BOTTOM", new PrefferedRole() },
        { "UTILITY", new PrefferedRole() },
    };
    foreach (var match in rankedMatchInfoList) {
        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {ChampionName = participant.championName};
            championStatsMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.individualPosition.ToUpper();
        if (preferredRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
            preferredRole.Games++;
            if (participant.win) preferredRole.Wins++;
            preferredRole.TotalKills += participant.kills;
            preferredRole.TotalDeaths += participant.deaths;
            preferredRole.TotalAssists += participant.assists;
        }
    }
    
    string summonerUrl = $"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={apiKey}";
    string topMasteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3&api_key={apiKey}";
    string challengesUrl = $"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}?api_key={apiKey}";
    string spectatorUrl = $"https://{region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}?api_key={apiKey}"; // ukoliko nisi u gameu vraca 404
    string clashUrl = $"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}?api_key={apiKey}"; // ukoliko nisi u clashu vraca [] i vraca 200

    var summonerTask = client.GetStringAsync(summonerUrl);
    var topMasteriesTask = client.GetStringAsync(topMasteriesUrl);
    var challengesTask = client.GetStringAsync(challengesUrl);
    var clashTask = client.GetStringAsync(clashUrl);

    await Task.WhenAll(summonerTask, topMasteriesTask, challengesTask, clashTask);

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
        Entries = entries,
        TopMasteries = JsonSerializer.Deserialize<object>(await topMasteriesTask),
        Matches = allMatches,
        RankedMatches = rankedMatchInfoList,
        Challenges = JsonSerializer.Deserialize<object>(await challengesTask),
        Spectator = spectatorData,
        Clash = JsonSerializer.Deserialize<object>(await clashTask),
        Region = region,
        ChampionStats = championStatsMap.Values,
        PrefferedRole = preferredRoleMap.Values,
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
    public string puuid { get; set; } = string.Empty;
    public string gameName { get; set; } = string.Empty;
    public string tagLine {get; set;} = string.Empty;
}

public class LeagueEntriesDto {
    public string puuid { get; set; } = string.Empty;
    public string queueType { get; set; } = string.Empty;
    public string tier { get; set; } = string.Empty;
    public string rank { get; set; } = string.Empty;
    public int LeaguePoints { get; set; }
    public int wins { get; set; }
    public int losses { get; set; }
}

public class LeagueRankedSoloMatchDto {
    public LeagueRankedSoloMatchMetadataDto metadata { get; set; } = new LeagueRankedSoloMatchMetadataDto();
    public LeagueRankedSoloMatchInfoDto info { get; set; } = new LeagueRankedSoloMatchInfoDto();
}
public class LeagueRankedSoloMatchMetadataDto {
    public string matchId { get; set; } = string.Empty;
    public List<string> participants { get; set; } = new List<string>();
}

public class LeagueRankedSoloMatchInfoDto {
    public long gameCreation { get; set; }
    public int gameDuration { get; set; }
    public List<ParticipantDto> participants { get; set; } = new List<ParticipantDto>();
}

public class ParticipantDto {
    public int championId { get; set; }
    public string championName { get; set; } = string.Empty;
    public string individualPosition { get; set; } = string.Empty;
    public string teamPosition { get; set; } = string.Empty;
    public string lane { get; set; } = string.Empty;
    public int kills { get; set; }
    public int deaths { get; set; }
    public int assists { get; set; }
    public bool win { get; set; }
    public bool gameEndedInEarlySurrender { get; set; }
    public string puuid { get; set; }  = string.Empty;
}

public class ChampionStats {
    public int Games { get; set; }
    public int Wins { get; set; }
    public int TotalKills { get; set; }
    public int TotalDeaths { get; set; }
    public int TotalAssists { get; set; }
    public string ChampionName { get; set; } = string.Empty;
    public double WinRate => Games > 0 ? (double)Wins / Games * 100 : 0;
    public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
}

public class PrefferedRole {
    public int Games { get; set; }
    public int Wins { get; set; }
    public int TotalKills { get; set; }
    public int TotalDeaths { get; set; }
    public int TotalAssists { get; set; }
    public double WinRate => Games > 0 ? (double)Wins / Games * 100 : 0;
    public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
}
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
using backend.Models;

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
    
var manualMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
    { "Aatrox", "TOP" },
    { "Ambessa", "TOP" },
    { "Darius", "TOP" },
    { "DrMundo", "TOP" },
    { "Fiora", "TOP" },
    { "Gangplank", "TOP" },
    { "Garen", "TOP" },
    { "Gnar", "TOP" },
    { "Gragas", "TOP" },
    { "Graves", "TOP" },
    { "Gwen", "TOP" },
    { "Illaoi", "TOP" },
    { "Jax", "TOP" },
    { "Kayle", "TOP" },
    { "Kayn", "TOP" },
    { "Kled", "TOP" },
    { "KSante", "TOP" },
    { "Lillia", "TOP" },
    { "Mordekaiser", "TOP" },
    { "Nasus", "TOP" },
    { "Olaf", "TOP" },
    { "Ornn", "TOP" },
    { "Quinn", "TOP" },
    { "Rammus", "TOP" },
    { "Renekton", "TOP" },
    { "Rengar", "TOP" },
    { "Riven", "TOP" },
    { "Rumble", "TOP" },
    { "Sejuani", "TOP" },
    { "Sett", "TOP" },
    { "Shen", "TOP" },
    { "Shyvana", "TOP" },
    { "Singed", "TOP" },
    { "Sion", "TOP" },
    { "Skarner", "TOP" },
    { "Teemo", "TOP" },
    { "Trundle", "TOP" },
    { "Tryndamere", "TOP" },
    { "Udyr", "TOP" },
    { "Urgot", "TOP" },
    { "Vi", "TOP" },
    { "Volibear", "TOP" },
    { "Warwick", "TOP" },
    { "Wukong", "TOP" },
    { "XinZhao", "TOP" },
    { "Yorick", "TOP" },
    { "Zac", "TOP" },

    { "Ahri", "MID" },
    { "Akshan", "MID" },
    { "Anivia", "MID" },
    { "Annie", "MID" },
    { "Aurelion Sol", "MID" },
    { "Azir", "MID" },
    { "Diana", "MID" },
    { "Ekko", "MID" },
    { "Fizz", "MID" },
    { "Kassadin", "MID" },
    { "Katarina", "MID" },
    { "LeBlanc", "MID" },
    { "Lissandra", "MID" },
    { "Malzahar", "MID" },
    { "Naafiri", "MID" },
    { "Nocturne", "MID" },
    { "Nunu", "MID" },
    { "Orianna", "MID" },
    { "Qiyana", "MID" },
    { "Syndra", "MID" },
    { "Taliyah", "MID" },
    { "Talon", "MID" },
    { "TwistedFate", "MID" },
    { "Vex", "MID" },
    { "Viktor", "MID" },
    { "Zed", "MID" },
    { "Zoe", "MID" },

    { "Aphelios", "BOTTOM" },
    { "Ashe", "BOTTOM" },
    { "Caitlyn", "BOTTOM" },
    { "Draven", "BOTTOM" },
    { "Ezreal", "BOTTOM" },
    { "Jhin", "BOTTOM" },
    { "Jinx", "BOTTOM" },
    { "KaiSa", "BOTTOM" },
    { "Kalista", "BOTTOM" },
    { "Karthus", "BOTTOM" },
    { "KogMaw", "BOTTOM" },
    { "MissFortune", "BOTTOM" },
    { "Nilah", "BOTTOM" },
    { "Samira", "BOTTOM" },
    { "Sivir", "BOTTOM" },
    { "Twitch", "BOTTOM" },
    { "Varus", "BOTTOM" },
    { "Xayah", "BOTTOM" },
    { "Zeri", "BOTTOM" },

    { "Alistar", "UTILITY" },
    { "Amumu", "UTILITY" },
    { "Bard", "UTILITY" },
    { "Blitzcrank", "UTILITY" },
    { "Braum", "UTILITY" },
    { "Elise", "UTILITY" },
    { "Fiddlesticks", "UTILITY" },
    { "Janna", "UTILITY" },
    { "Karma", "UTILITY" },
    { "Leona", "UTILITY" },
    { "Lulu", "UTILITY" },
    { "Milio", "UTILITY" },
    { "Nami", "UTILITY" },
    { "Nautilus", "UTILITY" },
    { "Pyke", "UTILITY" },
    { "Rakan", "UTILITY" },
    { "Rell", "UTILITY" },
    { "Renata", "UTILITY" },
    { "Shaco", "UTILITY" },
    { "Sona", "UTILITY" },
    { "Soraka", "UTILITY" },
    { "Taric", "UTILITY" },
    { "Thresh", "UTILITY" },
    { "Yuumi", "UTILITY" },
    { "Zilean", "UTILITY" },
    { "Zyra", "UTILITY" },
};

var ambiguousMapping = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase) {
    { "Brand",      new[] { "UTILITY", "MID", "BOTTOM" } },
    { "Lux",        new[] { "UTILITY", "MID" } },
    { "Maokai",     new[] { "TOP", "UTILITY" } },
    { "Mel",        new[] { "MID", "BOTTOM", "UTILITY" } },
    { "Neeko",      new[] { "UTILITY", "MID" } },
    { "Pantheon",   new[] { "UTILITY", "TOP", "MID" } },
    { "Poppy",      new[] { "UTILITY", "TOP" } },
    { "Morgana",    new[] { "UTILITY", "MID" } },
    { "Senna",      new[] { "UTILITY", "BOTTOM" } },
    { "Seraphine",  new[] { "UTILITY", "BOTTOM", "MID" } },
    { "Swain",      new[] { "UTILITY", "MID", "BOTTOM", "TOP" } },
    { "TahmKench",  new[] { "UTILITY", "TOP" } },
    { "Velkoz",     new[] { "UTILITY", "MID" } },
    { "Nidalee",    new[] { "UTILITY", "TOP" } },
    { "Xerath",     new[] { "UTILITY", "MID" } },
    { "Corki",      new[] { "BOTTOM", "MID" } },
    { "Lucian",     new[] { "BOTTOM", "MID" } },
    { "Smolder",    new[] { "BOTTOM", "MID", "TOP" } },
    { "Tristana",   new[] { "BOTTOM", "MID" } },
    { "Vayne",      new[] { "BOTTOM", "TOP" } },
    { "Ziggs",      new[] { "BOTTOM", "MID" } },
    { "Akali",      new[] { "MID", "TOP" } },
    { "Aurora",     new[] { "MID", "TOP" } },
    { "Kennen",     new[] { "MID", "TOP" } },
    { "Cassiopeia", new[] { "MID", "TOP" } },
    { "Chogath",    new[] { "TOP", "MID" } },
    { "Galio",      new[] { "MID", "UTILITY", "TOP" } },
    { "Hwei",       new[] { "MID", "BOTTOM", "UTILITY" } },
    { "Irelia",     new[] { "TOP", "MID" } },
    { "Ryze",       new[] { "MID", "TOP" } },
    { "Sylas",      new[] { "MID", "TOP" } },
    { "Veigar",     new[] { "MID", "BOTTOM", "UTILITY" } },
    { "Viktor",     new[] { "MID", "BOTTOM" } },
    { "Vladimir",   new[] { "MID", "TOP" } },
    { "Yasuo",      new[] { "MID", "TOP", "BOTTOM" } },
    { "Yone",       new[] { "MID", "TOP" } },
    { "Zoe",        new[] { "MID", "UTILITY" } },
    { "Camille",    new[] { "TOP", "UTILITY" } },
    { "Heimer",     new[] { "TOP", "MID", "BOTTOM", "UTILITY" } },
    { "Jayce",      new[] { "TOP", "MID" } }
};

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

app.MapGet("/api/lol/profile/{region}/{summonerName}-{summonerTag}", async (string region, string summonerName, string summonerTag, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
    if (!regionMapping.TryGetValue(region, out var continent)) {
        return Results.Problem("Invalid region specified.");
    }

    var existingPlayer = await dbContext.Players.FirstOrDefaultAsync(p => p.SummonerName == summonerName
                                                                    && p.SummonerTag == summonerTag
                                                                    && p.Region == region);
    if (existingPlayer != null) {
        return Results.Ok(existingPlayer); 
    }

    var client = httpClientFactory.CreateClient();
    
    var retryPolicyResponse = Policy
        .Handle<HttpRequestException>()
        .OrResult<HttpResponseMessage>(r => r.StatusCode == (HttpStatusCode)429)
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)), // 2, 4, 8 sec...
            onRetry: (outcome, timespan, retryAttempt, context) => {
                Console.WriteLine($"[Response] Received {outcome.Result?.StatusCode}. Retrying after {timespan.TotalSeconds} seconds (attempt {retryAttempt}).");
            });

    var retryPolicyString = Policy
        .Handle<HttpRequestException>()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)), // 2, 4, 8 sec...
            onRetry: (exception, timespan, retryAttempt, context) => {
                Console.WriteLine($"[String] Exception: {exception.Message}. Retrying after {timespan.TotalSeconds} seconds (attempt {retryAttempt}).");
            });

    async Task<HttpResponseMessage> GetAsyncWithRetry(string url) {
        return await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
    }

    async Task<string> GetStringAsyncWithRetry(string url) {
        return await retryPolicyString.ExecuteAsync(() => client.GetStringAsync(url));
    }

    string accountUrl = $"https://{continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summonerName}/{summonerTag}?api_key={apiKey}";
    var accountResponse = await GetAsyncWithRetry(accountUrl);
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
    var entriesResponse = await GetAsyncWithRetry(entriesUrl);
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
        return GetStringAsyncWithRetry(url);
    }).ToList();

    var batchResults = await Task.WhenAll(rankedMatchesTasks);
    foreach (var result in batchResults) {
        var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
        if (rankedMatchArray != null) {
            allMatches.AddRange(rankedMatchArray);
        }
    }

    int maxConcurrentRequests = 3;
    var semaphore = new SemaphoreSlim(maxConcurrentRequests);
    var rankedMatchDetailsTasks = allMatches.Select(async matchId => {
        await semaphore.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
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
        { "MID", new PrefferedRole() },
        { "BOTTOM", new PrefferedRole() },
        { "UTILITY", new PrefferedRole() },
    };
    foreach (var match in rankedMatchInfoList) {
        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
            preferredRole.Games++;
            if (participant.win) preferredRole.Wins++;
            preferredRole.TotalKills += participant.kills;
            preferredRole.TotalDeaths += participant.deaths;
            preferredRole.TotalAssists += participant.assists;
        }
    }

    string spectatorUrl = $"https://{region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}?api_key={apiKey}";
    var spectatorResponse = await GetAsyncWithRetry(spectatorUrl);
    object? spectatorData = null;
    if (spectatorResponse.IsSuccessStatusCode) {
        var spectatorJson = await spectatorResponse.Content.ReadAsStringAsync();
        spectatorData = JsonSerializer.Deserialize<object>(spectatorJson);
    } else if (spectatorResponse.StatusCode == System.Net.HttpStatusCode.NotFound) {
        spectatorData = null;
    } else {
        Console.WriteLine($"Error calling spectator API: {spectatorResponse.StatusCode}");
    }

    var championRoleMapping = await BuildChampionRoleMappingAsync(client);

    if (spectatorData is JsonElement spectatorElement && spectatorElement.TryGetProperty("participants", out JsonElement participantsElement)) {
        var participantsWithRole = new List<ParticipantRoleDto>();
        foreach (var participant in participantsElement.EnumerateArray()) {
            int champId = participant.GetProperty("championId").GetInt32();
            string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MID";

            int spell1Id = participant.GetProperty("spell1Id").GetInt32();
            int spell2Id = participant.GetProperty("spell2Id").GetInt32();
            if (spell1Id == 11 || spell2Id == 11) {
                predictedRole = "JUNGLE";
            }

            var participantWithRole = new ParticipantRoleDto {
                puuid = participant.GetProperty("puuid").GetString() ?? string.Empty,
                teamId = participant.GetProperty("teamId").GetInt32(),
                spell1Id = participant.GetProperty("spell1Id").GetInt32(),
                spell2Id = participant.GetProperty("spell2Id").GetInt32(),
                championId = champId,
                profileIconId = participant.GetProperty("profileIconId").GetInt32(),
                riotId = participant.GetProperty("riotId").GetString() ?? string.Empty,
                bot = participant.GetProperty("bot").GetBoolean(),
                summonerId = participant.GetProperty("summonerId").GetString() ?? string.Empty,
                perks = participant.GetProperty("perks"),
                predictedRole = predictedRole
            };
            participantsWithRole.Add(participantWithRole);
        }

        var requiredRoles = new HashSet<string> { "TOP", "JUNGLE", "MID", "BOTTOM", "UTILITY" };
        var teams = participantsWithRole.GroupBy(p => p.teamId);
        foreach (var teamGroup in teams) {
            var assignedRoles = new HashSet<string>(teamGroup.Select(p => p.predictedRole), StringComparer.OrdinalIgnoreCase);
            var missingRoles = requiredRoles.Except(assignedRoles, StringComparer.OrdinalIgnoreCase).ToList();
            var duplicateRoles = teamGroup.GroupBy(p => p.predictedRole, StringComparer.OrdinalIgnoreCase)
                                        .Where(g => g.Count() > 1)
                                        .Select(g => g.Key)
                                        .ToList();

            foreach (var duplicateRole in duplicateRoles) {
                var playersWithDuplicateRole = teamGroup.Where(p => p.predictedRole.Equals(duplicateRole, StringComparison.OrdinalIgnoreCase)).ToList();
                foreach (var playerToReassign in playersWithDuplicateRole.Skip(1)) {
                    if (ambiguousMapping.TryGetValue(playerToReassign.championName, out string[]? possibleRoles)) {
                        var alternativeRole = possibleRoles.FirstOrDefault(r => 
                            missingRoles.Contains(r, StringComparer.OrdinalIgnoreCase) || 
                            !duplicateRoles.Contains(r, StringComparer.OrdinalIgnoreCase));
                            
                        if (alternativeRole != null) {
                            playerToReassign.predictedRole = alternativeRole;
                            if (missingRoles.Contains(alternativeRole, StringComparer.OrdinalIgnoreCase)) {
                                missingRoles.Remove(alternativeRole);
                            }
                        }
                    }
                }
            }

            assignedRoles = new HashSet<string>(teamGroup.Select(p => p.predictedRole), StringComparer.OrdinalIgnoreCase);
            missingRoles = requiredRoles.Except(assignedRoles, StringComparer.OrdinalIgnoreCase).ToList();

            foreach (var missingRole in missingRoles) {
                var candidate = teamGroup.FirstOrDefault(p => {
                    if (ambiguousMapping.TryGetValue(p.championName, out string[]? possibleRoles)) {
                        var currentRoleDuplicates = teamGroup.Count(t => 
                            t.predictedRole.Equals(p.predictedRole, StringComparison.OrdinalIgnoreCase));
                        return possibleRoles.Contains(missingRole, StringComparer.OrdinalIgnoreCase) 
                            && currentRoleDuplicates > 1;
                    }
                    return false;
                });
                if (candidate != null) {
                    candidate.predictedRole = missingRole;
                }
            }
        }

        // Sort participants by team and role
        var roleOrder = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) {
            { "TOP", 1 },
            { "JUNGLE", 2 },
            { "MID", 3 },
            { "BOTTOM", 4 },
            { "UTILITY", 5 }
        };

        var sortedParticipants = participantsWithRole
            .OrderBy(p => p.teamId)
            .ThenBy(p => roleOrder.GetValueOrDefault(p.predictedRole, 999))
            .ToList();

        spectatorData = JsonSerializer.Serialize(new { 
            gameId = spectatorElement.GetProperty("gameId").GetInt64(),
            gameType = spectatorElement.GetProperty("gameType").GetString(),
            gameStartTime = spectatorElement.GetProperty("gameStartTime").GetInt64(),
            mapId = spectatorElement.GetProperty("mapId").GetInt64(),
            gameLength = spectatorElement.GetProperty("gameLength").GetInt64(),
            platformId = spectatorElement.GetProperty("platformId").GetString(),
            gameMode = spectatorElement.GetProperty("gameMode").GetString(),
            bannedChampions = spectatorElement.GetProperty("bannedChampions"),
            gameQueueConfigId = spectatorElement.GetProperty("gameQueueConfigId").GetInt64(),
            participants = sortedParticipants, 
        });
    }

    string summonerUrl = $"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={apiKey}";
    string topMasteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3&api_key={apiKey}";
    string challengesUrl = $"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}?api_key={apiKey}";
    string clashUrl = $"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}?api_key={apiKey}"; // ukoliko nisi u clashu vraca [] i vraca 200

    var summonerTask = GetStringAsyncWithRetry(summonerUrl);
    var topMasteriesTask = GetStringAsyncWithRetry(topMasteriesUrl);
    var challengesTask = GetStringAsyncWithRetry(challengesUrl);
    var clashTask = GetStringAsyncWithRetry(clashUrl);

    await Task.WhenAll(summonerTask, topMasteriesTask, challengesTask, clashTask);

    var player  = new Player {
        SummonerName = summonerName,
        SummonerTag = summonerTag,
        Region = region,
        Puuid = puuid,
        SummonerData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await summonerTask)),
        EntriesData = JsonSerializer.Serialize(entries),
        TopMasteriesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await topMasteriesTask)),
        MatchesData = JsonSerializer.Serialize(allMatches),
        RankedMatchesData = JsonSerializer.Serialize(rankedMatchInfoList),
        ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask)),
        SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData),
        ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask)),
        ChampionStatsData = JsonSerializer.Serialize(championStatsMap.Values),
        PreferredRoleData = JsonSerializer.Serialize(preferredRoleMap.Values),
        AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    };
    dbContext.Players.Add(player);
    await dbContext.SaveChangesAsync();

    return Results.Ok(player);
});

app.MapGet("/api/lol/profile/{region}/{summonerName}-{summonerTag}/update", async (string region, string summonerName, string summonerTag, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
    if (!regionMapping.TryGetValue(region, out var continent)) {
        return Results.Problem("Invalid region specified.");
    }

    var existingPlayer = await dbContext.Players.FirstOrDefaultAsync(p => p.SummonerName == summonerName
                                                                    && p.SummonerTag == summonerTag
                                                                    && p.Region == region);
    if (existingPlayer == null) {
        return Results.NotFound(existingPlayer); 
    }

    var client = httpClientFactory.CreateClient();
    
    var retryPolicyResponse = Policy
        .Handle<HttpRequestException>()
        .OrResult<HttpResponseMessage>(r => r.StatusCode == (HttpStatusCode)429)
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)), // 2, 4, 8 sec...
            onRetry: (outcome, timespan, retryAttempt, context) => {
                Console.WriteLine($"[Response] Received {outcome.Result?.StatusCode}. Retrying after {timespan.TotalSeconds} seconds (attempt {retryAttempt}).");
            });

    var retryPolicyString = Policy
        .Handle<HttpRequestException>()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)), // 2, 4, 8 sec...
            onRetry: (exception, timespan, retryAttempt, context) => {
                Console.WriteLine($"[String] Exception: {exception.Message}. Retrying after {timespan.TotalSeconds} seconds (attempt {retryAttempt}).");
            });

    async Task<HttpResponseMessage> GetAsyncWithRetry(string url) {
        return await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
    }

    async Task<string> GetStringAsyncWithRetry(string url) {
        return await retryPolicyString.ExecuteAsync(() => client.GetStringAsync(url));
    }

    string accountUrl = $"https://{continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{summonerName}/{summonerTag}?api_key={apiKey}";
    var accountResponse = await GetAsyncWithRetry(accountUrl);
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
    var entriesResponse = await GetAsyncWithRetry(entriesUrl);
    var entriesJson = await entriesResponse.Content.ReadAsStreamAsync();
    var entries = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(entriesJson, new JsonSerializerOptions {
        PropertyNameCaseInsensitive = true
    });

    List<string> existingMatches = new();
    if (!string.IsNullOrEmpty(existingPlayer.MatchesData)) {
        existingMatches = JsonSerializer.Deserialize<List<string>>(existingPlayer.MatchesData) ?? new List<string>();
    }

    var newMatches = new List<string>();
    var rankedSoloEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_SOLO_5x5"));
    if (rankedSoloEntry == null) return null;

    int wins = rankedSoloEntry.wins;
    int losses = rankedSoloEntry.losses;
    int totalMatches = wins+losses;

    int loopTimes = (int)Math.Ceiling((double)totalMatches/100);
    var rankedMatchesTasks = Enumerable.Range(0, loopTimes).Select(i => {
        long startTime = existingPlayer.AddedAt > 0 ? existingPlayer.AddedAt : 1736452800;
        int startAt = i * 100;
        string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime={startTime}&queue=420&start={startAt}&count=100&api_key={apiKey}";
        return GetStringAsyncWithRetry(url);
    }).ToList();

    var batchResults = await Task.WhenAll(rankedMatchesTasks);
    foreach (var result in batchResults) {
        var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
        if (rankedMatchArray != null) {
            newMatches.AddRange(rankedMatchArray);
        }
    }

    var combinedMatches = existingMatches.Union(newMatches).ToList();

    var matchesToProcess = newMatches.Except(existingMatches).ToList();

    int maxConcurrentRequests = 3;
    var semaphore = new SemaphoreSlim(maxConcurrentRequests);
    var rankedMatchDetailsTasks = matchesToProcess.Select(async matchId => {
        await semaphore.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphore.Release();
        }
    }).ToList();

    var championStatsMap = new Dictionary<int, ChampionStats>();
    if (!string.IsNullOrEmpty(existingPlayer.ChampionStatsData)) {
        var existingChampionStats = JsonSerializer.Deserialize<List<ChampionStats>>(existingPlayer.ChampionStatsData);
        if (existingChampionStats != null) {
            championStatsMap = existingChampionStats.ToDictionary(cs => cs.ChampionId, cs => cs);
        }
    }

    // ne radi merge
    var requiredRolesAll = new[] { "TOP", "JUNGLE", "MID", "BOTTOM", "UTILITY" };
    Dictionary<string, PrefferedRole> preferredRoleMap;
    if (!string.IsNullOrEmpty(existingPlayer.PreferredRoleData)) {
        try {
            var rolesList = JsonSerializer.Deserialize<List<PrefferedRole>>(existingPlayer.PreferredRoleData)
                            ?? new List<PrefferedRole>();
            preferredRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < requiredRolesAll.Length; i++)
            {
                if (i < rolesList.Count)
                    preferredRoleMap[requiredRolesAll[i]] = rolesList[i];
                else
                    preferredRoleMap[requiredRolesAll[i]] = new PrefferedRole();
            }
        }
        catch {
            preferredRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole(), StringComparer.OrdinalIgnoreCase);
        }
    }
    else {
        preferredRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole(), StringComparer.OrdinalIgnoreCase);
    }


    var existingRankedMatches = new List<LeagueRankedSoloMatchDto>();
    if (!string.IsNullOrEmpty(existingPlayer.RankedMatchesData)) {
        existingRankedMatches = JsonSerializer.Deserialize<List<LeagueRankedSoloMatchDto>>(existingPlayer.RankedMatchesData)
                                ?? new List<LeagueRankedSoloMatchDto>();
    }

    var newRankedMatchDetails = (await Task.WhenAll(rankedMatchDetailsTasks)).Where(info => info != null).ToList();
    foreach (var match in newRankedMatchDetails) {
        if (match != null && !existingRankedMatches.Any(x => x.metadata.matchId == match.metadata.matchId)) {
            existingRankedMatches.Add(match);
        }

        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
            preferredRole.Games++;
            if (participant.win) preferredRole.Wins++;
            preferredRole.TotalKills += participant.kills;
            preferredRole.TotalDeaths += participant.deaths;
            preferredRole.TotalAssists += participant.assists;
        }
    }

    string spectatorUrl = $"https://{region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}?api_key={apiKey}";
    var spectatorResponse = await GetAsyncWithRetry(spectatorUrl);
    object? spectatorData = null;
    if (spectatorResponse.IsSuccessStatusCode) {
        var spectatorJson = await spectatorResponse.Content.ReadAsStringAsync();
        spectatorData = JsonSerializer.Deserialize<object>(spectatorJson);
    } else if (spectatorResponse.StatusCode == System.Net.HttpStatusCode.NotFound) {
        spectatorData = null;
    } else {
        Console.WriteLine($"Error calling spectator API: {spectatorResponse.StatusCode}");
    }

    var championRoleMapping = await BuildChampionRoleMappingAsync(client);

    if (spectatorData is JsonElement spectatorElement && spectatorElement.TryGetProperty("participants", out JsonElement participantsElement)) {
        var participantsWithRole = new List<ParticipantRoleDto>();
        foreach (var participant in participantsElement.EnumerateArray()) {
            int champId = participant.GetProperty("championId").GetInt32();
            string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MID";

            int spell1Id = participant.GetProperty("spell1Id").GetInt32();
            int spell2Id = participant.GetProperty("spell2Id").GetInt32();
            if (spell1Id == 11 || spell2Id == 11) {
                predictedRole = "JUNGLE";
            }

            var participantWithRole = new ParticipantRoleDto {
                puuid = participant.GetProperty("puuid").GetString() ?? string.Empty,
                teamId = participant.GetProperty("teamId").GetInt32(),
                spell1Id = participant.GetProperty("spell1Id").GetInt32(),
                spell2Id = participant.GetProperty("spell2Id").GetInt32(),
                championId = champId,
                profileIconId = participant.GetProperty("profileIconId").GetInt32(),
                riotId = participant.GetProperty("riotId").GetString() ?? string.Empty,
                bot = participant.GetProperty("bot").GetBoolean(),
                summonerId = participant.GetProperty("summonerId").GetString() ?? string.Empty,
                perks = participant.GetProperty("perks"),
                predictedRole = predictedRole
            };
            participantsWithRole.Add(participantWithRole);
        }

        var requiredRoles = new HashSet<string> { "TOP", "JUNGLE", "MID", "BOTTOM", "UTILITY" };
        var teams = participantsWithRole.GroupBy(p => p.teamId);
        foreach (var teamGroup in teams) {
            var assignedRoles = new HashSet<string>(teamGroup.Select(p => p.predictedRole), StringComparer.OrdinalIgnoreCase);
            var missingRoles = requiredRoles.Except(assignedRoles, StringComparer.OrdinalIgnoreCase).ToList();
            var duplicateRoles = teamGroup.GroupBy(p => p.predictedRole, StringComparer.OrdinalIgnoreCase)
                                        .Where(g => g.Count() > 1)
                                        .Select(g => g.Key)
                                        .ToList();

            foreach (var duplicateRole in duplicateRoles) {
                var playersWithDuplicateRole = teamGroup.Where(p => p.predictedRole.Equals(duplicateRole, StringComparison.OrdinalIgnoreCase)).ToList();
                foreach (var playerToReassign in playersWithDuplicateRole.Skip(1)) {
                    if (ambiguousMapping.TryGetValue(playerToReassign.championName, out string[]? possibleRoles)) {
                        var alternativeRole = possibleRoles.FirstOrDefault(r => 
                            missingRoles.Contains(r, StringComparer.OrdinalIgnoreCase) || 
                            !duplicateRoles.Contains(r, StringComparer.OrdinalIgnoreCase));
                            
                        if (alternativeRole != null) {
                            playerToReassign.predictedRole = alternativeRole;
                            if (missingRoles.Contains(alternativeRole, StringComparer.OrdinalIgnoreCase)) {
                                missingRoles.Remove(alternativeRole);
                            }
                        }
                    }
                }
            }

            assignedRoles = new HashSet<string>(teamGroup.Select(p => p.predictedRole), StringComparer.OrdinalIgnoreCase);
            missingRoles = requiredRoles.Except(assignedRoles, StringComparer.OrdinalIgnoreCase).ToList();

            foreach (var missingRole in missingRoles) {
                var candidate = teamGroup.FirstOrDefault(p => {
                    if (ambiguousMapping.TryGetValue(p.championName, out string[]? possibleRoles)) {
                        var currentRoleDuplicates = teamGroup.Count(t => 
                            t.predictedRole.Equals(p.predictedRole, StringComparison.OrdinalIgnoreCase));
                        return possibleRoles.Contains(missingRole, StringComparer.OrdinalIgnoreCase) 
                            && currentRoleDuplicates > 1;
                    }
                    return false;
                });
                if (candidate != null) {
                    candidate.predictedRole = missingRole;
                }
            }
        }

        // Sort participants by team and role
        var roleOrder = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) {
            { "TOP", 1 },
            { "JUNGLE", 2 },
            { "MID", 3 },
            { "BOTTOM", 4 },
            { "UTILITY", 5 }
        };

        var sortedParticipants = participantsWithRole
            .OrderBy(p => p.teamId)
            .ThenBy(p => roleOrder.GetValueOrDefault(p.predictedRole, 999))
            .ToList();

        spectatorData = JsonSerializer.Serialize(new { 
            gameId = spectatorElement.GetProperty("gameId").GetInt64(),
            gameType = spectatorElement.GetProperty("gameType").GetString(),
            gameStartTime = spectatorElement.GetProperty("gameStartTime").GetInt64(),
            mapId = spectatorElement.GetProperty("mapId").GetInt64(),
            gameLength = spectatorElement.GetProperty("gameLength").GetInt64(),
            platformId = spectatorElement.GetProperty("platformId").GetString(),
            gameMode = spectatorElement.GetProperty("gameMode").GetString(),
            bannedChampions = spectatorElement.GetProperty("bannedChampions"),
            gameQueueConfigId = spectatorElement.GetProperty("gameQueueConfigId").GetInt64(),
            participants = sortedParticipants, 
        });
    }

    string summonerUrl = $"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}?api_key={apiKey}";
    string topMasteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3&api_key={apiKey}";
    string challengesUrl = $"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}?api_key={apiKey}";
    string clashUrl = $"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}?api_key={apiKey}"; // ukoliko nisi u clashu vraca [] i vraca 200

    var summonerTask = GetStringAsyncWithRetry(summonerUrl);
    var topMasteriesTask = GetStringAsyncWithRetry(topMasteriesUrl);
    var challengesTask = GetStringAsyncWithRetry(challengesUrl);
    var clashTask = GetStringAsyncWithRetry(clashUrl);

    await Task.WhenAll(summonerTask, topMasteriesTask, challengesTask, clashTask);

    existingPlayer.Puuid = puuid;
    existingPlayer.SummonerData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await summonerTask));
    existingPlayer.EntriesData = JsonSerializer.Serialize(entries);
    existingPlayer.TopMasteriesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await topMasteriesTask));
    existingPlayer.MatchesData = JsonSerializer.Serialize(combinedMatches);
    existingPlayer.RankedMatchesData = JsonSerializer.Serialize(existingRankedMatches);
    existingPlayer.ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask));
    existingPlayer.SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData);
    existingPlayer.ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask));
    existingPlayer.ChampionStatsData = JsonSerializer.Serialize(championStatsMap.Values);
    existingPlayer.PreferredRoleData = JsonSerializer.Serialize(preferredRoleMap.Values);
    existingPlayer.AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    await dbContext.SaveChangesAsync();
    Console.WriteLine(existingPlayer.SpectatorData);
    return Results.Ok(existingPlayer);
});

app.MapGet("/api/lol/profile/{region}/by-puuid/{puuid}/livegame", async (string region, string puuid, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
    if (!regionMapping.TryGetValue(region, out var continent)) {
        return Results.Problem("Invalid region specified.");
    }

    var player = await dbContext.Players.FirstOrDefaultAsync(p => p.Puuid == puuid);
    if (player == null) {
        return Results.NotFound("Player not found.");
    }

    return Results.Ok(player);
});

async Task<Dictionary<int, string>> BuildChampionRoleMappingAsync(HttpClient client) {
    string championDataUrl = "https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json";
    string championJson = await client.GetStringAsync(championDataUrl);
    using JsonDocument doc = JsonDocument.Parse(championJson);
    var root = doc.RootElement;
    var championData = root.GetProperty("data");

    var tagRoleMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { "Marksman", "BOTTOM" },
        { "Support", "UTILITY" },
        { "Mage", "MID" },
        { "Assassin", "MID" },
        { "Fighter", "TOP" },
        { "Tank", "TOP" }
    };
    
    var championRoleMapping = new Dictionary<int, string>();

    foreach (var champProperty in championData.EnumerateObject()) {
        var champ = champProperty.Value;
        string champName = champ.GetProperty("id").GetString() ?? "";
        string keyString = champ.GetProperty("key").GetString() ?? "";

        if (!int.TryParse(keyString, out int champId)) {
            continue;
        }

        if (manualMapping.TryGetValue(champName, out string? role)) {
            championRoleMapping[champId] = role;
        } else if (ambiguousMapping.TryGetValue(champName, out string[]? possibleRoles)) {
            var championTags = champ.GetProperty("tags").EnumerateArray().Select(t => t.GetString()).Where(s => !string.IsNullOrEmpty(s)).Select(s => s!).ToList();
            var potentialRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            
            foreach (var tag in championTags) {
                if (tagRoleMapping.TryGetValue(tag, out var tagBasedRole)) {
                    potentialRoles.Add(tagBasedRole);
                }
            }

            var selectedRole = possibleRoles.FirstOrDefault(r => potentialRoles.Contains(r)) ?? possibleRoles.First();
            championRoleMapping[champId] = selectedRole;
        } else {
            var tags = champ.GetProperty("tags").EnumerateArray().Select(t => t.GetString()).ToList();
            if (tags.Contains("Marksman")) championRoleMapping[champId] = "BOTTOM";
            else if (tags.Contains("Support")) championRoleMapping[champId] = "SUPPORT";
            else if (tags.Contains("Mage") || tags.Contains("Assassin")) championRoleMapping[champId] = "MID";
            else if (tags.Contains("Fighter") || tags.Contains("Tank")) championRoleMapping[champId] = "TOP";
            else championRoleMapping[champId] = "MID";
        }
    }

    return championRoleMapping;
}


app.Run();

public class ParticipantRoleDto {
    public string puuid { get; set; } = string.Empty;
    public int teamId { get; set; }
    public int spell1Id { get; set; }
    public int spell2Id { get; set; }
    public int championId { get; set; }
    public string championName { get; set; } = string.Empty;
    public int profileIconId { get; set; }
    public string riotId { get; set; } = string.Empty;
    public bool bot { get; set; }
    public string summonerId { get; set; } = string.Empty;
    public JsonElement perks { get; set; }
    public string predictedRole { get; set; } = string.Empty;
}

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
    public int ChampionId { get; set; }
    public string ChampionName { get; set; } = string.Empty;
    public int Games { get; set; }
    public int Wins { get; set; }
    public int TotalKills { get; set; }
    public int TotalDeaths { get; set; }
    public int TotalAssists { get; set; }
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
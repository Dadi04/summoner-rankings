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

    { "Ahri", "MIDDLE" },
    { "Akshan", "MIDDLE" },
    { "Anivia", "MIDDLE" },
    { "Annie", "MIDDLE" },
    { "Aurelion Sol", "MIDDLE" },
    { "Azir", "MIDDLE" },
    { "Diana", "MIDDLE" },
    { "Ekko", "MIDDLE" },
    { "Fizz", "MIDDLE" },
    { "Kassadin", "MIDDLE" },
    { "Katarina", "MIDDLE" },
    { "LeBlanc", "MIDDLE" },
    { "Lissandra", "MIDDLE" },
    { "Malzahar", "MIDDLE" },
    { "Naafiri", "MIDDLE" },
    { "Nocturne", "MIDDLE" },
    { "Nunu", "MIDDLE" },
    { "Orianna", "MIDDLE" },
    { "Qiyana", "MIDDLE" },
    { "Talon", "MIDDLE" },
    { "TwistedFate", "MIDDLE" },
    { "Vex", "MIDDLE" },
    { "Viktor", "MIDDLE" },
    { "Zed", "MIDDLE" },
    { "Zoe", "MIDDLE" },

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
};

var ambiguousMapping = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase) {
    { "Brand",      new[] { "UTILITY", "MIDDLE", "BOTTOM" } },
    { "Lux",        new[] { "UTILITY", "MIDDLE" } },
    { "Mel",        new[] { "MIDDLE", "BOTTOM", "UTILITY" } },
    { "Neeko",      new[] { "UTILITY", "MIDDLE" } },
    { "Pantheon",   new[] { "UTILITY", "TOP", "MIDDLE" } },
    { "Poppy",      new[] { "UTILITY", "TOP" } },
    { "Morgana",    new[] { "UTILITY", "MIDDLE" } },
    { "Senna",      new[] { "UTILITY", "BOTTOM" } },
    { "Seraphine",  new[] { "UTILITY", "BOTTOM", "MIDDLE" } },
    { "Swain",      new[] { "UTILITY", "MIDDLE", "BOTTOM", "TOP" } },
    { "TahmKench",  new[] { "UTILITY", "TOP" } },
    { "Velkoz",     new[] { "UTILITY", "MIDDLE" } },
    { "Nidalee",    new[] { "UTILITY", "TOP" } },
    { "Maokai",     new[] { "UTILITY", "TOP" } },
    { "Xerath",     new[] { "UTILITY", "MIDDLE" } },
    { "Corki",      new[] { "BOTTOM", "MIDDLE" } },
    { "Lucian",     new[] { "BOTTOM", "MIDDLE" } },
    { "Smolder",    new[] { "BOTTOM", "MIDDLE", "TOP" } },
    { "Tristana",   new[] { "BOTTOM", "MIDDLE" } },
    { "Vayne",      new[] { "BOTTOM", "TOP" } },
    { "Ziggs",      new[] { "BOTTOM", "MIDDLE" } },
    { "Zyra",       new[] { "UTILITY", "BOTTOM" } },
    { "Akali",      new[] { "MIDDLE", "TOP" } },
    { "Aurora",     new[] { "MIDDLE", "TOP" } },
    { "Kennen",     new[] { "MIDDLE", "TOP" } },
    { "Cassiopeia", new[] { "MIDDLE", "TOP" } },
    { "Chogath",    new[] { "TOP", "MIDDLE" } },
    { "Galio",      new[] { "MIDDLE", "UTILITY", "TOP" } },
    { "Hwei",       new[] { "MIDDLE", "BOTTOM", "UTILITY" } },
    { "Irelia",     new[] { "TOP", "MIDDLE" } },
    { "Ryze",       new[] { "MIDDLE", "TOP" } },
    { "Sylas",      new[] { "MIDDLE", "TOP" } },
    { "Veigar",     new[] { "MIDDLE", "BOTTOM", "UTILITY" } },
    { "Viktor",     new[] { "MIDDLE", "BOTTOM" } },
    { "Syndra",     new[] { "MIDDLE", "BOTTOM" } },
    { "Vladimir",   new[] { "MIDDLE", "TOP" } },
    { "Yasuo",      new[] { "MIDDLE", "TOP", "BOTTOM" } },
    { "Yone",       new[] { "MIDDLE", "TOP" } },
    { "Zoe",        new[] { "MIDDLE", "UTILITY" } },
    { "Taliyah",    new[] { "MIDDLE", "BOTTOM" } },
    { "Camille",    new[] { "TOP", "UTILITY" } },
    { "Heimer",     new[] { "TOP", "MIDDLE", "BOTTOM", "UTILITY" } },
    { "Jayce",      new[] { "TOP", "MIDDLE" } },
    { "Karma",      new[] { "UTILITY", "MIDDLE", "TOP" } },
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

// get last 30 games and their info
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

    string soloDuoMessage = "";
    int winsSoloDuo = 0, lossesSoloDuo = 0, totalSoloDuoMatches = 0;
    var rankedSoloDuoEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_SOLO_5x5"));
    if (rankedSoloDuoEntry == null) {
        soloDuoMessage = "Ranked Solo/Duo entry not found for the specified player.";
    } else {
        winsSoloDuo = rankedSoloDuoEntry.wins;
        lossesSoloDuo = rankedSoloDuoEntry.losses;
        totalSoloDuoMatches = winsSoloDuo+lossesSoloDuo;
    }

    var allRankedSoloDuoMatches = new List<string>();
    if (totalSoloDuoMatches > 0) {

        int loopTimesSoloDuo = (int)Math.Ceiling((double)totalSoloDuoMatches/100);
        var rankedSoloMatchesTasks = Enumerable.Range(0, loopTimesSoloDuo).Select(i => {
            int startAt = i * 100;
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime=1736452800&queue=420&start={startAt}&count=100&api_key={apiKey}";
            return GetStringAsyncWithRetry(url);
        }).ToList();

        var batchSoloDuoResults = await Task.WhenAll(rankedSoloMatchesTasks);
        foreach (var result in batchSoloDuoResults) {
            var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
            if (rankedMatchArray != null) {
                allRankedSoloDuoMatches.AddRange(rankedMatchArray);
            }
        }
    }

    int maxConcurrentRequests = 3;
    var semaphoreSoloDuo = new SemaphoreSlim(maxConcurrentRequests);
    var rankedSoloDuoMatchDetailsTasks = allRankedSoloDuoMatches.Select(async matchId => {
        await semaphoreSoloDuo.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphoreSoloDuo.Release();
        }
    }).ToList();

    var rankedSoloDuoMatchDetailsResponses = await Task.WhenAll(rankedSoloDuoMatchDetailsTasks);
    var rankedSoloDuoMatchInfoList = rankedSoloDuoMatchDetailsResponses.Where(info => info != null).ToList();

    var championStatsSoloDuoMap = new Dictionary<int, ChampionStats>();
    var preferredSoloDuoRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase){
        { "TOP", new PrefferedRole { RoleName = "TOP" } },
        { "JUNGLE", new PrefferedRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PrefferedRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PrefferedRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PrefferedRole { RoleName = "UTILITY" } },
    };
    foreach (var match in rankedSoloDuoMatchInfoList) {
        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsSoloDuoMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsSoloDuoMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredSoloDuoRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
            preferredRole.Games++;
            if (participant.win) preferredRole.Wins++;
            preferredRole.TotalKills += participant.kills;
            preferredRole.TotalDeaths += participant.deaths;
            preferredRole.TotalAssists += participant.assists;
        }
    }

    string flexMessage = "";
    int winsFlex = 0, lossesFlex = 0, totalFlexMatches = 0;
    var rankedFlexEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_FLEX_SR"));
    if (rankedFlexEntry == null) {
        flexMessage = "Ranked Flex entry not found for the specified player.";
    } else {
        winsFlex = rankedFlexEntry.wins;
        lossesFlex = rankedFlexEntry.losses;
        totalFlexMatches = winsFlex+lossesFlex;
    }

    var allRankedFlexMatches = new List<string>();
    int loopTimesFlex = (int)Math.Ceiling((double)totalFlexMatches/100);
    var rankedFlexMatchesTasks = Enumerable.Range(0, loopTimesFlex).Select(i => {
        int startAt = i * 100;
        string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime=1736452800&queue=440&start={startAt}&count=100&api_key={apiKey}";
        return GetStringAsyncWithRetry(url);
    }).ToList();

    var batchFlexResults = await Task.WhenAll(rankedFlexMatchesTasks);
    foreach (var result in batchFlexResults) {
        var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
        if (rankedMatchArray != null) {
            allRankedFlexMatches.AddRange(rankedMatchArray);
        }
    }

    var semaphoreFlex = new SemaphoreSlim(maxConcurrentRequests);
    var rankedFlexMatchDetailsTasks = allRankedFlexMatches.Select(async matchId => {
        await semaphoreFlex.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphoreFlex.Release();
        }
    }).ToList();

    var rankedFlexMatchDetailsResponses = await Task.WhenAll(rankedFlexMatchDetailsTasks);
    var rankedFlexMatchInfoList = rankedFlexMatchDetailsResponses.Where(info => info != null).ToList();

    var championStatsFlexMap = new Dictionary<int, ChampionStats>();
    var preferredFlexRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase){
        { "TOP", new PrefferedRole { RoleName = "TOP" } },
        { "JUNGLE", new PrefferedRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PrefferedRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PrefferedRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PrefferedRole { RoleName = "UTILITY" } },
    };
    foreach (var match in rankedFlexMatchInfoList) {
        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsFlexMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsFlexMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredFlexRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
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
            string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MIDDLE";

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

        var requiredRoles = new HashSet<string> { "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY" };
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
            { "MIDDLE", 3 },
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
        SoloDuoMatchesData = JsonSerializer.Serialize(allRankedSoloDuoMatches),
        SoloDuoMatchesDetailsData = JsonSerializer.Serialize(rankedSoloDuoMatchInfoList),
        FlexMatchesData = JsonSerializer.Serialize(allRankedFlexMatches),
        FlexMatchesDetailsData = JsonSerializer.Serialize(rankedFlexMatchInfoList),
        ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask)),
        SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData),
        ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask)),
        ChampionStatsSoloDuoData = JsonSerializer.Serialize(championStatsSoloDuoMap.Values),
        PreferredSoloDuoRoleData = JsonSerializer.Serialize(preferredSoloDuoRoleMap.Values),
        ChampionStatsFlexData = JsonSerializer.Serialize(championStatsFlexMap.Values),
        PreferredFlexRoleData = JsonSerializer.Serialize(preferredFlexRoleMap.Values),
        AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        SoloDuoMessage = soloDuoMessage,
        FlexMessage = flexMessage,
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

    string soloDuoMessage = "";
    int winsSoloDuo = 0, lossesSoloDuo = 0, totalSoloDuoMatches = 0;
    var rankedSoloDuoEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_SOLO_5x5"));
    if (rankedSoloDuoEntry == null) {
        soloDuoMessage = "Ranked Solo/Duo entry not found for the specified player.";
    } else {
        winsSoloDuo = rankedSoloDuoEntry.wins;
        lossesSoloDuo = rankedSoloDuoEntry.losses;
        totalSoloDuoMatches = winsSoloDuo + lossesSoloDuo;
    }

    var newSoloDuoMatches = new List<string>();
    if (totalSoloDuoMatches > 0) {
        int loopTimesSoloDuo = (int)Math.Ceiling((double)totalSoloDuoMatches/100);
        var rankedMatchesTasks = Enumerable.Range(0, loopTimesSoloDuo).Select(i => {
            long startTime = existingPlayer.AddedAt > 0 ? existingPlayer.AddedAt : 1736452800;
            int startAt = i * 100;
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime={startTime}&queue=420&start={startAt}&count=100&api_key={apiKey}";
            return GetStringAsyncWithRetry(url);
        }).ToList();

        var batchResults = await Task.WhenAll(rankedMatchesTasks);
        foreach (var result in batchResults) {
            var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
            if (rankedMatchArray != null) {
                newSoloDuoMatches.AddRange(rankedMatchArray);
            }
        }
    }
    
    List<string> existingSoloDuoMatches = new();
    if (!string.IsNullOrEmpty(existingPlayer.SoloDuoMatchesData)) {
        existingSoloDuoMatches = JsonSerializer.Deserialize<List<string>>(existingPlayer.SoloDuoMatchesData) ?? new List<string>();
    }

    var combinedSoloDuoMatches = existingSoloDuoMatches.Union(newSoloDuoMatches).ToList();
    var soloDuoMatchesToProcess = newSoloDuoMatches.Except(existingSoloDuoMatches).ToList();

    int maxConcurrentRequests = 3;
    var semaphoreSoloDuo = new SemaphoreSlim(maxConcurrentRequests);
    var rankedSoloDuoMatchDetailsTasks = soloDuoMatchesToProcess.Select(async matchId => {
        await semaphoreSoloDuo.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphoreSoloDuo.Release();
        }
    }).ToList();

    var championStatsSoloDuoMap = new Dictionary<int, ChampionStats>();
    if (!string.IsNullOrEmpty(existingPlayer.ChampionStatsSoloDuoData)) {
        var existingChampionStats = JsonSerializer.Deserialize<List<ChampionStats>>(existingPlayer.ChampionStatsSoloDuoData);
        if (existingChampionStats != null) {
            championStatsSoloDuoMap = existingChampionStats.ToDictionary(cs => cs.ChampionId, cs => cs);
        }
    }

    var requiredRolesAll = new[] { "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY" };
    Dictionary<string, PrefferedRole> preferredSoloDuoRoleMap;

    if (!string.IsNullOrEmpty(existingPlayer.PreferredSoloDuoRoleData)) {
        try {
            var rolesList = JsonSerializer.Deserialize<List<PrefferedRole>>(existingPlayer.PreferredSoloDuoRoleData)
                            ?? new List<PrefferedRole>();
            preferredSoloDuoRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < requiredRolesAll.Length; i++) {
                string roleName = requiredRolesAll[i];
                if (i < rolesList.Count) {
                    var roleData = rolesList[i];
                    roleData.RoleName = roleName;
                    preferredSoloDuoRoleMap[roleName] = roleData;
                }
                else {
                    preferredSoloDuoRoleMap[roleName] = new PrefferedRole { RoleName = roleName };
                }
            }
        }
        catch {
            preferredSoloDuoRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole { RoleName = role }, StringComparer.OrdinalIgnoreCase);
        }
    }
    else {
        preferredSoloDuoRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole { RoleName = role }, StringComparer.OrdinalIgnoreCase);
    }


    var existingRankedMatches = new List<LeagueRankedSoloMatchDto>();
    if (!string.IsNullOrEmpty(existingPlayer.RankedMatchesData)) {
        existingRankedMatches = JsonSerializer.Deserialize<List<LeagueRankedSoloMatchDto>>(existingPlayer.RankedMatchesData)
                                ?? new List<LeagueRankedSoloMatchDto>();
    }

    var newRankedSoloDuoMatchDetails = (await Task.WhenAll(rankedSoloDuoMatchDetailsTasks)).Where(info => info != null).ToList();
    foreach (var match in newRankedSoloDuoMatchDetails) {
        if (match != null && !existingRankedMatches.Any(x => x.metadata.matchId == match.metadata.matchId)) {
            existingRankedMatches.Add(match);
        }

        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsSoloDuoMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsSoloDuoMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredSoloDuoRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
            preferredRole.Games++;
            if (participant.win) preferredRole.Wins++;
            preferredRole.TotalKills += participant.kills;
            preferredRole.TotalDeaths += participant.deaths;
            preferredRole.TotalAssists += participant.assists;
        }
    }

    string flexMessage = "";
    int winsFlex = 0, lossesFlex = 0, totalFlexMatches = 0;
    var rankedFlexEntry = entries?.FirstOrDefault(entry => entry.queueType.Equals("RANKED_FLEX_SR"));
    if (rankedFlexEntry == null) {
        flexMessage = "Ranked Flex entry not found for the specified player.";
    } else {
        winsFlex = rankedFlexEntry.wins;
        lossesFlex = rankedFlexEntry.losses;
        totalFlexMatches = winsFlex + lossesFlex;
    }

    var newFlexMatches = new List<string>();
    if (totalFlexMatches > 0) {
        int loopTimes = (int)Math.Ceiling((double)totalFlexMatches/100);
        var rankedFlexMatchesTasks = Enumerable.Range(0, loopTimes).Select(i => {
            long startTime = existingPlayer.AddedAt > 0 ? existingPlayer.AddedAt : 1736452800;
            int startAt = i * 100;
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime={startTime}&queue=420&start={startAt}&count=100&api_key={apiKey}";
            return GetStringAsyncWithRetry(url);
        }).ToList();

        var batchFlexResults = await Task.WhenAll(rankedFlexMatchesTasks);
        foreach (var result in batchFlexResults) {
            var rankedMatchArray = JsonSerializer.Deserialize<string[]>(result);
            if (rankedMatchArray != null) {
                newFlexMatches.AddRange(rankedMatchArray);
            }
        }
    }
    
    List<string> existingFlexMatches = new();
    if (!string.IsNullOrEmpty(existingPlayer.SoloDuoMatchesData)) {
        existingFlexMatches = JsonSerializer.Deserialize<List<string>>(existingPlayer.SoloDuoMatchesData) ?? new List<string>();
    }

    var combinedFlexMatches = existingFlexMatches.Union(newFlexMatches).ToList();
    var flexMatchesToProcess = newFlexMatches.Except(existingFlexMatches).ToList();

    var semaphoreFlex = new SemaphoreSlim(maxConcurrentRequests);
    var rankedFlexMatchDetailsTasks = flexMatchesToProcess.Select(async matchId => {
        await semaphoreFlex.WaitAsync();
        try {
            string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            HttpResponseMessage response = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(url));
            string content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LeagueRankedSoloMatchDto>(
                content, new JsonSerializerOptions {PropertyNameCaseInsensitive = true});
        } finally {
            semaphoreFlex.Release();
        }
    }).ToList();

    var championStatsFlexMap = new Dictionary<int, ChampionStats>();
    if (!string.IsNullOrEmpty(existingPlayer.ChampionStatsSoloDuoData)) {
        var existingChampionStats = JsonSerializer.Deserialize<List<ChampionStats>>(existingPlayer.ChampionStatsSoloDuoData);
        if (existingChampionStats != null) {
            championStatsFlexMap = existingChampionStats.ToDictionary(cs => cs.ChampionId, cs => cs);
        }
    }

    Dictionary<string, PrefferedRole> preferredFlexRoleMap;
    if (!string.IsNullOrEmpty(existingPlayer.PreferredSoloDuoRoleData)) {
        try {
            var rolesList = JsonSerializer.Deserialize<List<PrefferedRole>>(existingPlayer.PreferredSoloDuoRoleData) ?? new List<PrefferedRole>();
            preferredFlexRoleMap = new Dictionary<string, PrefferedRole>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < requiredRolesAll.Length; i++) {
                string roleName = requiredRolesAll[i];
                if (i < rolesList.Count) {
                    var roleData = rolesList[i];
                    roleData.RoleName = roleName;
                    preferredFlexRoleMap[roleName] = roleData;
                } else {
                    preferredFlexRoleMap[roleName] = new PrefferedRole { RoleName = roleName };
                }
            }
        } catch {
            preferredFlexRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole { RoleName = role }, StringComparer.OrdinalIgnoreCase);
        }
    } else {
        preferredFlexRoleMap = requiredRolesAll.ToDictionary(role => role, role => new PrefferedRole { RoleName = role }, StringComparer.OrdinalIgnoreCase);
    }


    var existingRankedFlexMatches = new List<LeagueRankedSoloMatchDto>();
    if (!string.IsNullOrEmpty(existingPlayer.RankedMatchesData)) {
        existingRankedMatches = JsonSerializer.Deserialize<List<LeagueRankedSoloMatchDto>>(existingPlayer.RankedMatchesData) ?? new List<LeagueRankedSoloMatchDto>();
    }

    var newRankedFlexMatchDetails = (await Task.WhenAll(rankedFlexMatchDetailsTasks)).Where(info => info != null).ToList();
    foreach (var match in newRankedFlexMatchDetails) {
        if (match != null && !existingRankedMatches.Any(x => x.metadata.matchId == match.metadata.matchId)) {
            existingRankedMatches.Add(match);
        }

        var participant = match?.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null || participant.gameEndedInEarlySurrender) continue;

        int champId = participant.championId;
        if (!championStatsFlexMap.TryGetValue(champId, out ChampionStats? stats)) {
            stats = new ChampionStats {
                ChampionId = champId,
                ChampionName = participant.championName
            };
            championStatsFlexMap[champId] = stats;
        }
        stats.Games++;
        if (participant.win) stats.Wins++;
        stats.TotalKills += participant.kills;
        stats.TotalDeaths += participant.deaths;
        stats.TotalAssists += participant.assists;

        string role = participant.teamPosition.ToUpper();
        if (preferredFlexRoleMap.TryGetValue(role, out PrefferedRole? preferredRole)) {
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
            string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MIDDLE";

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

        var requiredRoles = new HashSet<string> { "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY" };
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
                        var currentRoleDuplicates = teamGroup.Count(t => t.predictedRole.Equals(p.predictedRole, StringComparison.OrdinalIgnoreCase));
                        return possibleRoles.Contains(missingRole, StringComparer.OrdinalIgnoreCase) && currentRoleDuplicates > 1;
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
            { "MIDDLE", 3 },
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
    existingPlayer.SoloDuoMatchesData = JsonSerializer.Serialize(combinedSoloDuoMatches);
    existingPlayer.SoloDuoMatchesDetailsData = JsonSerializer.Serialize(existingSoloDuoMatches);
    existingPlayer.FlexMatchesData = JsonSerializer.Serialize(combinedFlexMatches);
    existingPlayer.FlexMatchesDetailsData = JsonSerializer.Serialize(existingFlexMatches);
    existingPlayer.ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask));
    existingPlayer.SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData);
    existingPlayer.ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask));
    existingPlayer.ChampionStatsSoloDuoData = JsonSerializer.Serialize(championStatsSoloDuoMap.Values);
    existingPlayer.PreferredSoloDuoRoleData = JsonSerializer.Serialize(preferredSoloDuoRoleMap.Values);
    existingPlayer.ChampionStatsFlexData = JsonSerializer.Serialize(championStatsFlexMap.Values);
    existingPlayer.PreferredFlexRoleData = JsonSerializer.Serialize(preferredFlexRoleMap.Values);
    existingPlayer.AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    existingPlayer.SoloDuoMessage = soloDuoMessage;
    existingPlayer.FlexMessage = flexMessage;

    await dbContext.SaveChangesAsync();
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
        { "Mage", "MIDDLE" },
        { "Assassin", "MIDDLE" },
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
            else if (tags.Contains("Mage") || tags.Contains("Assassin")) championRoleMapping[champId] = "MIDDLE";
            else if (tags.Contains("Fighter") || tags.Contains("Tank")) championRoleMapping[champId] = "TOP";
            else championRoleMapping[champId] = "MIDDLE";
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
    public string RoleName { get; set; } = string.Empty;
    public int Games { get; set; }
    public int Wins { get; set; }
    public int TotalKills { get; set; }
    public int TotalDeaths { get; set; }
    public int TotalAssists { get; set; }
    public double WinRate => Games > 0 ? (double)Wins / Games * 100 : 0;
    public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
}
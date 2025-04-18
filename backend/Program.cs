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
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;

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
        var errorContent = await accountResponse.Content.ReadAsStringAsync();
        return Results.Problem($"Error calling Riot API: {accountResponse.ReasonPhrase}. Response: {errorContent}");
    }

    using var accountStream = await accountResponse.Content.ReadAsStreamAsync();
    var riotAccount = JsonSerializer.Deserialize<RiotPlayerDto>(accountStream, new JsonSerializerOptions {
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

    var allMatchIds = new List<string>();
    int totalMatchesToFetch = 1000; // ???
    int loopTimes = (int)Math.Ceiling(totalMatchesToFetch / 100.0);
    var matchListTasks = Enumerable.Range(0, loopTimes).Select(i => {
        int startAt = i * 100;
        string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime=1736409600&start={startAt}&count=100&api_key={apiKey}";
        return GetStringAsyncWithRetry(url);
    }).ToList();

    var batchMatchResults = await Task.WhenAll(matchListTasks);
    foreach (var result in batchMatchResults) {
        var matchIdArray = JsonSerializer.Deserialize<string[]>(result);
        if (matchIdArray != null) {
            allMatchIds.AddRange(matchIdArray);
        }
    }

    int maxConcurrentRequests = 3;
    var semaphore = new SemaphoreSlim(maxConcurrentRequests);
    async Task<LeagueMatchDto?> FetchMatchWithTimelineAsync(string matchId) {
        await semaphore.WaitAsync();
        try {
            var detailUrl = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            var detailResp = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(detailUrl));
            if (!detailResp.IsSuccessStatusCode) return null;
            var detailJson = await detailResp.Content.ReadAsStringAsync();
            var detailsDto = JsonSerializer.Deserialize<LeagueMatchDetailsDto>(
                                JsonDocument.Parse(detailJson)
                                            .RootElement
                                            .GetRawText(), 
                                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                                ) ?? new LeagueMatchDetailsDto();

            var timelineUrl = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}/timeline?api_key={apiKey}";
            var timelineResp = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(timelineUrl));
            if (!timelineResp.IsSuccessStatusCode) return null;
            var timelineJson = await timelineResp.Content.ReadAsStringAsync();
            var timelineDto = JsonSerializer.Deserialize<LeagueMatchTimelineDto>(
                                timelineJson,
                                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                                ) ?? new LeagueMatchTimelineDto();

            return new LeagueMatchDto {
                details = detailsDto,
                timeline = timelineDto
            };
        }
        finally {
            semaphore.Release();
        }
    }

    var fetchTasks = allMatchIds
        .Select(id => FetchMatchWithTimelineAsync(id))
        .ToList();

    var allMatchesDataList = (await Task.WhenAll(fetchTasks))
        .Where(m => m != null && m.details?.info?.participants != null)
        .ToList()!;

    var allPuuids = allMatchesDataList
        .Where(m => m?.details?.info?.participants != null)
        .SelectMany(m => m!.details?.info!.participants!)
        .Select(p => p.puuid)
        .Distinct()
        .ToList();

    var entryCache = new Dictionary<string, LeagueMatchSoloDuoEntryDto>();

    foreach (var playerUuid in allPuuids) {
        string entrySoloDuoUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{playerUuid}?api_key={apiKey}";
        var resp = await GetAsyncWithRetry(entrySoloDuoUrl);
        if (!resp.IsSuccessStatusCode) continue;

        var list = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(
            await resp.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
        var solo = list?.FirstOrDefault(e => e.queueType == "RANKED_SOLO_5x5");
        if (solo != null) {
            entryCache[playerUuid] = new LeagueMatchSoloDuoEntryDto {
                freshBlood = solo.freshBlood,
                inactive = solo.inactive,
                veteran = solo.veteran,
                hotStreak = solo.hotStreak,
                tier = solo.tier,
                rank = solo.rank,
                leaguePoints = solo.leaguePoints,
                puuid = solo.puuid
            };
        }
    }

    foreach (var match in allMatchesDataList) {
        if (match == null || match.details.info == null || match.details.info.participants == null) continue;

        foreach (var participant in match.details.info.participants) {
            if (entryCache.TryGetValue(participant.puuid, out var dto)) participant.entry = dto;
        }
    }

    int rankedSoloQueueId = 420;
    int rankedFlexQueueId = 440;

    var allGamesChampionStats = new Dictionary<int, ChampionStats>();

    var allGamesRoleStats = new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase) {
        { "TOP", new PreferredRole { RoleName = "TOP" } },
        { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
    };

    var championStatsByQueue = new Dictionary<int, Dictionary<int, ChampionStats>>();
    championStatsByQueue[rankedSoloQueueId] = new Dictionary<int, ChampionStats>();
    championStatsByQueue[rankedFlexQueueId] = new Dictionary<int, ChampionStats>();

    var roleStatsByQueue = new Dictionary<int, Dictionary<string, PreferredRole>>();
    roleStatsByQueue[rankedSoloQueueId] = new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase) {
        { "TOP", new PreferredRole { RoleName = "TOP" } },
        { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
    };
    roleStatsByQueue[rankedFlexQueueId] = new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase) {
        { "TOP", new PreferredRole { RoleName = "TOP" } },
        { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
    };

    foreach (var match in allMatchesDataList) {
        if (match == null) continue;
        int queueId = match.details.info.queueId;
        var participant = match.details.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null) {
            Console.WriteLine($"Invalid matches: {match.details.metadata.matchId}");
            continue;
        }

        void UpdateChampionStats(Dictionary<int, ChampionStats> statsDict) {
            int champId = participant.championId;
            if (!statsDict.TryGetValue(champId, out ChampionStats? stats)) {
                stats = new ChampionStats
                {
                    ChampionId = champId,
                    ChampionName = participant.championName
                };
                statsDict[champId] = stats;
            }
            stats.Games++;
            if (participant.win) stats.Wins++;
            stats.TotalKills += participant.kills;
            stats.TotalDeaths += participant.deaths;
            stats.TotalAssists += participant.assists;
        }

        void UpdateRoleStats(Dictionary<string, PreferredRole> roleDict) {
            string role = participant.teamPosition.ToUpper();
            if (roleDict.TryGetValue(role, out PreferredRole? preferredRole)) {
                preferredRole.Games++;
                if (participant.win) preferredRole.Wins++;
                preferredRole.TotalKills += participant.kills;
                preferredRole.TotalDeaths += participant.deaths;
                preferredRole.TotalAssists += participant.assists;
            }
        }

        UpdateChampionStats(allGamesChampionStats);
        UpdateRoleStats(allGamesRoleStats);

        if (queueId == rankedSoloQueueId) {
            UpdateChampionStats(championStatsByQueue[rankedSoloQueueId]);
            UpdateRoleStats(roleStatsByQueue[rankedSoloQueueId]);
        } else if (queueId == rankedFlexQueueId) {
            UpdateChampionStats(championStatsByQueue[rankedFlexQueueId]);
            UpdateRoleStats(roleStatsByQueue[rankedFlexQueueId]);
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
        ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask)),
        SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData),
        ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask)),

        AllMatchIds = JsonSerializer.Serialize(allMatchIds),
        AllMatchesData = JsonSerializer.Serialize(allMatchesDataList),
        AllGamesChampionStatsData = JsonSerializer.Serialize(allGamesChampionStats),
        AllGamesRoleStatsData = JsonSerializer.Serialize(allGamesRoleStats),
        RankedSoloChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedSoloQueueId]),
        RankedSoloRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedSoloQueueId]),
        RankedFlexChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedFlexQueueId]),
        RankedFlexRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedFlexQueueId]),

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

    int totalMatchesToFetch = 1000;
    int loopTimes = (int)Math.Ceiling(totalMatchesToFetch / 100.0);
    var newMatchIds = new List<string>();
    long startTime = existingPlayer.AddedAt > 0 ? existingPlayer.AddedAt-300 : 1736409600;
    for (int i = 0; i < loopTimes; i++) {
        int startAt = i * 100;
        string url = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?startTime={startTime}&start={startAt}&count=100&api_key={apiKey}";
        string matchIdsJson = await GetStringAsyncWithRetry(url);
        var matchIds = JsonSerializer.Deserialize<string[]>(matchIdsJson);
        if (matchIds != null) {
            newMatchIds.AddRange(matchIds);
        }
    }

    int maxConcurrentRequests = 3;
    var semaphore = new SemaphoreSlim(maxConcurrentRequests);
    async Task<LeagueMatchDto?> FetchMatchWithTimeline(string matchId) {
        await semaphore.WaitAsync();
        try {
            // details
            var detUrl = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}";
            var detResp = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(detUrl));
            if (!detResp.IsSuccessStatusCode) return null;
            var detJson = await detResp.Content.ReadAsStringAsync();
            var detailsDto = JsonSerializer.Deserialize<LeagueMatchDetailsDto>(
                JsonDocument.Parse(detJson)
                           .RootElement
                           .GetRawText(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;

            // timeline
            var tlUrl  = $"https://{continent}.api.riotgames.com/lol/match/v5/matches/{matchId}/timeline?api_key={apiKey}";
            var tlResp = await retryPolicyResponse.ExecuteAsync(() => client.GetAsync(tlUrl));
            if (!tlResp.IsSuccessStatusCode) return null;
            var tlJson = await tlResp.Content.ReadAsStringAsync();
            var timelineDto = JsonSerializer.Deserialize<LeagueMatchTimelineDto>(
                tlJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;

            return new LeagueMatchDto {
                details = detailsDto,
                timeline = timelineDto
            };
        }
        finally {
            semaphore.Release();
        }
    }

    var fetched = await Task.WhenAll(newMatchIds.Select(FetchMatchWithTimeline));
    var newMatchesList = fetched
        .Where(m => m?.details?.info?.participants?.Any() == true)
        .ToList()!;

    int rankedSoloQueueId = 420;
    int rankedFlexQueueId = 440;

    var allGamesChampionStats = new Dictionary<int, ChampionStats>();
    var championStatsByQueue = new Dictionary<int, Dictionary<int, ChampionStats>> {
        { rankedSoloQueueId, new Dictionary<int, ChampionStats>() },
        { rankedFlexQueueId, new Dictionary<int, ChampionStats>() }
    };

    var allGamesRoleStats = new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase) {
        { "TOP", new PreferredRole { RoleName = "TOP" } },
        { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
        { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
        { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
        { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
    };

    var roleStatsByQueue = new Dictionary<int, Dictionary<string, PreferredRole>> {
        { rankedSoloQueueId, new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase)
            {
                { "TOP", new PreferredRole { RoleName = "TOP" } },
                { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
                { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
                { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
                { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
            }
        },
        { rankedFlexQueueId, new Dictionary<string, PreferredRole>(StringComparer.OrdinalIgnoreCase)
            {
                { "TOP", new PreferredRole { RoleName = "TOP" } },
                { "JUNGLE", new PreferredRole { RoleName = "JUNGLE" } },
                { "MIDDLE", new PreferredRole { RoleName = "MIDDLE" } },
                { "BOTTOM", new PreferredRole { RoleName = "BOTTOM" } },
                { "UTILITY", new PreferredRole { RoleName = "UTILITY" } },
            }
        }
    };

    foreach (var match in newMatchesList) {
        if (match == null) continue;
        int queueId = match.details.info.queueId;
        var participant = match.details.info.participants.FirstOrDefault(p => p.puuid == puuid);
        if (participant == null) {
            Console.WriteLine($"Invalid matches: {match.details.metadata.matchId}");
            continue;
        }
        // if (participant == null || participant.gameEndedInEarlySurrender) continue;

        void UpdateChampionStats(Dictionary<int, ChampionStats> statsDict) {
            int champId = participant.championId;
            if (!statsDict.TryGetValue(champId, out ChampionStats? stats)) {
                stats = new ChampionStats {
                    ChampionId = champId,
                    ChampionName = participant.championName
                };
                statsDict[champId] = stats;
            }
            stats.Games++;
            if (participant.win) stats.Wins++;
            stats.TotalKills += participant.kills;
            stats.TotalDeaths += participant.deaths;
            stats.TotalAssists += participant.assists;
        }
        void UpdateRoleStats(Dictionary<string, PreferredRole> roleDict) {
            string role = participant.teamPosition.ToUpper();
            if (roleDict.TryGetValue(role, out PreferredRole? preferredRole)) {
                preferredRole.Games++;
                if (participant.win)
                    preferredRole.Wins++;
                preferredRole.TotalKills += participant.kills;
                preferredRole.TotalDeaths += participant.deaths;
                preferredRole.TotalAssists += participant.assists;
            }
        }

        UpdateChampionStats(allGamesChampionStats);
        UpdateRoleStats(allGamesRoleStats);

        if (queueId == rankedSoloQueueId) {
            UpdateChampionStats(championStatsByQueue[rankedSoloQueueId]);
            UpdateRoleStats(roleStatsByQueue[rankedSoloQueueId]);
        }
        else if (queueId == rankedFlexQueueId) {
            UpdateChampionStats(championStatsByQueue[rankedFlexQueueId]);
            UpdateRoleStats(roleStatsByQueue[rankedFlexQueueId]);
        }
    }

    Dictionary<int, ChampionStats> MergeChampionStats(Dictionary<int, ChampionStats> existingStats, Dictionary<int, ChampionStats> newStats) {
        foreach (var kvp in newStats) {
            if (existingStats.TryGetValue(kvp.Key, out var existing)) {
                existing.Games += kvp.Value.Games;
                existing.Wins += kvp.Value.Wins;
                existing.TotalKills += kvp.Value.TotalKills;
                existing.TotalDeaths += kvp.Value.TotalDeaths;
                existing.TotalAssists += kvp.Value.TotalAssists;
            }
            else {
                existingStats[kvp.Key] = kvp.Value;
            }
        }
        return existingStats;
    }

    Dictionary<string, PreferredRole> MergeRoleStats(Dictionary<string, PreferredRole> existingStats, Dictionary<string, PreferredRole> newStats) {
        foreach (var kvp in newStats) {
            if (existingStats.TryGetValue(kvp.Key, out var existing)) {
                existing.Games += kvp.Value.Games;
                existing.Wins += kvp.Value.Wins;
                existing.TotalKills += kvp.Value.TotalKills;
                existing.TotalDeaths += kvp.Value.TotalDeaths;
                existing.TotalAssists += kvp.Value.TotalAssists;
            }
            else {
                existingStats[kvp.Key] = kvp.Value;
            }
        }
        return existingStats;
    }

    if (!string.IsNullOrEmpty(existingPlayer.AllGamesChampionStatsData)) {
        var existingAllGamesChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStats>>(existingPlayer.AllGamesChampionStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStats>();
        allGamesChampionStats = MergeChampionStats(existingAllGamesChampStats, allGamesChampionStats);
    }

    if (!string.IsNullOrEmpty(existingPlayer.AllGamesRoleStatsData)) {
        var existingAllGamesRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRole>>(existingPlayer.AllGamesRoleStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRole>();
        allGamesRoleStats = MergeRoleStats(existingAllGamesRoleStats, allGamesRoleStats);
    }

    if (!string.IsNullOrEmpty(existingPlayer.RankedSoloChampionStatsData)) {
        var existingRankedSoloChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStats>>(existingPlayer.RankedSoloChampionStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStats>();
        championStatsByQueue[rankedSoloQueueId] = MergeChampionStats(existingRankedSoloChampStats, championStatsByQueue[rankedSoloQueueId]);
    }

    if (!string.IsNullOrEmpty(existingPlayer.RankedSoloRoleStatsData)) {
        var existingRankedSoloRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRole>>(existingPlayer.RankedSoloRoleStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRole>();
        roleStatsByQueue[rankedSoloQueueId] = MergeRoleStats(existingRankedSoloRoleStats, roleStatsByQueue[rankedSoloQueueId]);
    }

    if (!string.IsNullOrEmpty(existingPlayer.RankedFlexChampionStatsData)) {
        var existingRankedFlexChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStats>>(existingPlayer.RankedFlexChampionStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStats>();
        championStatsByQueue[rankedFlexQueueId] = MergeChampionStats(existingRankedFlexChampStats, championStatsByQueue[rankedFlexQueueId]);
    }

    if (!string.IsNullOrEmpty(existingPlayer.RankedFlexRoleStatsData)) {
        var existingRankedFlexRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRole>>(existingPlayer.RankedFlexRoleStatsData,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRole>();
        roleStatsByQueue[rankedFlexQueueId] = MergeRoleStats(existingRankedFlexRoleStats, roleStatsByQueue[rankedFlexQueueId]);
    }

    var existingMatchesList = string.IsNullOrEmpty(existingPlayer.AllMatchesData) ? new List<LeagueMatchDto>() : JsonSerializer.Deserialize<List<LeagueMatchDto>>(
            existingPlayer.AllMatchesData!,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    var validExistingDetails = existingMatchesList.Where(m => m != null && m.details.metadata != null && m.details.metadata.matchId != null).ToList();
    var validNewDetails = newMatchesList.Where(m => m != null && m.details.metadata != null && m.details.metadata.matchId != null).ToList();

    var mergedMatchList = existingMatchesList
        .Concat(newMatchesList)
        .GroupBy(m => m?.details.metadata.matchId)
        .Select(g => g.First())
        .OrderByDescending(m => m?.details.info.gameStartTimestamp)
        .ToList();

    var allPuuids = mergedMatchList
        .SelectMany(m => m?.details.info.participants!)
        .Select(p => p.puuid)
        .Distinct()
        .ToList();
        
    var entryCache = new Dictionary<string, LeagueMatchSoloDuoEntryDto>();
    foreach (var playerUuid in allPuuids) {
        string entrySoloDuoUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{playerUuid}?api_key={apiKey}";
        var resp = await GetAsyncWithRetry(entrySoloDuoUrl);
        if (!resp.IsSuccessStatusCode) continue;

        var list = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(
            await resp.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        var solo = list?.FirstOrDefault(e => e.queueType == "RANKED_SOLO_5x5");
        if (solo != null)  {
            entryCache[playerUuid] = new LeagueMatchSoloDuoEntryDto {
                freshBlood = solo.freshBlood,
                inactive = solo.inactive,
                veteran = solo.veteran,
                hotStreak = solo.hotStreak,
                tier = solo.tier,
                rank = solo.rank,
                leaguePoints = solo.leaguePoints,
                puuid = solo.puuid
            };
        }
    }

    foreach (var match in mergedMatchList) {
        if (match == null || match.details.info == null || match.details.info.participants == null) continue;

        foreach (var participant in match.details.info.participants) {
            if (entryCache.TryGetValue(participant.puuid, out var dto)) participant.entry = dto;
        }
    }

    List<string> existingMatchIdsList = new List<string>();
    if (!string.IsNullOrEmpty(existingPlayer.AllMatchIds)) {
        existingMatchIdsList = JsonSerializer.Deserialize<List<string>>(existingPlayer.AllMatchIds) ?? new List<string>();
    }
    var mergedMatchIds = newMatchIds.Union(existingMatchIdsList).ToList();

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
    existingPlayer.ChallengesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await challengesTask));
    existingPlayer.SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData);
    existingPlayer.ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask));

    existingPlayer.AllMatchIds = JsonSerializer.Serialize(mergedMatchIds);
    existingPlayer.AllMatchesData = JsonSerializer.Serialize(mergedMatchList);
    existingPlayer.AllGamesChampionStatsData = JsonSerializer.Serialize(allGamesChampionStats);
    existingPlayer.AllGamesRoleStatsData = JsonSerializer.Serialize(allGamesRoleStats);
    existingPlayer.RankedSoloChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedSoloQueueId]);
    existingPlayer.RankedSoloRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedSoloQueueId]);
    existingPlayer.RankedFlexChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedFlexQueueId]);
    existingPlayer.RankedFlexRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedFlexQueueId]);

    existingPlayer.AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

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
    public int leaguePoints { get; set; }
    public bool freshBlood  { get; set; }
    public bool inactive  { get; set; }
    public bool veteran  { get; set; }
    public bool hotStreak  { get; set; }
    public int wins { get; set; }
    public int losses { get; set; }
}

public class LeagueMatchDto {
    public LeagueMatchDetailsDto details { get; set; } = new LeagueMatchDetailsDto();
    public LeagueMatchTimelineDto timeline { get; set; } = new LeagueMatchTimelineDto();
}

public class LeagueMatchDetailsDto {
    public LeagueMatchMetadataDto metadata { get; set; } = new LeagueMatchMetadataDto();
    public LeagueMatchInfoDto info { get; set; } = new LeagueMatchInfoDto();
}

public class LeagueMatchMetadataDto {
    public string dataVersion { get; set; } = string.Empty;
    public string matchId { get; set; } = string.Empty;
    public List<string> participants { get; set; } = new List<string>();
}

public class LeagueMatchInfoDto {
    public string endOfGameResult { get; set; } = string.Empty;
    public long gameCreation { get; set; }
    public int gameDuration { get; set; }
    public long gameEndTimestamp { get; set; }
    public long gameId { get; set; }
    public string gameMode { get; set; } = string.Empty;
    public string gameName { get; set; } = string.Empty;
    public long gameStartTimestamp { get; set; }
    public string gameType { get; set; } = string.Empty;
    public string gameVersion { get; set; } = string.Empty;
    public int mapId { get; set; }
    public List<ParticipantDto> participants { get; set; } = new List<ParticipantDto>();
    public string platformId { get; set; } = string.Empty;
    public int queueId { get; set; }
    public List<TeamDto> teams { get; set; } = new List<TeamDto>();
    public string tournamentCode { get; set; } = string.Empty;
}

public class TeamDto {
    public List<BanDto> bans { get; set; } = new List<BanDto>();
    public TeamObjectivesDto objectives { get; set; } = new TeamObjectivesDto();
    public int teamId { get; set; }
    public bool win { get; set; }
}

public class BanDto {
    public int championId { get; set; }
    public int pickTurn { get; set; }
}

public class TeamObjectivesDto {
    public ObjectiveDto baron { get; set; } = new ObjectiveDto();
    public ObjectiveDto champion { get; set; } = new ObjectiveDto();
    public ObjectiveDto dragon { get; set; } = new ObjectiveDto();
    public ObjectiveDto horde { get; set; } = new ObjectiveDto();
    public ObjectiveDto inhibitor { get; set; } = new ObjectiveDto();
    public ObjectiveDto riftHerald { get; set; } = new ObjectiveDto();
    public ObjectiveDto tower { get; set; } = new ObjectiveDto();
}

public class ObjectiveDto {
    public bool first { get; set; }
    public int kills { get; set; }
}

public class ParticipantDto {
    // Early/General match state
    public bool teamEarlySurrendered { get; set; }
    public bool gameEndedInEarlySurrender { get; set; }
    public bool gameEndedInSurrender { get; set; }

    // Basic stats
    public bool win { get; set; }
    public int kills { get; set; }
    public int deaths { get; set; }
    public int assists { get; set; }
    public bool firstBloodKill { get; set; }
    public bool firstBloodAssist { get; set; }
    public LeagueMatchSoloDuoEntryDto entry { get; set; } = new LeagueMatchSoloDuoEntryDto();

    // Progression and timing
    public bool eligibleForProgression { get; set; }
    public int timePlayed { get; set; }

    // Participant identification
    public int participantId { get; set; }
    public int profileIcon { get; set; }
    public string puuid { get; set; } = string.Empty;
    public string riotIdGameName { get; set; } = string.Empty;
    public string riotIdTagline { get; set; } = string.Empty;
    public string summonerId { get; set; } = string.Empty;
    public int summonerLevel { get; set; }
    public string summonerName { get; set; } = string.Empty;
    public int teamId { get; set; }

    // Champion information
    public int championId { get; set; }
    public string championName { get; set; } = string.Empty;
    public int champLevel { get; set; }
    public int champExperience { get; set; }
    public int championTransform { get; set; }

    // Damage and objective stats
    public int damageDealtToBuildings { get; set; }
    public int damageDealtToObjectives { get; set; }
    public int damageDealtToTurrets { get; set; }
    public int damageSelfMitigated { get; set; }
    public int largestCriticalStrike { get; set; }
    public int longestTimeSpentLiving { get; set; }
    public int magicDamageDealt { get; set; }
    public int magicDamageDealtToChampions { get; set; }
    public int magicDamageTaken { get; set; }
    public int neutralMinionsKilled { get; set; }
    public int objectivesStolen { get; set; }
    public int objectivesStolenAssists { get; set; }
    public int physicalDamageDealt { get; set; }
    public int physicalDamageDealtToChampions { get; set; }
    public int physicalDamageTaken { get; set; }
    public int timeCCingOthers { get; set; }
    public int totalAllyJungleMinionsKilled { get; set; }
    public int totalDamageDealt { get; set; }
    public int totalDamageDealtToChampions { get; set; }
    public int totalDamageShieldedOnTeammates { get; set; }
    public int totalDamageTaken { get; set; }
    public int totalEnemyJungleMinionsKilled { get; set; }
    public int totalHeal { get; set; }
    public int totalHealsOnTeammates { get; set; }
    public int totalMinionsKilled { get; set; }
    public int totalTimeCCDealt { get; set; }
    public int totalTimeSpentDead { get; set; }
    public int totalUnitsHealed { get; set; }
    public int trueDamageDealt { get; set; }
    public int trueDamageDealtToChampions { get; set; }
    public int trueDamageTaken { get; set; }

    // Objective-related kills
    public int baronKills { get; set; }
    public int dragonKills { get; set; }
    public int inhibitorKills { get; set; }
    public int inhibitorTakedowns { get; set; }
    public int inhibitorsLost { get; set; }
    public int nexusKills { get; set; }
    public int nexusTakedowns { get; set; }
    public int nexusLost { get; set; }
    public int turretKills { get; set; }
    public int turretTakedowns { get; set; }
    public int turretsLost { get; set; }
    public bool firstTowerAssist { get; set; }
    public bool firstTowerKill { get; set; }

    // Vision and wards
    public int detectorWardsPlaced { get; set; }
    public int sightWardsBoughtInGame { get; set; }
    public int visionScore { get; set; }
    public int visionWardsBoughtInGame { get; set; }
    public int wardsKilled { get; set; }
    public int wardsPlaced { get; set; }

    // Spell casting
    public int spell1Casts { get; set; }
    public int spell2Casts { get; set; }
    public int spell3Casts { get; set; }
    public int spell4Casts { get; set; }
    public int summoner1Casts { get; set; }
    public int summoner1Id { get; set; }
    public int summoner2Casts { get; set; }
    public int summoner2Id { get; set; }

    // Gold and bounty
    public int bountyLevel { get; set; }
    public int goldEarned { get; set; }
    public int goldSpent { get; set; }

    // Items
    public int item0 { get; set; }
    public int item1 { get; set; }
    public int item2 { get; set; }
    public int item3 { get; set; }
    public int item4 { get; set; }
    public int item5 { get; set; }
    public int item6 { get; set; }
    public int itemsPurchased { get; set; }
    public int consumablesPurchased { get; set; }

    // Perks (runes/masteries)
    public PerksDto perks { get; set; } = new PerksDto();

    // Multi-kill and spree data
    public int killingSprees { get; set; }
    public int largestKillingSpree { get; set; }
    public int largestMultiKill { get; set; }
    public int doubleKills { get; set; }
    public int tripleKills { get; set; }
    public int quadraKills { get; set; }
    public int pentaKills { get; set; }

    // Positioning
    public string teamPosition { get; set; } = string.Empty;
    public string individualPosition { get; set; } = string.Empty;
    public string lane { get; set; } = string.Empty;
    public string role { get; set; } = string.Empty;

    // Pings
    public int allInPings { get; set; }
    public int assistMePings { get; set; }
    public int commandPings { get; set; }
    public int enemyMissingPings { get; set; }
    public int enemyVisionPings { get; set; }
    public int holdPings { get; set; }
    public int getBackPings { get; set; }
    public int needVisionPings { get; set; }
    public int onMyWayPings { get; set; }
    public int pushPings { get; set; }
    public int visionClearedPings { get; set; }

    // Arena fields
    public int subteamPlacement { get; set; }
    public int playerAugment1 { get; set; }
    public int playerAugment2 { get; set; }
    public int playerAugment3 { get; set; }
    public int playerAugment4 { get; set; }
    public int playerSubteamId { get; set; }
    public int placement { get; set; }
}

public class LeagueMatchSoloDuoEntryDto {
    public bool freshBlood   { get; set; }
    public bool inactive     { get; set; }
    public bool veteran      { get; set; }
    public bool hotStreak    { get; set; }
    public string tier       { get; set; } = string.Empty;
    public string rank       { get; set; } = string.Empty;
    public int leaguePoints { get; set; }
    public string puuid      { get; set; } = string.Empty;
}

public class PerksDto {
    public StatPerksDto statPerks { get; set; } = new StatPerksDto();
    public List<PerkStyleDto> styles { get; set; } = new List<PerkStyleDto>();
}

public class StatPerksDto {
    public int defense { get; set; }
    public int flex { get; set; }
    public int offense { get; set; }
}

public class PerkStyleDto {
    public string description { get; set; } = string.Empty;
    public List<PerkSelectionDto> selections { get; set; } = new List<PerkSelectionDto>();
    public int style { get; set; }
}

public class PerkSelectionDto {
    public int perk { get; set; }
    public int var1 { get; set; }
    public int var2 { get; set; }
    public int var3 { get; set; }
}

public class LeagueMatchTimelineDto {
    public LeagueMatchTimelineMetadataDto metadata { get; set; } = new LeagueMatchTimelineMetadataDto();
    public LeagueMatchTimelineInfoDto info  { get; set; } = new LeagueMatchTimelineInfoDto();
}

public class LeagueMatchTimelineMetadataDto {
    public string dataVersion { get; set; } = string.Empty;
    public string matchId { get; set; } = string.Empty;
    public List<string> participants { get; set; } = new List<string>();
}

public class LeagueMatchTimelineInfoDto {
    public string endOfGameResult { get; set; }  = string.Empty;
    public long frameInterval { get; set; }
    public long gameId { get; set; }
    public List<LeagueMatchTimelineParticipantDto> participants { get; set; } = new List<LeagueMatchTimelineParticipantDto>();
    public List<LeagueMatchTimelineFramesDto> frames { get; set; } = new List<LeagueMatchTimelineFramesDto>();
}

public class LeagueMatchTimelineParticipantDto {
    public int participantId { get; set; }
    public string puuid { get; set; } = string.Empty;
}

public class LeagueMatchTimelineFramesDto {
    public List<LeagueMatchTimelineEventsDto> events {get; set;} = new List<LeagueMatchTimelineEventsDto>();
    public LeagueMatchTimelineParticipantFramesDto participantFrames {get; set;} = new LeagueMatchTimelineParticipantFramesDto();
    public int timestamp {get; set;}
}

public class LeagueMatchTimelineEventsDto {
    public long timestamp {get; set;}
    public long realTimestamp {get; set;}
    public string type {get; set;} = string.Empty;
}

public class LeagueMatchTimelineParticipantFramesDto {
    [JsonPropertyName("1")] public LeagueMatchTimelineParticipantFrameDto P1 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("2")] public LeagueMatchTimelineParticipantFrameDto P2 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("3")] public LeagueMatchTimelineParticipantFrameDto P3 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("4")] public LeagueMatchTimelineParticipantFrameDto P4 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("5")] public LeagueMatchTimelineParticipantFrameDto P5 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("6")] public LeagueMatchTimelineParticipantFrameDto P6 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("7")] public LeagueMatchTimelineParticipantFrameDto P7 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("8")] public LeagueMatchTimelineParticipantFrameDto P8 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
    [JsonPropertyName("9")] public LeagueMatchTimelineParticipantFrameDto P9 { get; set; } = new LeagueMatchTimelineParticipantFrameDto();
}

public class LeagueMatchTimelineParticipantFrameDto {
    public LeagueMatchTimelineChampionStatsDto championStats { get; set; } = new LeagueMatchTimelineChampionStatsDto();
    public int currentGold { get; set; }
    public LeagueMatchTimelineDamageStatsDto damageStats { get; set; } = new LeagueMatchTimelineDamageStatsDto();
    public int goldPerSecond { get; set; }
    public int jungleMinionsKilled { get; set; }
    public int level { get; set; }
    public int minionsKilled { get; set; }
    public int participantId { get; set; }
    public LeagueMatchTimelinePositionDto position { get; set; } = new LeagueMatchTimelinePositionDto();
    public int timeEnemySpentControlled { get; set; }
    public int totalGold { get; set; }
    public int xp { get; set; }
}

public class LeagueMatchTimelineChampionStatsDto {
    public int abilityHaste { get; set; }
    public int abilityPower { get; set; }
    public int armor { get; set; }
    public int armorPen { get; set; }
    public float armorPenPercent { get; set; }
    public int attackDamage { get; set; }
    public float attackSpeed { get; set; }
    public float bonusArmorPenPercent { get; set; }
    public float bonusMagicPenPercent { get; set; }
    public int ccReduction { get; set; }
    public float cooldownReduction { get; set; }
    public int health { get; set; }
    public int healthMax { get; set; }
    public float healthRegen { get; set; }
    public float lifesteal { get; set; }
    public int magicPen { get; set; }
    public float magicPenPercent { get; set; }
    public int magicResist { get; set; }
    public float movementSpeed { get; set; }
    public float omnivamp { get; set; }
    public float physicalVamp { get; set; }
    public int power { get; set; }
    public int powerMax { get; set; }
    public float powerRegen { get; set; }
    public float spellVamp { get; set; }
}

public class LeagueMatchTimelineDamageStatsDto {
    public int magicDamageDone { get; set; }
    public int magicDamageDoneToChampions { get; set; }
    public int magicDamageTaken { get; set; }
    public int physicalDamageDone { get; set; }
    public int physicalDamageDoneToChampions { get; set; }
    public int physicalDamageTaken { get; set; }
    public int totalDamageDone { get; set; }
    public int totalDamageDoneToChampions { get; set; }
    public int totalDamageTaken { get; set; }
    public int trueDamageDone { get; set; }
    public int trueDamageDoneToChampions { get; set; }
    public int trueDamageTaken { get; set; }
}

public class LeagueMatchTimelinePositionDto {
    public int x { get; set; }
    public int y { get; set; }
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

public class PreferredRole {
    public string RoleName { get; set; } = string.Empty;
    public int Games { get; set; }
    public int Wins { get; set; }
    public int TotalKills { get; set; }
    public int TotalDeaths { get; set; }
    public int TotalAssists { get; set; }
    public double WinRate => Games > 0 ? (double)Wins / Games * 100 : 0;
    public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
}
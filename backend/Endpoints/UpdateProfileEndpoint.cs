using Microsoft.EntityFrameworkCore;

using Polly;

using System.Net;
using System.Text.Json;

using backend.Services;
using backend.Models;
using backend.DTOs;
using backend.Mappings;
using backend.Utils;

namespace backend.Endpoints {
    public static class UpdateProfileEndpoint {
        public static void MapUpdateProfileEndpoint(this WebApplication app, string apiKey) {
            app.MapGet("/api/lol/profile/{region}/{summonerName}-{summonerTag}/update", async (string region, string summonerName, string summonerTag, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
                if (!RegionMappingProvider.RegionMapping.TryGetValue(region, out var continent)) {
                    return Results.Problem("Invalid region specified.");
                }

                var existingPlayer = await dbContext.Players
                    .Include(p => p.PlayerBasicInfo)
                    .FirstOrDefaultAsync(p => p.PlayerBasicInfo.SummonerName == summonerName && p.PlayerBasicInfo.SummonerTag == summonerTag && p.PlayerBasicInfo.Region == region);
                if (existingPlayer == null) {
                    return Results.NotFound();
                }

                var allMatchesData = await dbContext.PlayerMatches
                    .AsNoTracking()
                    .Where(pm => pm.PlayerId == existingPlayer.Id)
                    .OrderBy(pm => pm.MatchIndex)
                    .Select(pm => JsonSerializer.Deserialize<LeagueMatchDto>(pm.MatchJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!)
                    .ToListAsync();
                                                                    
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

                var accountJson = await accountResponse.Content.ReadAsStreamAsync();
                var riotAccount = JsonSerializer.Deserialize<AccountDto>(accountJson, new JsonSerializerOptions {
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
                        var timelineJson = await tlResp.Content.ReadAsStringAsync();

                        return new LeagueMatchDto {
                        details = detailsDto,
                        timelineJson = timelineJson
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

                var allGamesChampionStats = new Dictionary<int, ChampionStatsDto>();
                var championStatsByQueue = new Dictionary<int, Dictionary<int, ChampionStatsDto>> {
                    { rankedSoloQueueId, new Dictionary<int, ChampionStatsDto>() },
                    { rankedFlexQueueId, new Dictionary<int, ChampionStatsDto>() }
                };

                var allGamesRoleStats = new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase) {
                    { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                    { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                    { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                    { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                    { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
                };

                var roleStatsByQueue = new Dictionary<int, Dictionary<string, PreferredRoleDto>> {
                    { rankedSoloQueueId, new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase)
                        {
                            { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                            { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                            { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                            { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                            { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
                        }
                    },
                    { rankedFlexQueueId, new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase)
                        {
                            { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                            { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                            { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                            { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                            { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
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

                    var team = match.details.info.teams.FirstOrDefault(team => team.teamId == participant.teamId);
                    if (team == null) {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}");
                        continue;
                    }

                    int atakhanKilled = 0;
                    using var doc = JsonDocument.Parse(match.timelineJson);
                    var root = doc.RootElement;
                    if (!root.TryGetProperty("info", out var infoElement) || infoElement.ValueKind != JsonValueKind.Object)  {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}");
                        continue;
                    }

                    if (!infoElement.TryGetProperty("frames", out var framesElement) || framesElement.ValueKind != JsonValueKind.Array) {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}");
                        continue;
                    }

                    var frames = framesElement.EnumerateArray();
                    foreach(var frame in frames) {
                        if (!frame.TryGetProperty("events", out var eventsElement) || eventsElement.ValueKind != JsonValueKind.Array) {
                            continue;
                        }

                        var killEvent = eventsElement.EnumerateArray().FirstOrDefault(e => {
                            if (!e.TryGetProperty("killerTeamId", out var killerTeam) || killerTeam.GetInt32() != participant.teamId) {
                                return false;
                            }

                            if (!e.TryGetProperty("type", out var typeElement) || typeElement.GetString() != "ELITE_MONSTER_KILL") {
                                return false;
                            }

                            if (!e.TryGetProperty("monsterType", out var monsterElement) || monsterElement.GetString() != "ATAKHAN") {
                                return false;
                            }

                            return true;
                        });

                        if (killEvent.ValueKind != JsonValueKind.Undefined) {
                            atakhanKilled++;
                            break;
                        }
                    }

                    void UpdateChampionStats(Dictionary<int, ChampionStatsDto> statsDict) {
                        int champId = participant.championId;
                        if (!statsDict.TryGetValue(champId, out ChampionStatsDto? stats)) {
                            stats = new ChampionStatsDto {
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

                        stats.TotalDMGDealt += participant.totalDamageDealtToChampions;
                        stats.TotalDMGTaken += participant.totalDamageTaken;
                        stats.TotalGoldEarned += participant.goldEarned;
                        stats.TotalCS += participant.totalMinionsKilled + participant.neutralMinionsKilled;
                        stats.TotalVisionScore += participant.visionScore;

                        stats.TotalBaronKills += team.objectives.baron.kills;
                        stats.TotalDragonKills += team.objectives.dragon.kills;
                        stats.TotalHeraldKills += team.objectives.riftHerald.kills;
                        stats.TotalGrubsKills += team.objectives.horde.kills;
                        stats.TotalAtakhanKills += atakhanKilled;
                        stats.TotalTowerKills += team.objectives.tower.kills;
                        stats.TotalInhibitorKills += team.objectives.inhibitor.kills;

                        stats.TotalSpell1Casts += participant.spell1Casts;
                        stats.TotalSpell2Casts += participant.spell2Casts;
                        stats.TotalSpell3Casts += participant.spell3Casts;
                        stats.TotalSpell4Casts += participant.spell4Casts;

                        stats.TotalDoubleKills += participant.doubleKills;
                        stats.TotalTripleKills += participant.tripleKills;
                        stats.TotalQuadraKills += participant.quadraKills;
                        stats.TotalPentaKills += participant.pentaKills;
                        if (participant.firstBloodKill) stats.TotalFirstBloodKills++;
                        if (participant.firstBloodAssist) stats.TotalFirstBloodAssists++;

                        if (participant.teamId == 100) {
                            stats.TotalBlueSideGames++;
                            if (participant.win) {
                                stats.TotalBlueSideWins++;
                            }
                        } 
                        
                        if (participant.teamId == 200) {
                            stats.TotalRedSideGames++;
                            if (participant.win) {
                                stats.TotalRedSideWins++;
                            }
                        }

                        stats.TotalTimeSpentDeadMin += Math.Round(participant.totalTimeSpentDead / 60.0, 1);
                        stats.TotalMin += Math.Round(match.details.info.gameDuration / 60.0, 1);

                        var opponent = match.details.info.participants.FirstOrDefault(p => p.teamPosition == participant.teamPosition && p.teamId != participant.teamId);
                        if (opponent != null) {
                            var matchup = stats.OpponentMatchups.FirstOrDefault(opp => opp.ChampionId == opponent.championId);
                            if (matchup == null) {
                                matchup = new ChampionStatsDto {
                                    ChampionId = opponent.championId,
                                    ChampionName = opponent.championName
                                };
                                stats.OpponentMatchups.Add(matchup);
                            }
                            matchup.Games++;
                            if (participant.win) matchup.Wins++;
                            matchup.TotalKills += participant.kills;
                            matchup.TotalDeaths += participant.deaths;
                            matchup.TotalAssists += participant.assists;
                            matchup.TotalCS += participant.totalMinionsKilled + participant.neutralMinionsKilled;

                            matchup.TotalDoubleKills += participant.doubleKills;
                            matchup.TotalTripleKills += participant.tripleKills;
                            matchup.TotalQuadraKills += participant.quadraKills;
                            matchup.TotalPentaKills += participant.pentaKills;

                            matchup.TotalMin += Math.Round(match.details.info.gameDuration / 60.0, 1);
                        }

                        var teammates = match.details.info.participants.Where(p => p.teamId == participant.teamId).ToList();
                        if (teammates != null) {
                            foreach (var teammate in teammates) {
                                if (teammate == null) continue;
                                if (teammate.puuid == participant.puuid) continue;

                                string teammateRole = teammate.teamPosition.ToUpper();

                                if (!stats.ChampionSynergies.TryGetValue(teammateRole, out var synergyList)) {
                                    synergyList = new List<ChampionSynergyDto>();
                                    stats.ChampionSynergies[teammateRole] = synergyList;
                                }

                                var synergy = synergyList.FirstOrDefault(s => s.ChampionId == teammate.championId);
                                if (synergy == null) {
                                    synergy = new ChampionSynergyDto {
                                        ChampionId = teammate.championId,
                                        ChampionName = teammate.championName
                                    };
                                    synergyList.Add(synergy);
                                }

                                synergy.Games++;
                                if (participant.win) synergy.Wins++;
                            }
                        }
                    }

                    void UpdateRoleStats(Dictionary<string, PreferredRoleDto> roleDict) {
                        string role = participant.teamPosition.ToUpper();
                        if (roleDict.TryGetValue(role, out PreferredRoleDto? preferredRole)) {
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
                    }
                    else if (queueId == rankedFlexQueueId) {
                        UpdateChampionStats(championStatsByQueue[rankedFlexQueueId]);
                        UpdateRoleStats(roleStatsByQueue[rankedFlexQueueId]);
                    }
                }

                Dictionary<int, ChampionStatsDto> MergeChampionStats(Dictionary<int, ChampionStatsDto> existingStats, Dictionary<int, ChampionStatsDto> newStats) {
                    foreach (var newStat in newStats) {
                        int champId = newStat.Key;
                        ChampionStatsDto incoming = newStat.Value;

                        if (!existingStats.TryGetValue(champId, out ChampionStatsDto? baseStats)) {
                            existingStats[champId] = incoming;
                            continue;
                        }

                        baseStats.Games += incoming.Games;
                        baseStats.Wins += incoming.Wins;
                        baseStats.TotalKills += incoming.TotalKills;
                        baseStats.TotalDeaths += incoming.TotalDeaths;
                        baseStats.TotalAssists += incoming.TotalAssists;
                        baseStats.TotalDMGDealt += incoming.TotalDMGDealt;
                        baseStats.TotalDMGTaken += incoming.TotalDMGTaken;
                        baseStats.TotalGoldEarned += incoming.TotalGoldEarned;
                        baseStats.TotalCS += incoming.TotalCS;
                        baseStats.TotalVisionScore += incoming.TotalVisionScore;
                        baseStats.TotalBaronKills += incoming.TotalBaronKills;
                        baseStats.TotalDragonKills += incoming.TotalDragonKills;
                        baseStats.TotalHeraldKills += incoming.TotalHeraldKills;
                        baseStats.TotalGrubsKills += incoming.TotalGrubsKills;
                        baseStats.TotalAtakhanKills += incoming.TotalAtakhanKills;
                        baseStats.TotalTowerKills += incoming.TotalTowerKills;
                        baseStats.TotalInhibitorKills += incoming.TotalInhibitorKills;
                        baseStats.TotalSpell1Casts += incoming.TotalSpell1Casts;
                        baseStats.TotalSpell2Casts += incoming.TotalSpell2Casts;
                        baseStats.TotalSpell3Casts += incoming.TotalSpell3Casts;
                        baseStats.TotalSpell4Casts += incoming.TotalSpell4Casts;
                        baseStats.TotalDoubleKills += incoming.TotalDoubleKills;
                        baseStats.TotalTripleKills += incoming.TotalTripleKills;
                        baseStats.TotalQuadraKills += incoming.TotalQuadraKills;
                        baseStats.TotalPentaKills += incoming.TotalPentaKills;
                        baseStats.TotalFirstBloodKills += incoming.TotalFirstBloodKills;
                        baseStats.TotalFirstBloodAssists += incoming.TotalFirstBloodAssists;
                        baseStats.TotalBlueSideGames += incoming.TotalBlueSideGames;
                        baseStats.TotalBlueSideWins += incoming.TotalBlueSideWins;
                        baseStats.TotalRedSideGames += incoming.TotalRedSideGames;
                        baseStats.TotalRedSideWins += incoming.TotalRedSideWins;
                        baseStats.TotalTimeSpentDeadMin += incoming.TotalTimeSpentDeadMin;
                        baseStats.TotalMin += incoming.TotalMin;

                        foreach (var inOpp in incoming.OpponentMatchups) {
                            var exOpp = baseStats.OpponentMatchups.FirstOrDefault(x => x.ChampionId == inOpp.ChampionId);
                            if (exOpp == null) {
                                baseStats.OpponentMatchups.Add(inOpp);
                            } else {
                                exOpp.Games += inOpp.Games;
                                exOpp.Wins += inOpp.Wins;
                                exOpp.TotalKills += inOpp.TotalKills;
                                exOpp.TotalDeaths += inOpp.TotalDeaths;
                                exOpp.TotalAssists += inOpp.TotalAssists;
                                exOpp.TotalCS += inOpp.TotalCS;
                                exOpp.TotalDoubleKills += inOpp.TotalDoubleKills;
                                exOpp.TotalTripleKills += inOpp.TotalTripleKills;
                                exOpp.TotalQuadraKills += inOpp.TotalQuadraKills;
                                exOpp.TotalPentaKills += inOpp.TotalPentaKills;
                                exOpp.TotalMin += inOpp.TotalMin;
                            }
                        }

                        foreach (var synergy in incoming.ChampionSynergies) {
                            string role = synergy.Key;
                            var incomingList = synergy.Value;

                            if (!baseStats.ChampionSynergies.TryGetValue(role, out var baseList)) {
                                baseStats.ChampionSynergies[role] = incomingList;
                                continue;
                            }

                            foreach (var inSyn in incomingList) {
                                var exSyn = baseList.FirstOrDefault(s => s.ChampionId == inSyn.ChampionId);
                                if (exSyn == null) {
                                    baseList.Add(inSyn);
                                }
                                else {
                                    exSyn.Games += inSyn.Games;
                                    exSyn.Wins += inSyn.Wins;
                                }
                            }
                        }
                    }
                    return existingStats;
                }

                Dictionary<string, PreferredRoleDto> MergeRoleStats(Dictionary<string, PreferredRoleDto> existingStats, Dictionary<string, PreferredRoleDto> newStats) {
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
                    var existingAllGamesChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.AllGamesChampionStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStatsDto>();
                    allGamesChampionStats = MergeChampionStats(existingAllGamesChampStats, allGamesChampionStats);
                }

                if (!string.IsNullOrEmpty(existingPlayer.AllGamesRoleStatsData)) {
                    var existingAllGamesRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.AllGamesRoleStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRoleDto>();
                    allGamesRoleStats = MergeRoleStats(existingAllGamesRoleStats, allGamesRoleStats);
                }

                if (!string.IsNullOrEmpty(existingPlayer.RankedSoloChampionStatsData)) {
                    var existingRankedSoloChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedSoloChampionStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStatsDto>();
                    championStatsByQueue[rankedSoloQueueId] = MergeChampionStats(existingRankedSoloChampStats, championStatsByQueue[rankedSoloQueueId]);
                }

                if (!string.IsNullOrEmpty(existingPlayer.RankedSoloRoleStatsData)) {
                    var existingRankedSoloRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedSoloRoleStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRoleDto>();
                    roleStatsByQueue[rankedSoloQueueId] = MergeRoleStats(existingRankedSoloRoleStats, roleStatsByQueue[rankedSoloQueueId]);
                }

                if (!string.IsNullOrEmpty(existingPlayer.RankedFlexChampionStatsData)) {
                    var existingRankedFlexChampStats = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedFlexChampionStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<int, ChampionStatsDto>();
                    championStatsByQueue[rankedFlexQueueId] = MergeChampionStats(existingRankedFlexChampStats, championStatsByQueue[rankedFlexQueueId]);
                }

                if (!string.IsNullOrEmpty(existingPlayer.RankedFlexRoleStatsData)) {
                    var existingRankedFlexRoleStats = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedFlexRoleStatsData,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new Dictionary<string, PreferredRoleDto>();
                    roleStatsByQueue[rankedFlexQueueId] = MergeRoleStats(existingRankedFlexRoleStats, roleStatsByQueue[rankedFlexQueueId]);
                }

                var mergedMatchList = allMatchesData
                    .Concat(newMatchesList)
                    .GroupBy(m => m?.details.metadata.matchId)
                    .Select(g => g.First())
                    .OrderByDescending(m => m?.details.info.gameStartTimestamp)
                    .ToList();

                // odavde
                // var allPuuids = mergedMatchList
                //     .SelectMany(m => m?.details.info.participants!)
                //     .Select(p => p.puuid)
                //     .Distinct()
                //     .ToList();
                    
                // var entryCache = new Dictionary<string, LeagueEntriesDto>();
                // foreach (var playerUuid in allPuuids) {
                //     string entrySoloDuoUrl = $"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{playerUuid}?api_key={apiKey}";
                //     var resp = await GetAsyncWithRetry(entrySoloDuoUrl);
                //     if (!resp.IsSuccessStatusCode) continue;

                //     var list = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(
                //         await resp.Content.ReadAsStringAsync(),
                //         new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                //     );

                //     var solo = list?.FirstOrDefault(e => e.queueType == "RANKED_SOLO_5x5");
                //     if (solo != null)  {
                //         entryCache[playerUuid] = new LeagueEntriesDto {
                //             freshBlood = solo.freshBlood,
                //             inactive = solo.inactive,
                //             veteran = solo.veteran,
                //             hotStreak = solo.hotStreak,
                //             tier = solo.tier,
                //             rank = solo.rank,
                //             leaguePoints = solo.leaguePoints,
                //             puuid = solo.puuid
                //         };
                //     }
                // }

                // foreach (var match in mergedMatchList) {
                //     if (match == null || match.details.info == null || match.details.info.participants == null) continue;

                //     foreach (var participant in match.details.info.participants) {
                //         if (entryCache.TryGetValue(participant.puuid, out var dto)) participant.entry = dto;
                //     }
                // }
                // dovde

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

                var championRoleMapping = await ChampionRoleMapping.BuildChampionRoleMappingAsync(client);
                var championIdToNameMapping = await ChampionIdToNameMapping.BuildChampionIdToNameMappingAsync(client);

                if (spectatorData is JsonElement spectatorElement && spectatorElement.TryGetProperty("participants", out JsonElement participantsElement)) {
                    var participantsWithRole = new List<LiveGameParticipantWithRoleDto>();
                    foreach (var participant in participantsElement.EnumerateArray()) {
                        int champId = participant.GetProperty("championId").GetInt32();
                        string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MIDDLE";
                        string championName = championIdToNameMapping.ContainsKey(champId) ? championIdToNameMapping[champId] : string.Empty;

                        int spell1Id = participant.GetProperty("spell1Id").GetInt32();
                        int spell2Id = participant.GetProperty("spell2Id").GetInt32();
                        if (spell1Id == 11 || spell2Id == 11) {
                            predictedRole = "JUNGLE";
                        }

                        var participantWithRole = new LiveGameParticipantWithRoleDto {
                            puuid = participant.TryGetProperty("puuid", out var puuidProp) ? puuidProp.GetString() ?? string.Empty : string.Empty,
                            teamId = participant.TryGetProperty("teamId", out var teamIdProp) ? teamIdProp.GetInt32() : 0,
                            spell1Id = spell1Id,
                            spell2Id = spell2Id,
                            championId = champId,
                            championName = championName,
                            profileIconId = participant.TryGetProperty("profileIconId", out var profileIconProp) ? profileIconProp.GetInt32() : 0,
                            riotId = participant.TryGetProperty("riotId", out var riotIdProp) ? riotIdProp.GetString() ?? string.Empty : string.Empty,
                            bot = participant.TryGetProperty("bot", out var botProp) && botProp.GetBoolean(),
                            summonerId = participant.TryGetProperty("summonerId", out var summonerIdProp) ? summonerIdProp.GetString() ?? string.Empty : string.Empty,
                            perks = participant.TryGetProperty("perks", out var perksProp) ? perksProp : new JsonElement(),
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
                                if (AmbiguousMappingProvider.AmbiguousMapping.TryGetValue(playerToReassign.championName, out string[]? possibleRoles)) {
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
                                if (AmbiguousMappingProvider.AmbiguousMapping.TryGetValue(p.championName, out string[]? possibleRoles)) {
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
                string masteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}?api_key={apiKey}";
                string totalMasteryScoreUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-puuid/{puuid}?api_key={apiKey}";

                var summonerTask = GetStringAsyncWithRetry(summonerUrl);
                var masteriesTask = GetStringAsyncWithRetry(masteriesUrl);
                var totalMasteryScoreTask = GetStringAsyncWithRetry(totalMasteryScoreUrl);

                await Task.WhenAll(summonerTask, masteriesTask, totalMasteryScoreTask);

                var lastIndex = await dbContext.PlayerMatches
                    .Where(pm => pm.PlayerId == existingPlayer.Id)
                    .Select(pm => (int?)pm.MatchIndex)
                    .MaxAsync() ?? -1;
                int nextIndex = lastIndex + 1;
                foreach (var match in newMatchesList) {
                    var matchJson = JsonSerializer.Serialize(match);
                    dbContext.PlayerMatches.Add(new PlayerMatch {
                        PlayerId = existingPlayer.Id,
                        MatchIndex = nextIndex++,
                        MatchJson = matchJson
                    });
                }

                existingPlayer.Puuid = puuid;
                existingPlayer.PlayerBasicInfo.ProfileIcon = JsonSerializer.Deserialize<RiotSummonerDto>(await summonerTask)!.profileIconId;
                existingPlayer.SummonerData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await summonerTask));
                existingPlayer.EntriesData = JsonSerializer.Serialize(entries);
                existingPlayer.MasteriesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await masteriesTask));
                existingPlayer.TotalMasteryScoreData = JsonSerializer.Deserialize<int>(await totalMasteryScoreTask);
                existingPlayer.SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData);

                existingPlayer.AllMatchIds = JsonSerializer.Serialize(mergedMatchIds);
                existingPlayer.AllGamesChampionStatsData = JsonSerializer.Serialize(allGamesChampionStats);
                existingPlayer.AllGamesRoleStatsData = JsonSerializer.Serialize(allGamesRoleStats);
                existingPlayer.RankedSoloChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedSoloQueueId]);
                existingPlayer.RankedSoloRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedSoloQueueId]);
                existingPlayer.RankedFlexChampionStatsData = JsonSerializer.Serialize(championStatsByQueue[rankedFlexQueueId]);
                existingPlayer.RankedFlexRoleStatsData = JsonSerializer.Serialize(roleStatsByQueue[rankedFlexQueueId]);

                existingPlayer.AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                await dbContext.SaveChangesAsync();

                var playerBasicInfoDto = new PlayerBasicInfoDto {
                    SummonerName = existingPlayer.PlayerBasicInfo.SummonerName,
                    SummonerTag = existingPlayer.PlayerBasicInfo.SummonerTag,
                    Region = existingPlayer.PlayerBasicInfo.Region,
                    ProfileIcon = JsonSerializer.Deserialize<RiotSummonerDto>(existingPlayer.SummonerData)!.profileIconId,
                };

                var playerDto = new PlayerDto {
                    Id = existingPlayer.Id,
                    PlayerBasicInfo = playerBasicInfoDto,
                    Puuid = existingPlayer.Puuid,
                    SummonerData = JsonSerializer.Deserialize<RiotSummonerDto>(existingPlayer.SummonerData)!,
                    EntriesData = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(existingPlayer.EntriesData)!,
                    MasteriesData = JsonSerializer.Deserialize<List<ChampionMasteryDto>>(existingPlayer.MasteriesData)!,
                    TotalMasteryScoreData = JsonSerializer.Deserialize<int>(existingPlayer.TotalMasteryScoreData)!,
                    AllMatchIds = JsonSerializer.Deserialize<List<string>>(existingPlayer.AllMatchIds)!,
                    AllMatchesData = mergedMatchList!,
                    AllGamesChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.AllGamesChampionStatsData)!,
                    AllGamesRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.AllGamesRoleStatsData)!,
                    RankedSoloChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedSoloChampionStatsData)!,
                    RankedSoloRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedSoloRoleStatsData)!,
                    RankedFlexChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedFlexChampionStatsData)!,
                    RankedFlexRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedFlexRoleStatsData)!,
                    SpectatorData = JsonSerializer.Deserialize<object>(existingPlayer.SpectatorData),
                    AddedAt = existingPlayer.AddedAt,
                };
                
                return Results.Ok(playerDto);
            })
            .WithName("UpdateProfileByRiotId")
            .WithTags("UpdateProfile");
        }
    }
}
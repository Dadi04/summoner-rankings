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
    public static class ProfileEndpoint {
        public static void MapProfileEndpoint(this WebApplication app, string apiKey) {
            app.MapGet("/api/lol/profile/{region}/{summonerName}-{summonerTag}", async (string region, string summonerName, string summonerTag, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
                if (!RegionMappingProvider.RegionMapping.TryGetValue(region, out var continent)) {
                    return Results.Problem("Invalid region specified.");
                }
                var existingPlayer = await dbContext.Players
                    .Include(p => p.PlayerBasicInfo)
                    .FirstOrDefaultAsync(p => p.PlayerBasicInfo.SummonerName == summonerName && p.PlayerBasicInfo.SummonerTag == summonerTag && p.PlayerBasicInfo.Region == region);
                if (existingPlayer != null) {
                    var pageMatches = await dbContext.PlayerMatches
                        .AsNoTracking()
                        .Where(pm => pm.PlayerId == existingPlayer.Id)
                        .OrderBy(pm => pm.MatchIndex)
                        .Select(pm => JsonSerializer.Deserialize<LeagueMatchDto>(
                                        pm.MatchJson,
                                        new JsonSerializerOptions {
                                            PropertyNameCaseInsensitive = true
                                        })!)
                        .ToListAsync();

                    var existingPlayerBasicInfoDto = new PlayerBasicInfoDto {
                        SummonerName = existingPlayer.PlayerBasicInfo.SummonerName,
                        SummonerTag = existingPlayer.PlayerBasicInfo.SummonerTag,
                        Region = existingPlayer.PlayerBasicInfo.Region,
                        ProfileIcon = existingPlayer.PlayerBasicInfo.ProfileIcon,
                    };

                    var dto = new PlayerDto {
                        Id = existingPlayer.Id,
                        PlayerBasicInfo = existingPlayerBasicInfoDto,
                        Puuid = existingPlayer.Puuid,
                        SummonerData = JsonSerializer.Deserialize<RiotSummonerDto>(existingPlayer.SummonerData)!,
                        EntriesData = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(existingPlayer.EntriesData)!,
                        MasteriesData = JsonSerializer.Deserialize<List<ChampionMasteryDto>>(existingPlayer.MasteriesData)!,
                        TotalMasteryScoreData = JsonSerializer.Deserialize<int>(existingPlayer.TotalMasteryScoreData)!,
                        AllMatchIds = JsonSerializer.Deserialize<List<string>>(existingPlayer.AllMatchIds)!,
                        AllMatchesData = pageMatches,
                        AllGamesChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.AllGamesChampionStatsData)!,
                        AllGamesRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.AllGamesRoleStatsData)!,
                        RankedSoloChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedSoloChampionStatsData)!,
                        RankedSoloRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedSoloRoleStatsData)!,
                        RankedFlexChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(existingPlayer.RankedFlexChampionStatsData)!,
                        RankedFlexRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(existingPlayer.RankedFlexRoleStatsData)!,
                        SpectatorData = JsonSerializer.Deserialize<object>(existingPlayer.SpectatorData),
                        ClashData = JsonSerializer.Deserialize<object>(existingPlayer.ClashData),
                        AddedAt = existingPlayer.AddedAt,
                    };

                    return Results.Ok(dto);
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
                List<LeagueEntriesDto> entries;
                if (!entriesResponse.IsSuccessStatusCode) {
                    entries = new List<LeagueEntriesDto>();
                } else {
                    await using var entriesJson = await entriesResponse.Content.ReadAsStreamAsync();
                    entries = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(entriesJson,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    ) ?? new List<LeagueEntriesDto>();
                }

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

                        return new LeagueMatchDto {
                            details = detailsDto,
                            timelineJson = timelineJson
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
                    .Where(m => m != null)
                    .Cast<LeagueMatchDto>()
                    .ToList();

                // odavde
                // var allPuuids = allMatchesDataList
                //     .Where(m => m?.details?.info?.participants != null)
                //     .SelectMany(m => m!.details?.info!.participants!)
                //     .Select(p => p.puuid)
                //     .Distinct()
                //     .ToList();
                // Console.WriteLine($"allMatchesDataList has {allMatchesDataList.Count} matches, while allPuuids has {allPuuids.Count} puuids");
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
                //     if (solo != null) {
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

                // foreach (var match in allMatchesDataList) {
                //     if (match == null || match.details.info == null || match.details.info.participants == null) continue;

                //     foreach (var participant in match.details.info.participants) {
                //         if (entryCache.TryGetValue(participant.puuid, out var dto)) participant.entry = dto;
                //     }
                // }
                // dovde

                int rankedSoloQueueId = 420;
                int rankedFlexQueueId = 440;

                var allGamesChampionStats = new Dictionary<int, ChampionStatsDto>();

                var allGamesRoleStats = new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase) {
                    { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                    { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                    { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                    { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                    { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
                };

                var championStatsByQueue = new Dictionary<int, Dictionary<int, ChampionStatsDto>>();
                championStatsByQueue[rankedSoloQueueId] = new Dictionary<int, ChampionStatsDto>();
                championStatsByQueue[rankedFlexQueueId] = new Dictionary<int, ChampionStatsDto>();

                var roleStatsByQueue = new Dictionary<int, Dictionary<string, PreferredRoleDto>>();
                roleStatsByQueue[rankedSoloQueueId] = new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase) {
                    { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                    { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                    { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                    { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                    { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
                };
                roleStatsByQueue[rankedFlexQueueId] = new Dictionary<string, PreferredRoleDto>(StringComparer.OrdinalIgnoreCase) {
                    { "TOP", new PreferredRoleDto { RoleName = "TOP" } },
                    { "JUNGLE", new PreferredRoleDto { RoleName = "JUNGLE" } },
                    { "MIDDLE", new PreferredRoleDto { RoleName = "MIDDLE" } },
                    { "BOTTOM", new PreferredRoleDto { RoleName = "BOTTOM" } },
                    { "UTILITY", new PreferredRoleDto { RoleName = "UTILITY" } },
                };

                foreach (var match in allMatchesDataList) {
                    if (match == null) continue;
                    int queueId = match.details.info.queueId;
                    var participant = match.details.info.participants.FirstOrDefault(p => p.puuid == puuid);
                    if (participant == null) {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}, participant doesn't exist");
                        continue;
                    }
                    var team = match.details.info.teams.FirstOrDefault(team => team.teamId == participant.teamId);
                    if (team == null) {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}, team doesn't exist");
                        continue;
                    }

                    int atakhanKilled = 0;
                    using var doc = JsonDocument.Parse(match.timelineJson);
                    var root = doc.RootElement;
                    if (!root.TryGetProperty("info", out var infoElement) || infoElement.ValueKind != JsonValueKind.Object)  {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}, root doesn't exist");
                        continue;
                    }

                    if (!infoElement.TryGetProperty("frames", out var framesElement) || framesElement.ValueKind != JsonValueKind.Array) {
                        Console.WriteLine($"Invalid match: {match.details.metadata.matchId}, frames doesn't exist");
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

                var championRoleMapping = await ChampionRoleMapping.BuildChampionRoleMappingAsync(client);

                if (spectatorData is JsonElement spectatorElement && spectatorElement.TryGetProperty("participants", out JsonElement participantsElement)) {
                    var participantsWithRole = new List<LiveGameParticipantWithRoleDto>();
                    foreach (var participant in participantsElement.EnumerateArray()) {
                        int champId = participant.GetProperty("championId").GetInt32();
                        string predictedRole = championRoleMapping.ContainsKey(champId) ? championRoleMapping[champId] : "MIDDLE";

                        int spell1Id = participant.GetProperty("spell1Id").GetInt32();
                        int spell2Id = participant.GetProperty("spell2Id").GetInt32();
                        if (spell1Id == 11 || spell2Id == 11) {
                            predictedRole = "JUNGLE";
                        }

                        var participantWithRole = new LiveGameParticipantWithRoleDto {
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
                string masteriesUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}?api_key={apiKey}";
                string totalMasteryScoreUrl = $"https://{region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-puuid/{puuid}?api_key={apiKey}";
                string clashUrl = $"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}?api_key={apiKey}"; // ukoliko nisi u clashu vraca [] i vraca 200

                var summonerTask = GetStringAsyncWithRetry(summonerUrl);
                var masteriesTask = GetStringAsyncWithRetry(masteriesUrl);
                var totalMasteryScoreTask = GetStringAsyncWithRetry(totalMasteryScoreUrl);
                var clashTask = GetStringAsyncWithRetry(clashUrl);

                await Task.WhenAll(summonerTask, masteriesTask, totalMasteryScoreTask, clashTask);

                var playerBasicInfo = new PlayerBasicInfo {
                    SummonerName = summonerName,
                    SummonerTag = summonerTag,
                    Region = region,
                    ProfileIcon = JsonSerializer.Deserialize<RiotSummonerDto>(await summonerTask)!.profileIconId
                };
                dbContext.PlayersBasicInfo.Add(playerBasicInfo);

                var player = new Player {
                    PlayerBasicInfo = playerBasicInfo,
                    Puuid = puuid,

                    SummonerData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await summonerTask)),
                    EntriesData = JsonSerializer.Serialize(entries),
                    MasteriesData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await masteriesTask)),
                    TotalMasteryScoreData = JsonSerializer.Deserialize<int>(await totalMasteryScoreTask),

                    SpectatorData = spectatorData is string s ? s : JsonSerializer.Serialize(spectatorData),
                    ClashData = JsonSerializer.Serialize(JsonSerializer.Deserialize<object>(await clashTask)),

                    AllMatchIds = JsonSerializer.Serialize(allMatchIds),
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

                for (int i = 0; i < allMatchesDataList.Count; i++) {
                    dbContext.PlayerMatches.Add(new PlayerMatch {
                        PlayerId = player.Id,
                        MatchIndex = i,
                        MatchJson = JsonSerializer.Serialize(allMatchesDataList[i])
                    });
                }
                await dbContext.SaveChangesAsync();   
                
                var playerBasicInfoDto = new PlayerBasicInfoDto {
                    SummonerName = player.PlayerBasicInfo.SummonerName,
                    SummonerTag = player.PlayerBasicInfo.SummonerTag,
                    Region = player.PlayerBasicInfo.Region,
                    ProfileIcon = JsonSerializer.Deserialize<RiotSummonerDto>(player.SummonerData)!.profileIconId
                };

                var playerDto = new PlayerDto {
                    Id = player.Id,
                    PlayerBasicInfo = playerBasicInfoDto,
                    Puuid = player.Puuid,
                    SummonerData = JsonSerializer.Deserialize<RiotSummonerDto>(player.SummonerData)!,
                    EntriesData = entries!,
                    MasteriesData = JsonSerializer.Deserialize<List<ChampionMasteryDto>>(player.MasteriesData)!,
                    TotalMasteryScoreData = JsonSerializer.Deserialize<int>(player.TotalMasteryScoreData)!,
                    AllMatchIds = allMatchIds,
                    AllMatchesData = allMatchesDataList,
                    AllGamesChampionStatsData = allGamesChampionStats,
                    AllGamesRoleStatsData = allGamesRoleStats,
                    RankedSoloChampionStatsData = championStatsByQueue[rankedSoloQueueId],
                    RankedSoloRoleStatsData = roleStatsByQueue[rankedSoloQueueId],
                    RankedFlexChampionStatsData = championStatsByQueue[rankedFlexQueueId],
                    RankedFlexRoleStatsData = roleStatsByQueue[rankedFlexQueueId],
                    SpectatorData = JsonSerializer.Deserialize<object>(player.SpectatorData),
                    ClashData = JsonSerializer.Deserialize<object>(player.ClashData),
                    AddedAt = player.AddedAt,
                };

                return Results.Ok(playerDto);
            })
            .WithName("GetProfileByRiotId")
            .WithTags("GetProfile");
        }
    }
}
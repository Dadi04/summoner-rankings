using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json;

using backend.Models;
using backend.DTOs;
using backend.Services;
using backend.Utils;

namespace backend.Endpoints {
    public static class RacesEndpoints {
        public static void MapRacesEndpoints(this WebApplication app) {
            var racesGroup = app.MapGroup("/api/races");

            racesGroup.MapGet("/", async (ApplicationDbContext db, ClaimsPrincipal user) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                var races = await db.Races
                    .Where(r => r.UserId == int.Parse(userId))
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Results.Ok(races);
            })
            .RequireAuthorization()
            .WithName("GetMyRaces")
            .WithTags("Races");

            racesGroup.MapGet("/public", async (ApplicationDbContext db) => {
                var races = await db.Races
                    .Where(r => r.IsPublic)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Results.Ok(races);
            })
            .WithName("GetPublicRaces")
            .WithTags("Races");

            racesGroup.MapGet("/{id}", async (int id, ApplicationDbContext db, ClaimsPrincipal user) => {
                var race = await db.Races
                    .Include(r => r.RacePlayers)
                        .ThenInclude(rp => rp.Player)
                        .ThenInclude(p => p.PlayerBasicInfo)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (race == null) {
                    return Results.NotFound();
                }

                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!race.IsPublic && (string.IsNullOrEmpty(userId) || race.UserId != int.Parse(userId))) {
                    return Results.Unauthorized();
                }

                var raceDto = new RaceDetailDto {
                    Id = race.Id,
                    Title = race.Title,
                    Status = (int)race.Status,
                    IsPublic = race.IsPublic,
                    CreatedAt = race.CreatedAt,
                    EndingOn = race.EndingOn,
                    RacePlayers = new List<RacePlayerDto>()
                };

                foreach (var rp in race.RacePlayers) {
                    var player = rp.Player;
                    
                    var roleStats = !string.IsNullOrEmpty(player.AllGamesRoleStatsData) 
                        ? JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(player.AllGamesRoleStatsData) ?? new()
                        : new Dictionary<string, PreferredRoleDto>();
                    
                    var championStats = !string.IsNullOrEmpty(player.AllGamesChampionStatsData)
                        ? JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(player.AllGamesChampionStatsData) ?? new()
                        : new Dictionary<int, ChampionStatsDto>();
                    
                    var entriesData = !string.IsNullOrEmpty(player.EntriesData)
                        ? JsonSerializer.Deserialize<List<LeagueEntriesDto>>(player.EntriesData) ?? new()
                        : new List<LeagueEntriesDto>();
                    
                    var mostPlayedRole = roleStats.Values.OrderByDescending(r => r.Games).FirstOrDefault();
                    
                    var soloQueueEntry = entriesData.FirstOrDefault(e => e.queueType == "RANKED_SOLO_5x5");
                    
                    double? overallWinrate = null;
                    var totalGames = championStats.Values.Sum(c => c.Games);
                    var totalWins = championStats.Values.Sum(c => c.Wins);
                    if (totalGames > 0) {
                        overallWinrate = Math.Round((double)totalWins / totalGames * 100, 1);
                    }
                    
                    var top5Champions = championStats.Values
                        .OrderByDescending(c => c.Games)
                        .Take(5)
                        .ToList();
                    
                    var last5Matches = await db.PlayerMatches
                        .Where(pm => pm.PlayerId == player.Id)
                        .OrderByDescending(pm => pm.MatchEndTimestamp)
                        .Take(5)
                        .Select(pm => JsonSerializer.Deserialize<LeagueMatchDto>(
                            pm.MatchJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!)
                        .ToListAsync();

                    var playerDto = new PlayerInRaceDto {
                        Id = player.Id,
                        PlayerBasicInfo = new PlayerBasicInfoDto {
                            SummonerName = player.PlayerBasicInfo.SummonerName,
                            SummonerTag = player.PlayerBasicInfo.SummonerTag,
                            Region = player.PlayerBasicInfo.Region,
                            ProfileIcon = player.PlayerBasicInfo.ProfileIcon,
                            Puuid = player.Puuid
                        },
                        MostPlayedRole = mostPlayedRole?.RoleName,
                        Rank = soloQueueEntry != null ? $"{soloQueueEntry.tier} {soloQueueEntry.rank}" : null,
                        LeaguePoints = soloQueueEntry?.leaguePoints,
                        OverallWinrate = overallWinrate,
                        Top5Champions = top5Champions,
                        Last5Matches = last5Matches!
                    };
                    
                    raceDto.RacePlayers.Add(new RacePlayerDto {
                        RaceId = rp.RaceId,
                        PlayerId = rp.PlayerId,
                        Player = playerDto
                    });
                }

                return Results.Ok(raceDto);
            })
            .WithName("GetRaceById")
            .WithTags("Races");

            racesGroup.MapPost("/", async (CreateRaceDto dto, ApplicationDbContext db, ClaimsPrincipal user) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                if (dto.IsPublic) {
                    var isAdminClaim = user.FindFirst("isAdmin")?.Value;
                    var isAdmin = isAdminClaim == "True" || isAdminClaim == "true";
                    
                    if (!isAdmin) {
                        return Results.BadRequest(new { message = "Only administrators can create public races" });
                    }
                }

                var race = new Race {
                    UserId = int.Parse(userId),
                    Title = dto.Title,
                    IsPublic = dto.IsPublic,
                    EndingOn = dto.EndingOn,
                    Status = RaceStatus.Incoming,
                    CreatedAt = DateTimeOffset.UtcNow
                };

                db.Races.Add(race);
                await db.SaveChangesAsync();

                return Results.Created($"/api/races/{race.Id}", race);
            })
            .RequireAuthorization()
            .WithName("CreateRace")
            .WithTags("Races");

            racesGroup.MapPut("/{id}", async (int id, CreateRaceDto dto, ApplicationDbContext db, ClaimsPrincipal user) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                var race = await db.Races.FindAsync(id);
                if (race == null) {
                    return Results.NotFound();
                }

                if (race.UserId != int.Parse(userId)) {
                    return Results.Unauthorized();
                }

                if (dto.IsPublic && !race.IsPublic) {
                    var isAdminClaim = user.FindFirst("isAdmin")?.Value;
                    var isAdmin = isAdminClaim == "True" || isAdminClaim == "true";
                    
                    if (!isAdmin) {
                        return Results.BadRequest(new { message = "Only administrators can make races public" });
                    }
                }

                race.Title = dto.Title;
                race.IsPublic = dto.IsPublic;
                race.EndingOn = dto.EndingOn;

                await db.SaveChangesAsync();

                return Results.Ok(race);
            })
            .RequireAuthorization()
            .WithName("UpdateRace")
            .WithTags("Races");

            racesGroup.MapDelete("/{id}", async (int id, ApplicationDbContext db, ClaimsPrincipal user) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                var race = await db.Races.FindAsync(id);
                if (race == null) {
                    return Results.NotFound();
                }

                var isAdminClaim = user.FindFirst("isAdmin")?.Value;
                var isAdmin = isAdminClaim == "True" || isAdminClaim == "true";

                if (race.UserId != int.Parse(userId) && !isAdmin) {
                    return Results.Unauthorized();
                }

                db.Races.Remove(race);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Race deleted successfully" });
            })
            .RequireAuthorization()
            .WithName("DeleteRace")
            .WithTags("Races");

            racesGroup.MapDelete("/{raceId}/players/{playerId}", async (int raceId, int playerId, ApplicationDbContext db, ClaimsPrincipal user) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                var race = await db.Races.FirstOrDefaultAsync(r => r.Id == raceId);
                
                if (race == null) {
                    return Results.NotFound(new { message = "Race not found" });
                }

                if (race.UserId != int.Parse(userId)) {
                    return Results.Unauthorized();
                }

                var racePlayer = await db.RacePlayers
                    .FirstOrDefaultAsync(rp => rp.RaceId == raceId && rp.PlayerId == playerId);
                
                if (racePlayer == null) {
                    return Results.NotFound(new { message = "Player not found in this race" });
                }

                db.RacePlayers.Remove(racePlayer);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Player removed from race successfully" });
            })
            .RequireAuthorization()
            .WithName("RemovePlayerFromRace")
            .WithTags("Races");

            racesGroup.MapPost("/{raceId}/players", async (int raceId, AddPlayerToRaceDto dto, ApplicationDbContext db, ClaimsPrincipal user, IHttpClientFactory httpClientFactory, HttpContext httpContext) => {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId)) {
                    return Results.Unauthorized();
                }

                var race = await db.Races
                    .Include(r => r.RacePlayers)
                    .FirstOrDefaultAsync(r => r.Id == raceId);
                
                if (race == null) {
                    return Results.NotFound(new { message = "Race not found" });
                }

                if (race.UserId != int.Parse(userId)) {
                    return Results.Unauthorized();
                }

                var existingPlayer = await db.Players
                    .Include(p => p.PlayerBasicInfo)
                    .FirstOrDefaultAsync(p => 
                        p.PlayerBasicInfo.SummonerName == dto.SummonerName && 
                        p.PlayerBasicInfo.SummonerTag == dto.SummonerTag && 
                        p.PlayerBasicInfo.Region == dto.Region);

                int playerId;
                
                if (existingPlayer == null) {
                    var client = httpClientFactory.CreateClient();
                    
                    var request = httpContext.Request;
                    var baseUrl = $"{request.Scheme}://{request.Host}";
                    
                    var encodedSummonerName = Uri.EscapeDataString(dto.SummonerName);
                    var encodedSummonerTag = Uri.EscapeDataString(dto.SummonerTag);
                    var requestUrl = $"{baseUrl}/api/lol/profile/{dto.Region}/{encodedSummonerName}-{encodedSummonerTag}";
                    
                    try {
                        var response = await client.GetAsync(requestUrl);
                        
                        if (!response.IsSuccessStatusCode) {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            return Results.BadRequest(new { message = "Failed to fetch player data from Riot API", error = errorContent, statusCode = (int)response.StatusCode });
                        }

                        existingPlayer = await db.Players
                            .Include(p => p.PlayerBasicInfo)
                            .FirstOrDefaultAsync(p => 
                                p.PlayerBasicInfo.SummonerName == dto.SummonerName && 
                                p.PlayerBasicInfo.SummonerTag == dto.SummonerTag && 
                                p.PlayerBasicInfo.Region == dto.Region);
                        
                        if (existingPlayer == null) {
                            return Results.Problem("Player was fetched but not found in database");
                        }
                        
                        playerId = existingPlayer.Id;
                    } catch (Exception ex) {
                        return Results.Problem($"Error fetching player: {ex.Message}");
                    }
                } else {
                    playerId = existingPlayer.Id;
                }

                var existingRacePlayer = await db.RacePlayers
                    .FirstOrDefaultAsync(rp => rp.RaceId == raceId && rp.PlayerId == playerId);
                
                if (existingRacePlayer != null) {
                    return Results.BadRequest(new { message = "Player is already in this race" });
                }

                var racePlayer = new RacePlayer {
                    RaceId = raceId,
                    PlayerId = playerId
                };

                db.RacePlayers.Add(racePlayer);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Player added to race successfully", playerId });
            })
            .RequireAuthorization()
            .WithName("AddPlayerToRace")
            .WithTags("Races");

            racesGroup.MapGet("/public/player/{playerId}", async (int playerId, ApplicationDbContext db) => {
                try {
                    var races = await db.Races
                        .Where(r => r.IsPublic && r.RacePlayers.Any(rp => rp.PlayerId == playerId))
                        .OrderByDescending(r => r.CreatedAt)
                        .Select(r => new {
                            r.Id,
                            r.Title,
                            r.Status,
                            r.IsPublic,
                            r.CreatedAt,
                            r.EndingOn
                        })
                        .ToListAsync();
                    
                    return Results.Ok(races);
                } catch (Exception ex) {
                    Console.WriteLine($"Error fetching public races for player {playerId}: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    return Results.Problem($"An error occurred while fetching races: {ex.Message}");
                }
            })
            .WithName("GetPublicRacesByPlayer")
            .WithTags("Races");
        }
    }
}


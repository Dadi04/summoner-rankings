using Microsoft.EntityFrameworkCore;

using System.Text.Json;

using backend.Services;
using backend.Mappings;
using backend.DTOs;
using backend.Models;

namespace backend.Endpoints {
    public static class LiveGameEndpoint {
        public static void MapLiveGameEndpoint(this WebApplication app) {
            app.MapGet("/api/lol/profile/{region}/by-puuid/{puuid}/livegame", async (string region, string puuid, IHttpClientFactory httpClientFactory, ApplicationDbContext dbContext) => {
                if (!RegionMappingProvider.RegionMapping.TryGetValue(region, out var continent)) {
                    return Results.Problem("Invalid region specified.");
                }

                var player = await dbContext.Players.AsNoTracking().FirstOrDefaultAsync(p => p.Puuid == puuid);
                if (player == null) {
                    return Results.NotFound("Player not found.");
                }

                var playerBasicInfoDto = new PlayerBasicInfoDto {
                    SummonerName = player.PlayerBasicInfo.SummonerName,
                    SummonerTag = player.PlayerBasicInfo.SummonerTag,
                    Region = player.PlayerBasicInfo.Region,
                };

                var dto = new PlayerDto {
                    Id = player.Id,
                    PlayerBasicInfo = playerBasicInfoDto,
                    Puuid = player.Puuid,
                    SummonerData = JsonSerializer.Deserialize<RiotSummonerDto>(player.SummonerData)!,
                    EntriesData = JsonSerializer.Deserialize<List<LeagueEntriesDto>>(player.EntriesData)!,
                    MasteriesData = JsonSerializer.Deserialize<List<ChampionMasteryDto>>(player.MasteriesData)!,
                    TotalMasteryScoreData = JsonSerializer.Deserialize<int>(player.TotalMasteryScoreData)!,
                    AllMatchIds = JsonSerializer.Deserialize<List<string>>(player.AllMatchIds)!,
                    AllGamesChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(player.AllGamesChampionStatsData)!,
                    AllGamesRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(player.AllGamesRoleStatsData)!,
                    RankedSoloChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(player.RankedSoloChampionStatsData)!,
                    RankedSoloRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(player.RankedSoloRoleStatsData)!,
                    RankedFlexChampionStatsData = JsonSerializer.Deserialize<Dictionary<int, ChampionStatsDto>>(player.RankedFlexChampionStatsData)!,
                    RankedFlexRoleStatsData = JsonSerializer.Deserialize<Dictionary<string, PreferredRoleDto>>(player.RankedFlexRoleStatsData)!,
                    SpectatorData = JsonSerializer.Deserialize<object>(player.SpectatorData),
                    ClashData = JsonSerializer.Deserialize<object>(player.ClashData),
                    AddedAt = player.AddedAt,
                };
                
                return Results.Ok(dto);
            })
            .WithName("GetLiveGamePlayerByPuuid")
            .WithTags("LiveGamePlayer");
        }
    }
}
using Microsoft.EntityFrameworkCore;

using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Endpoints {
    public static class SearchAccountsEndpoints {
        public static void MapSearchAccountsEndpoints(this WebApplication app) {
            app.MapGet("/api/searchaccounts", async (ApplicationDbContext db) => {
                var players = await db.PlayersBasicInfo
                    .Select(p => new PlayerBasicInfoDto {
                        SummonerName = p.SummonerName,
                        SummonerTag = p.SummonerTag,
                        Region = p.Region,
                        ProfileIcon = p.ProfileIcon
                    })
                    .ToListAsync();

                return Results.Ok(players);
            })
            .WithName("GetAllPlayers")
            .WithTags("SearchAccounts");
        }
    }
}


using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Endpoints {
    public static class FavoritesEndpoints {
        public static void MapFavoritesEndpoints(this WebApplication app) {
            var favoritesGroup = app.MapGroup("/api/favorites")
                .RequireAuthorization();

            favoritesGroup.MapGet("/", async (ClaimsPrincipal user, ApplicationDbContext db) => {
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                
                var favorites = await db.Favorites
                    .Where(f => f.UserId == Convert.ToInt32(userId))
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new FavoriteResponseDto {
                        Id = f.Id,
                        SummonerName = f.SummonerName,
                        Region = f.Region
                    })
                    .ToListAsync();
                    
                return Results.Ok(favorites);
            })
            .WithName("GetFavorites")
            .WithTags("Favorites");

            favoritesGroup.MapPost("/", async (HttpContext context, ApplicationDbContext db) => {
                var user = context.User;
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) {
                    return Results.Unauthorized();
                }
                
                var request = await context.Request.ReadFromJsonAsync<FavoriteRequestDto>();
                if (request == null) {
                    return Results.BadRequest(new { message = "Invalid request body" });
                }
                
                var existing = await db.Favorites
                    .FirstOrDefaultAsync(f => 
                        f.UserId == Convert.ToInt32(userId) && 
                        f.SummonerName == request.SummonerName && 
                        f.Region == request.Region);
                        
                if (existing != null) {
                    return Results.BadRequest(new { message = "Summoner already favorited" });
                }
                
                var favorite = new Favorite {
                    UserId = Convert.ToInt32(userId),
                    SummonerName = request.SummonerName,
                    Region = request.Region,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                
                db.Favorites.Add(favorite);
                await db.SaveChangesAsync();
                
                var response = new FavoriteResponseDto {
                    Id = favorite.Id,
                    SummonerName = favorite.SummonerName,
                    Region = favorite.Region
                };
                
                return Results.Created($"/api/favorites", response);
            })
            .WithName("AddFavorite")
            .WithTags("Favorites");

            favoritesGroup.MapDelete("/", async (HttpContext context, ApplicationDbContext db) => {
                var user = context.User;
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                
                var request = await context.Request.ReadFromJsonAsync<FavoriteRequestDto>();
                if (request == null) {
                    return Results.BadRequest(new { message = "Invalid request body" });
                }
                
                var favorite = await db.Favorites
                    .FirstOrDefaultAsync(f => 
                        f.UserId == Convert.ToInt32(userId) && 
                        f.SummonerName == request.SummonerName && 
                        f.Region == request.Region);
                        
                if (favorite == null) {
                    return Results.NotFound(new { message = "Favorite not found" });
                }
                
                db.Favorites.Remove(favorite);
                await db.SaveChangesAsync();
                
                return Results.Ok(new { message = "Favorite removed successfully" });
            })
            .WithName("RemoveFavorite")
            .WithTags("Favorites");

            favoritesGroup.MapGet("/check", async (string region, string summoner, ClaimsPrincipal user, ApplicationDbContext db) => {
                if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(summoner)) {
                    return Results.BadRequest(new { message = "Region and summoner are required" });
                }
                
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                
                var summonerName = summoner.Contains('-') ? summoner.Replace('-', '#') : summoner;
                
                var isFavorite = await db.Favorites
                    .AnyAsync(f => 
                        f.UserId == Convert.ToInt32(userId) && 
                        f.SummonerName == summonerName && 
                        f.Region == region);
                        
                return Results.Ok(new CheckFavoriteResponseDto { IsFavorite = isFavorite });
            })
            .WithName("CheckFavorite")
            .WithTags("Favorites");
        }
    }
}


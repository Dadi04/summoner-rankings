using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

using backend.Models;
using backend.DTOs;
using backend.Services;

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
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (race == null) {
                    return Results.NotFound();
                }

                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!race.IsPublic && (string.IsNullOrEmpty(userId) || race.UserId != int.Parse(userId))) {
                    return Results.Unauthorized();
                }

                return Results.Ok(race);
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
        }
    }
}


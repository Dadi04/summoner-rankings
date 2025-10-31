using Microsoft.EntityFrameworkCore;

using backend.Models;
using backend.DTOs;
using backend.Services;

namespace backend.Endpoints {
    public static class AuthEndpoints {
        public static void MapAuthEndpoints(this WebApplication app) {
            var authGroup = app.MapGroup("/api/auth");

            authGroup.MapPost("/register", async (RegisterDto dto, ApplicationDbContext db) => {
                if (db.Users.Any(u => u.Username == dto.Username)) {
                    return Results.BadRequest(new { message = "Username taken" });
                }
                
                if (db.Users.Any(u => u.Email == dto.Email)) {
                    return Results.BadRequest(new { message = "Email taken" });
                }

                dto.PasswordHash = AuthHelpers.HashPassword(dto.Password);

                var user = new User {
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = dto.PasswordHash
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Ok(new { message = "Registration successful" });
            })
            .WithName("Register")
            .WithTags("Auth");

            authGroup.MapPost("/login", (LoginDto dto, ApplicationDbContext db, IConfiguration config) => {
                var user = db.Users.SingleOrDefault(u => u.Username == dto.Username);
                
                if (user == null || !AuthHelpers.VerifyPassword(dto.Password, user.PasswordHash)) {
                    return Results.Unauthorized();
                }

                var token = AuthHelpers.GenerateJwtToken(user, config);

                return Results.Ok(new { token });
            })
            .WithName("Login")
            .WithTags("Auth");
        }
    }
}


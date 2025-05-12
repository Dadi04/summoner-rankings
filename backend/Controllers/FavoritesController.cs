using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers {
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase {
        private readonly ApplicationDbContext _db;
        public FavoritesController(ApplicationDbContext db) {
            _db = db;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoriteResponseDto>>> GetFavorites() {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var favorites = await _db.Favorites
                .Where(f => f.UserId == Convert.ToInt32(userId))
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavoriteResponseDto {
                    Id = f.Id,
                    SummonerName = f.SummonerName,
                    Region = f.Region
                })
                .ToListAsync();
                
            return favorites;
        }
        
        [HttpPost]
        public async Task<ActionResult<FavoriteResponseDto>> AddFavorite(FavoriteRequestDto request) {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            
            var existing = await _db.Favorites
                .FirstOrDefaultAsync(f => 
                    f.UserId == Convert.ToInt32(userId) && 
                    f.SummonerName == request.SummonerName && 
                    f.Region == request.Region);
                    
            if (existing != null) {
                return BadRequest(new { message = "Summoner already favorited" });
            }
            
            var favorite = new Favorite {
                UserId = Convert.ToInt32(userId),
                SummonerName = request.SummonerName,
                Region = request.Region,
                CreatedAt = DateTime.UtcNow
            };
            
            _db.Favorites.Add(favorite);
            await _db.SaveChangesAsync();
            
            return CreatedAtAction(
                nameof(GetFavorites), 
                new FavoriteResponseDto {
                    Id = favorite.Id,
                    SummonerName = favorite.SummonerName,
                    Region = favorite.Region
                });
        }
        
        [HttpDelete]
        public async Task<IActionResult> RemoveFavorite(FavoriteRequestDto request) {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var favorite = await _db.Favorites
                .FirstOrDefaultAsync(f => 
                    f.UserId == Convert.ToInt32(userId) && 
                    f.SummonerName == request.SummonerName && 
                    f.Region == request.Region);
                    
            if (favorite == null) {
                return NotFound(new { message = "Favorite not found" });
            }
            
            _db.Favorites.Remove(favorite);
            await _db.SaveChangesAsync();
            
            return Ok(new { message = "Favorite removed successfully" });
        }
        
        [HttpGet("check")]
        public async Task<ActionResult<CheckFavoriteResponseDto>> CheckFavorite([FromQuery] string region, [FromQuery] string summoner) {
            if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(summoner)) {
                return BadRequest(new { message = "Region and summoner are required" });
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var summonerName = summoner.Contains('-') ? summoner.Replace('-', '#') : summoner;
            
            var favorite = await _db.Favorites
                .AnyAsync(f => 
                    f.UserId == Convert.ToInt32(userId) && 
                    f.SummonerName == summonerName && 
                    f.Region == region);
                    
            return new CheckFavoriteResponseDto { IsFavorite = favorite };
        }
    }
} 
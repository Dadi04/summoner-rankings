using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class SearchAccountsController : ControllerBase {
        private readonly ApplicationDbContext _db;
        public SearchAccountsController(ApplicationDbContext db) {
            _db = db;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlayerDto>>> GetAllPlayers() {
            var players = await _db.PlayersBasicInfo
                .Select(p => new PlayerBasicInfoDto {
                    SummonerName = p.SummonerName,
                    SummonerTag = p.SummonerTag,
                    Region = p.Region,
                    ProfileIcon = p.ProfileIcon
                }).ToListAsync();

            return Ok(players);
        }
    }
} 
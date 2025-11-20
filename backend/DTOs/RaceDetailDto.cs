using backend.Models;

namespace backend.DTOs {
    public class RacePlayerDto {
        public int RaceId { get; set; }
        public int PlayerId { get; set; }
        public PlayerInRaceDto Player { get; set; } = null!;
    }

    public class PlayerInRaceDto {
        public int Id { get; set; }
        public PlayerBasicInfoDto PlayerBasicInfo { get; set; } = null!;
        public string? MostPlayedRole { get; set; }
        public string? Rank { get; set; }
        public int? LeaguePoints { get; set; }
        public double? OverallWinrate { get; set; }
        public List<ChampionStatsDto>? Top5Champions { get; set; }
        public List<LeagueMatchDto>? Last5Matches { get; set; }
    }

    public class RaceDetailDto {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Status { get; set; }
        public bool IsPublic { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? EndingOn { get; set; }
        public List<RacePlayerDto> RacePlayers { get; set; } = new();
    }
}


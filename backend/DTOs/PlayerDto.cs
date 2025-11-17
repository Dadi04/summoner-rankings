using backend.Models;

namespace backend.DTOs {
    public class PlayerDto {
        public int Id { get; set; }
        public PlayerBasicInfoDto PlayerBasicInfo { get; set; } = new();
        public string Puuid { get; set; } = string.Empty;
        public RiotSummonerDto SummonerData { get; set; } = new();
        public List<LeagueEntriesDto> EntriesData { get; set; } = new();
        public List<ChampionMasteryDto> MasteriesData { get; set; } = new();
        public int TotalMasteryScoreData { get; set; }
        public List<string> AllMatchIds { get; set; } = new();
        public List<LeagueMatchDto> AllMatchesData { get; set; } = new();
        public Dictionary<int, ChampionStatsDto> AllGamesChampionStatsData { get; set; } = new();
        public Dictionary<string, PreferredRoleDto> AllGamesRoleStatsData { get; set; } = new();
        public Dictionary<int, ChampionStatsDto> RankedSoloChampionStatsData { get; set; } = new();
        public Dictionary<string, PreferredRoleDto> RankedSoloRoleStatsData { get; set; } = new();
        public Dictionary<int, ChampionStatsDto> RankedFlexChampionStatsData { get; set; } = new();
        public Dictionary<string, PreferredRoleDto> RankedFlexRoleStatsData { get; set; } = new();
        public object? SpectatorData { get; set; }
        public long AddedAt { get; set; }
    }
}
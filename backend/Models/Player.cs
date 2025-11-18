using System.ComponentModel.DataAnnotations;

namespace backend.Models {
    public class Player {
        public int Id { get; set; }
        public PlayerBasicInfo PlayerBasicInfo { get; set; } = new();
        [Required]
        public string Puuid { get; set; } = string.Empty;
        public string SummonerData { get; set; } = string.Empty;
        public string EntriesData { get; set; } = string.Empty;
        public string MasteriesData { get; set; } = string.Empty;
        public int TotalMasteryScoreData { get; set; }
        public string AllMatchIds { get; set; } = string.Empty;
        public string AllGamesChampionStatsData { get; set; } = string.Empty;
        public string AllGamesRoleStatsData { get; set; } = string.Empty;
        public string RankedSoloChampionStatsData { get; set; } = string.Empty;
        public string RankedSoloRoleStatsData { get; set; } = string.Empty;
        public string RankedFlexChampionStatsData { get; set; } = string.Empty;
        public string RankedFlexRoleStatsData { get; set; } = string.Empty;
        public string SpectatorData { get; set; } = string.Empty;
        public long AddedAt { get; set; }
        public ICollection<RacePlayer> RacePlayers { get; set; } = new List<RacePlayer>();
    }
}
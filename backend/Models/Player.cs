using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models {
    public class Player {
        public int Id {get; set;}
        public string SummonerName {get; set;} = string.Empty;
        public string SummonerTag {get; set;} = string.Empty;
        public string Region {get; set;} = string.Empty;
        public string Puuid {get; set;} = string.Empty;
        public string SummonerData { get; set; } = string.Empty;
        public string EntriesData { get; set; } = string.Empty;
        public string TopMasteriesData { get; set; } = string.Empty;
        public string AllMatchIds { get; set; } = string.Empty;
        public string AllMatchesData { get; set; } = string.Empty;
        public string AllGamesChampionStatsData { get; set; } = string.Empty;
        public string AllGamesRoleStatsData { get; set; } = string.Empty;
        public string RankedSoloChampionStatsData { get; set; } = string.Empty;
        public string RankedSoloRoleStatsData { get; set; } = string.Empty;
        public string RankedFlexChampionStatsData { get; set; } = string.Empty;
        public string RankedFlexRoleStatsData { get; set; } = string.Empty;
        public string SpectatorData { get; set; } = string.Empty;
        public string ClashData { get; set; } = string.Empty;
        public long AddedAt { get; set; }

        public ICollection<Race> Races { get; set; } = new List<Race>();
    }
}
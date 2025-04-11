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
        public string PlayerData {get; set;} = string.Empty;
        public string SummonerData { get; set; } = string.Empty;
        public string EntriesData { get; set; } = string.Empty;
        public string TopMasteriesData { get; set; } = string.Empty;
        public string SoloDuoMatchesData { get; set; } = string.Empty;
        public string SoloDuoMatchesDetailsData { get; set; } = string.Empty;
        public string FlexMatchesData { get; set; } = string.Empty;
        public string FlexMatchesDetailsData { get; set; } = string.Empty;
        public string RankedMatchesData { get; set; } = string.Empty;
        public string ChallengesData { get; set; } = string.Empty;
        public string SpectatorData { get; set; } = string.Empty;
        public string ClashData { get; set; } = string.Empty;
        public string ChampionStatsSoloDuoData { get; set; } = string.Empty;
        public string PreferredSoloDuoRoleData { get; set; } = string.Empty;
        public string ChampionStatsFlexData { get; set; } = string.Empty;
        public string PreferredFlexRoleData { get; set; } = string.Empty;
        public long AddedAt { get; set; }
        public string SoloDuoMessage { get; set; } = string.Empty;
        public string FlexMessage { get; set; } = string.Empty;

        public ICollection<Race> Races { get; set; } = new List<Race>();
    }
}
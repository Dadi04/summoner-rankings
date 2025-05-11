using backend.DTOs;

namespace backend.DTOs {
    public class ChampionStatsDto {
        public int ChampionId { get; set; }
        public string ChampionName { get; set; } = string.Empty;
        public List<ChampionStatsDto> OpponentMatchups { get; set; } = new List<ChampionStatsDto>();
        public Dictionary<string, List<ChampionSynergyDto>> ChampionSynergies { get; set; } = new();
        public int Games { get; set; }
        public int Wins { get; set; }
        public int TotalKills { get; set; }
        public int TotalDeaths { get; set; }
        public int TotalAssists { get; set; }

        public long TotalDMGDealt { get; set; }
        public long TotalDMGTaken { get; set; }
        public long TotalGoldEarned { get; set; }
        public int TotalCS { get; set; }
        public int TotalVisionScore { get; set; }

        public int TotalBaronKills { get; set; }
        public int TotalDragonKills { get; set; }
        public int TotalHeraldKills { get; set; }
        public int TotalGrubsKills { get; set; }
        public int TotalAtakhanKills { get; set; }
        public int TotalTowerKills { get; set; }
        public int TotalInhibitorKills { get; set; }

        public int TotalSpell1Casts { get; set; }
        public int TotalSpell2Casts { get; set; }
        public int TotalSpell3Casts { get; set; }
        public int TotalSpell4Casts { get; set; }

        public int TotalDoubleKills { get; set; }
        public int TotalTripleKills { get; set; }
        public int TotalQuadraKills { get; set; }
        public int TotalPentaKills { get; set; }
        public int TotalFirstBloodKills { get; set; }
        public int TotalFirstBloodAssists { get; set; }
        public double TotalTimeSpentDeadMin { get; set; }
        public double TotalMin { get; set; }

        public int TotalBlueSideGames { get; set; }
        public int TotalRedSideGames { get; set; }
        public int TotalBlueSideWins { get; set; }
        public int TotalRedSideWins { get; set; }

        public double Winrate => Games > 0 ? (double)Wins / Games * 100 : 0;
        public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
    }
}
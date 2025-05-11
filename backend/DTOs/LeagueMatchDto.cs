namespace backend.DTOs {
    public class LeagueEntriesDto {
        public string puuid { get; set; } = string.Empty;
        public string queueType { get; set; } = string.Empty;
        public string tier { get; set; } = string.Empty;
        public string rank { get; set; } = string.Empty;
        public int leaguePoints { get; set; }
        public bool freshBlood  { get; set; }
        public bool inactive  { get; set; }
        public bool veteran  { get; set; }
        public bool hotStreak  { get; set; }
        public int wins { get; set; }
        public int losses { get; set; }
    }

    public class LeagueMatchDto {
        public LeagueMatchDetailsDto details { get; set; } = new LeagueMatchDetailsDto();
        public string timelineJson { get; set; } = string.Empty;
    }

    public class LeagueMatchDetailsDto {
        public LeagueMatchMetadataDto metadata { get; set; } = new LeagueMatchMetadataDto();
        public LeagueMatchInfoDto info { get; set; } = new LeagueMatchInfoDto();
    }

    public class LeagueMatchMetadataDto {
        public string dataVersion { get; set; } = string.Empty;
        public string matchId { get; set; } = string.Empty;
        public List<string> participants { get; set; } = new List<string>();
    }
}
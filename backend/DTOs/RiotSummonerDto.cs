namespace backend.DTOs {
    public class RiotSummonerDto {
        public string accountId { get; set; } = string.Empty;
        public int profileIconId { get; set; }
        public long revisionDate { get; set; }
        public string id { get; set; } = string.Empty;
        public string puuid { get; set; } = string.Empty;
        public long summonerLevel { get; set; }
    }
}
namespace backend.Models {
    public class PlayerBasicInfoDto {
        public string SummonerName { get; set; } = string.Empty;
        public string SummonerTag { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public int ProfileIcon { get; set; }
    }
}
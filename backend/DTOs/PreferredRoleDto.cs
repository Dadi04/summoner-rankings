namespace backend.DTOs {
    public class PreferredRoleDto {
        public string RoleName { get; set; } = string.Empty;
        public int Games { get; set; }
        public int Wins { get; set; }
        public int TotalKills { get; set; }
        public int TotalDeaths { get; set; }
        public int TotalAssists { get; set; }
        public double Winrate => Games > 0 ? (double)Wins / Games * 100 : 0;
        public double AverageKDA => TotalDeaths > 0 ? (double)(TotalKills + TotalAssists) / TotalDeaths : (TotalKills + TotalAssists);
    }
}
namespace backend.DTOs {
    public class ChampionSynergyDto {
        public int ChampionId { get; set; }
        public string ChampionName { get; set; } = string.Empty;
        public int Games { get; set; }
        public int Wins { get; set; }
        public double Winrate => Games > 0 ? (double)Wins / Games * 100 : 0;
    }
}
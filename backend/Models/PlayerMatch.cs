namespace backend.Models {
    public class PlayerMatch {
        public int Id {get; set;}
        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;
        public string MatchJson { get; set; } = null!;
        public long MatchEndTimestamp { get; set; }
    }
}
namespace backend.Models {
    public class RacePlayer {
        public int RaceId { get; set; }
        public Race Race { get; set; } = null!;

        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;
    }
}
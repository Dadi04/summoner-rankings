using System.ComponentModel.DataAnnotations;

namespace backend.Models {
    public class PlayerLpSnapshot {
        [Key]
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public string QueueType { get; set; } = string.Empty;
        public string Tier { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public int LeaguePoints { get; set; }
        public DateTimeOffset TakenAt { get; set; }

        public Player Player { get; set; } = null!;
    }
}
using System.ComponentModel.DataAnnotations;

namespace backend.Models {
    public enum RaceStatus {
        Incoming, Ongoing, Ended
    }
    
    public class Race {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Title { get; set; } = string.Empty;
        public RaceStatus Status { get; set; } = RaceStatus.Incoming;
        public bool IsPublic { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? EndingOn { get; set; }
        public ICollection<RacePlayer> RacePlayers { get; set; } = new List<RacePlayer>();
    }
}
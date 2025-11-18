using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models {
    public class Favorite {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public string SummonerName { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
} 
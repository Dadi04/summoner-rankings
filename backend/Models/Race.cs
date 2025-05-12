using System.ComponentModel.DataAnnotations;

namespace backend.Models {
    public class Race {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}
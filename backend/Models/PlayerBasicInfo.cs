using System.ComponentModel.DataAnnotations;

namespace backend.Models {
    public class PlayerBasicInfo {
        [Key]
        public int Id { get; set; }
        public string SummonerName { get; set; } = string.Empty;
        public string SummonerTag { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public int ProfileIcon { get; set; }
    }
}
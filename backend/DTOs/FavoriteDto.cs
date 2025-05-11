using System.ComponentModel.DataAnnotations;

namespace backend.DTOs {
    public class FavoriteRequestDto {
        [Required]
        public string SummonerName { get; set; } = string.Empty;
        
        [Required]
        public string Region { get; set; } = string.Empty;
    }
    
    public class FavoriteResponseDto {
        public int Id { get; set; }
        public string SummonerName { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
    }
    
    public class CheckFavoriteResponseDto {
        public bool IsFavorite { get; set; }
    }
} 
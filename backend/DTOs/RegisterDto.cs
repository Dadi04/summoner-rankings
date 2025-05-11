using System.Text.Json.Serialization;

namespace backend.DTOs {
    public class RegisterDto {
        public string Username { get; set; } = string.Empty;
        public string Email    { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
    }
}
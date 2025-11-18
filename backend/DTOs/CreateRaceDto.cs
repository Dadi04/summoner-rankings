namespace backend.DTOs {
    public class CreateRaceDto {
        public string Title { get; set; } = string.Empty;
        public bool IsPublic { get; set; } = false;
        public DateTimeOffset? EndingOn { get; set; }
    }
}


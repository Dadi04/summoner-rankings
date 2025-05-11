namespace backend.DTOs {
    public class PerksDto {
        public StatPerksDto statPerks { get; set; } = new StatPerksDto();
        public List<PerkStyleDto> styles { get; set; } = new List<PerkStyleDto>();
    }

    public class StatPerksDto {
        public int defense { get; set; }
        public int flex { get; set; }
        public int offense { get; set; }
    }

    public class PerkStyleDto {
        public string description { get; set; } = string.Empty;
        public List<PerkSelectionDto> selections { get; set; } = new List<PerkSelectionDto>();
        public int style { get; set; }
    }

    public class PerkSelectionDto {
        public int perk { get; set; }
        public int var1 { get; set; }
        public int var2 { get; set; }
        public int var3 { get; set; }
    }
}
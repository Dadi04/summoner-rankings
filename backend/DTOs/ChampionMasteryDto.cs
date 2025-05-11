using System.Text.Json;

namespace backend.DTOs {
    public class ChampionMasteryDto {
        public string puuid { get; set; } = string.Empty;
        public long championPointsUntilNextLevel { get; set; } 
        public bool chestGranted { get; set; } 
        public long championId  { get; set; } 
        public long lastPlayTime { get; set; } 
        public int championLevel { get; set; } 
        public int championPoints { get; set; } 
        public long championPointsSinceLastLevel { get; set; } 
        public int markRequiredForNextLevel { get; set; } 
        public int championSeasonMilestone { get; set; } 
        public JsonElement nextSeasonMilestone { get; set; } 
        public int tokensEarned { get; set; } 
        public List<string> milestoneGrades { get; set; } = new List<string>();
    }
}
    
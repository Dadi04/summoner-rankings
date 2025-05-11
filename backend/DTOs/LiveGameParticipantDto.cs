using System.Text.Json;

namespace backend.DTOs {
    public class LiveGameParticipantWithRoleDto {
        public string puuid { get; set; } = string.Empty;
        public int teamId { get; set; }
        public int spell1Id { get; set; }
        public int spell2Id { get; set; }
        public int championId { get; set; }
        public string championName { get; set; } = string.Empty;
        public int profileIconId { get; set; }
        public string riotId { get; set; } = string.Empty;
        public bool bot { get; set; }
        public string summonerId { get; set; } = string.Empty;
        public JsonElement perks { get; set; }
        public string predictedRole { get; set; } = string.Empty;
    }
}
namespace backend.DTOs {
    public class LeagueMatchInfoDto {
        public string endOfGameResult { get; set; } = string.Empty;
        public long gameCreation { get; set; }
        public int gameDuration { get; set; }
        public long gameEndTimestamp { get; set; }
        public long gameId { get; set; }
        public string gameMode { get; set; } = string.Empty;
        public string gameName { get; set; } = string.Empty;
        public long gameStartTimestamp { get; set; }
        public string gameType { get; set; } = string.Empty;
        public string gameVersion { get; set; } = string.Empty;
        public int mapId { get; set; }
        public List<ParticipantDto> participants { get; set; } = new List<ParticipantDto>();
        public string platformId { get; set; } = string.Empty;
        public int queueId { get; set; }
        public List<TeamDto> teams { get; set; } = new List<TeamDto>();
        public string tournamentCode { get; set; } = string.Empty;
    }

    public class TeamDto {
        public List<BanDto> bans { get; set; } = new List<BanDto>();
        public TeamObjectivesDto objectives { get; set; } = new TeamObjectivesDto();
        public int teamId { get; set; }
        public bool win { get; set; }
    }

    public class BanDto {
        public int championId { get; set; }
        public int pickTurn { get; set; }
    }

    public class TeamObjectivesDto {
        public ObjectiveDto baron { get; set; } = new ObjectiveDto();
        public ObjectiveDto champion { get; set; } = new ObjectiveDto();
        public ObjectiveDto dragon { get; set; } = new ObjectiveDto();
        public ObjectiveDto horde { get; set; } = new ObjectiveDto();
        public ObjectiveDto inhibitor { get; set; } = new ObjectiveDto();
        public ObjectiveDto riftHerald { get; set; } = new ObjectiveDto();
        public ObjectiveDto tower { get; set; } = new ObjectiveDto();
    }

    public class ObjectiveDto {
        public bool first { get; set; }
        public int kills { get; set; }
    }
}
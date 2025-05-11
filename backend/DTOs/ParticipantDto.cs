namespace backend.DTOs {
    public class ParticipantDto {
        // Early/General match state
        public bool teamEarlySurrendered { get; set; }
        public bool gameEndedInEarlySurrender { get; set; }
        public bool gameEndedInSurrender { get; set; }

        // Basic stats
        public bool win { get; set; }
        public int kills { get; set; }
        public int deaths { get; set; }
        public int assists { get; set; }
        public bool firstBloodKill { get; set; }
        public bool firstBloodAssist { get; set; }
        public LeagueEntriesDto entry { get; set; } = new LeagueEntriesDto();

        // Progression and timing
        public bool eligibleForProgression { get; set; }
        public int timePlayed { get; set; }

        // Participant identification
        public int participantId { get; set; }
        public int profileIcon { get; set; }
        public string puuid { get; set; } = string.Empty;
        public string riotIdGameName { get; set; } = string.Empty;
        public string riotIdTagline { get; set; } = string.Empty;
        public string summonerId { get; set; } = string.Empty;
        public int summonerLevel { get; set; }
        public string summonerName { get; set; } = string.Empty;
        public int teamId { get; set; }

        // Champion information
        public int championId { get; set; }
        public string championName { get; set; } = string.Empty;
        public int champLevel { get; set; }
        public int champExperience { get; set; }
        public int championTransform { get; set; }

        // Damage and objective stats
        public int damageDealtToBuildings { get; set; }
        public int damageDealtToObjectives { get; set; }
        public int damageDealtToTurrets { get; set; }
        public int damageSelfMitigated { get; set; }
        public int largestCriticalStrike { get; set; }
        public int longestTimeSpentLiving { get; set; }
        public int magicDamageDealt { get; set; }
        public int magicDamageDealtToChampions { get; set; }
        public int magicDamageTaken { get; set; }
        public int neutralMinionsKilled { get; set; }
        public int objectivesStolen { get; set; }
        public int objectivesStolenAssists { get; set; }
        public int physicalDamageDealt { get; set; }
        public int physicalDamageDealtToChampions { get; set; }
        public int physicalDamageTaken { get; set; }
        public int timeCCingOthers { get; set; }
        public int totalAllyJungleMinionsKilled { get; set; }
        public int totalDamageDealt { get; set; }
        public int totalDamageDealtToChampions { get; set; }
        public int totalDamageShieldedOnTeammates { get; set; }
        public int totalDamageTaken { get; set; }
        public int totalEnemyJungleMinionsKilled { get; set; }
        public int totalHeal { get; set; }
        public int totalHealsOnTeammates { get; set; }
        public int totalMinionsKilled { get; set; }
        public int totalTimeCCDealt { get; set; }
        public int totalTimeSpentDead { get; set; }
        public int totalUnitsHealed { get; set; }
        public int trueDamageDealt { get; set; }
        public int trueDamageDealtToChampions { get; set; }
        public int trueDamageTaken { get; set; }

        // Objective-related kills
        public int baronKills { get; set; }
        public int dragonKills { get; set; }
        public int inhibitorKills { get; set; }
        public int inhibitorTakedowns { get; set; }
        public int inhibitorsLost { get; set; }
        public int nexusKills { get; set; }
        public int nexusTakedowns { get; set; }
        public int nexusLost { get; set; }
        public int turretKills { get; set; }
        public int turretTakedowns { get; set; }
        public int turretsLost { get; set; }
        public bool firstTowerAssist { get; set; }
        public bool firstTowerKill { get; set; }

        // Vision and wards
        public int detectorWardsPlaced { get; set; }
        public int sightWardsBoughtInGame { get; set; }
        public int visionScore { get; set; }
        public int visionWardsBoughtInGame { get; set; }
        public int wardsKilled { get; set; }
        public int wardsPlaced { get; set; }

        // Spell casting
        public int spell1Casts { get; set; }
        public int spell2Casts { get; set; }
        public int spell3Casts { get; set; }
        public int spell4Casts { get; set; }
        public int summoner1Casts { get; set; }
        public int summoner1Id { get; set; }
        public int summoner2Casts { get; set; }
        public int summoner2Id { get; set; }

        // Gold and bounty
        public int bountyLevel { get; set; }
        public int goldEarned { get; set; }
        public int goldSpent { get; set; }

        // Items
        public int item0 { get; set; }
        public int item1 { get; set; }
        public int item2 { get; set; }
        public int item3 { get; set; }
        public int item4 { get; set; }
        public int item5 { get; set; }
        public int item6 { get; set; }
        public int itemsPurchased { get; set; }
        public int consumablesPurchased { get; set; }

        // Perks (runes/masteries)
        public PerksDto perks { get; set; } = new PerksDto();

        // Multi-kill and spree data
        public int killingSprees { get; set; }
        public int largestKillingSpree { get; set; }
        public int largestMultiKill { get; set; }
        public int doubleKills { get; set; }
        public int tripleKills { get; set; }
        public int quadraKills { get; set; }
        public int pentaKills { get; set; }

        // Positioning
        public string teamPosition { get; set; } = string.Empty;
        public string individualPosition { get; set; } = string.Empty;
        public string lane { get; set; } = string.Empty;
        public string role { get; set; } = string.Empty;

        // Pings
        public int allInPings { get; set; }
        public int assistMePings { get; set; }
        public int commandPings { get; set; }
        public int enemyMissingPings { get; set; }
        public int enemyVisionPings { get; set; }
        public int holdPings { get; set; }
        public int getBackPings { get; set; }
        public int needVisionPings { get; set; }
        public int onMyWayPings { get; set; }
        public int pushPings { get; set; }
        public int visionClearedPings { get; set; }

        // Arena fields
        public int subteamPlacement { get; set; }
        public int playerAugment1 { get; set; }
        public int playerAugment2 { get; set; }
        public int playerAugment3 { get; set; }
        public int playerAugment4 { get; set; }
        public int playerSubteamId { get; set; }
        public int placement { get; set; }
    }
}
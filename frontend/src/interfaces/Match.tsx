import MatchDetailsInfo from "./MatchInfo";

interface Match {
    details: MatchDetails;
    timeline: MatchTimeline;
}

interface MatchDetails {
    metadata: MatchDetailsMetadata;
    info: MatchDetailsInfo;
}

interface MatchDetailsMetadata {
    dataVersion: string;
    matchId: string;
    participants: string[];
};

interface MatchTimeline {
    metadata: MatchTimelineMetadata;
    info: MatchTimelineInfo;
}

interface MatchTimelineMetadata {
    dataVersion: string;
    matchId: string;
    participants: string[];
};

interface MatchTimelineInfo {
    endOfGameResult: string;
    frameInterval: number;
    gameId: number;
    participants: TimelineParticipant[];
    frames: TimelineFrame[];
}

interface TimelineParticipant {
    participantId: number;
    puuid: string;
}

interface TimelineFrame {
    events: TimelineEvent[];
    participantFrames: TimelineParticipantFrames;
    timestamp: number;
}

interface TimelineEvent {
    timestamp: number;
    realTimestamp: number;
    type: string;
}

interface TimelineParticipantFrames {
    "1": TimelineParticipantFrame;
    "2": TimelineParticipantFrame;
    "3": TimelineParticipantFrame;
    "4": TimelineParticipantFrame;
    "5": TimelineParticipantFrame;
    "6": TimelineParticipantFrame;
    "7": TimelineParticipantFrame;
    "8": TimelineParticipantFrame;
    "9": TimelineParticipantFrame;
}

interface TimelineParticipantFrame {
    championStats: ChampionStats;
    currentGold: number;
    damageStats: DamageStats;
    goldPerSecond: number;
    jungleMinionsKilled: number;
    level: number;
    minionsKilled: number;
    participantId: number;
    position: Position;
    timeEnemySpentControlled: number;
    totalGold: number;
    xp: number;
}

interface ChampionStats {
    abilityHaste: number;
    abilityPower: number;
    armor: number;
    armorPen: number;
    armorPenPercent: number;
    attackDamage: number;
    attackSpeed: number;
    bonusArmorPenPercent: number;
    bonusMagicPenPercent: number;
    ccReduction: number;
    cooldownReduction: number;
    health: number;
    healthMax: number;
    healthRegen: number;
    lifesteal: number;
    magicPen: number;
    magicPenPercent: number;
    magicResist: number;
    movementSpeed: number;
    omnivamp: number;
    physicalVamp: number;
    power: number;
    powerMax: number;
    powerRegen: number;
    spellVamp: number;
}

interface DamageStats {
    magicDamageDone: number;
    magicDamageDoneToChampions: number;
    magicDamageTaken: number;
    physicalDamageDone: number;
    physicalDamageDoneToChampions: number;
    physicalDamageTaken: number;
    totalDamageDone: number;
    totalDamageDoneToChampions: number;
    totalDamageTaken: number;
    trueDamageDone: number;
    trueDamageDoneToChampions: number;
    trueDamageTaken: number;
}

interface Position {
    x: number;
    y: number;
}
  
export default Match;
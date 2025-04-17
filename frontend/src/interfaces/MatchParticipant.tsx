import MatchPerks from "./MatchPerks";

interface MatchParticipant {
    teamEarlySurrendered: boolean;
    gameEndedInEarlySurrender: boolean; // remake ?
    gameEndedInSurrender: boolean;

    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    firstBloodKill: number;
    firstBloodAssist: number;

    eligibleForProgression: boolean;
    timePlayed: number;

    participantId: number;
    profileIcon: number;
    puuid: string;
    riotIdGameName: string;
    riotIdTagline: string;
    summonerId: string;
    summonerLevel: number;
    summonerName: string;
    teamId: number;
    championId: number;
    championName: string;
    champLevel: number;
    champExperience: number;

    championTransform: number; // only kayn => This field is currently only utilized for Kayn's transformations. (Legal values: 0 - None, 1 - Slayer, 2 - Assassin)

    damageDealtToBuildings: number;
    damageDealtToObjectives: number;
    damageDealtToTurrets: number;
    damageSelfMitigated: number;
    largestCriticalStrike: number;
    longestTimeSpentLiving: number;
    magicDamageDealt: number;
    magicDamageDealtToChampions: number;
    magicDamageTaken: number;
    neutralMinionsKilled: number;
    objectivesStolen: number;
    objectivesStolenAssists: number;
    physicalDamageDealt: number;
    physicalDamageDealtToChampions: number;
    physicalDamageTaken: number;
    timeCCingOthers: number;
    totalAllyJungleMinionsKilled: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageShieldedOnTeammates: number;
    totalDamageTaken: number;
    totalEnemyJungleMinionsKilled: number;
    totalHeal: number; // Whenever positive health is applied, totalHeal is incremented by the amount of health received. This includes healing enemies, jungle monsters, yourself, etc
    totalHealsOnTeammates: number; // Whenever positive health is applied totalHealsOnTeammates is incremented by the amount of health received. This is post modified, so if you heal someone missing 5 health for 100 you will get +5 totalHealsOnTeammates
    totalMinionsKilled: number;
    totalTimeCCDealt: number;
    totalTimeSpentDead: number;
    totalUnitsHealed: number;
    trueDamageDealt: number;
    trueDamageDealtToChampions: number;
    trueDamageTaken: number;

    baronKills: number;
    dragonKills: number;
    inhibitorKills: number;
    inhibitorTakedowns: number;
    inhibitorsLost: number;
    nexusKills: number;
    nexusTakedowns: number;
    nexusLost: number;
    turretKills: number;
    turretTakedowns: number;
    turretsLost: number;
    firstTowerAssist: number;
    firstTowerKill: number;

    detectorWardsPlaced: number;
    sightWardsBoughtInGame: number;
    visionScore: number;
    visionWardsBoughtInGame: number;
    wardsKilled: number;
    wardsPlaced: number;

    spell1Casts: number;
    spell2Casts: number;
    spell3Casts: number;
    spell4Casts: number;
    summoner1Casts: number;
    summoner1Id: number;
    summoner2Casts: number;
    summoner2Id: number;

    bountyLevel: number;
    goldEarned: number;
    goldSpent: number;

    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    itemsPurchased: number;
    consumablesPurchased: number; // potovi

    perks: MatchPerks;

    killingSprees: number;
    largestKillingSpree: number;
    largestMultiKill: number;
    doubleKills: number;
    tripleKills: number;
    quadraKills: number;
    pentaKills: number;

    teamPosition: string;
    individualPosition: string;
    lane: string;
    role: string;

    allInPings: number; // crossed yellow swords
    assistMePings: number; // green flag
    commandPings: number; // blue generic
    enemyMissingPings: number; // yellow question mark
    enemyVisionPings: number; // red eye
    holdPings: number; // ?
    getBackPings: number; // yellow circle with horizontal line, ctrl v ping
    needVisionPings: number; // green ward
    onMyWayPings: number; // blue pointing down arrow
    pushPings: number; // green minion
    visionClearedPings: number; // ?

    subteamPlacement: number; // arena placement
    playerAugment1: number; // arena
    playerAugment2: number; // arena
    playerAugment3: number; // arena
    playerAugment4: number; // arena
    playerSubteamId: number; // arena

    placement: number; // what is this ?????
}

export default MatchParticipant;
interface ChampionStats {
    championId: number;
    championName: string;
    opponentMatchups: ChampionStats[];
    games: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;

    totalDMGDealt: number;
    totalDMGTaken: number;
    totalGoldEarned: number;
    totalCS: number;
    totalVisionScore: number;

    totalBaronKills: number;
    totalDragonKills: number;
    totalHeraldKills: number;
    totalGrubsKills: number;
    totalAtakhanKills: number;
    totalTowerKills: number;
    totalInhibitorKills: number;

    totalSpell1Casts: number;
    totalSpell2Casts: number;
    totalSpell3Casts: number;
    totalSpell4Casts: number;

    totalDoubleKills: number;
    totalTripleKills: number;
    totalQuadraKills: number;
    totalPentaKills: number;

    totalFirstBloodKills: number;
    totalFirstBloodAssists: number;

    totalTimeSpentDeadMin: number;
    totalMin: number;

    totalBlueSideGames: number;
    totalRedSideGames: number;
    totalBlueSideWins: number;
    totalRedSideWins: number;

    winrate: number;
    averageKDA: number;
}

export default ChampionStats;
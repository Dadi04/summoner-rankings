interface ChampionStats {
    championId: number;
    championName: string;
    games: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    winRate: number;
    averageKDA: number;
}

export default ChampionStats;
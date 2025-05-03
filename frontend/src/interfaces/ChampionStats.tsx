interface ChampionStats {
    championId: number;
    championName: string;
    opponentMatchups: ChampionStats[];
    games: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalCS: number;
    totalMin: number;
    winrate: number;
    averageKDA: number;
}

export default ChampionStats;
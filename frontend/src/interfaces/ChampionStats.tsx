interface ChampionStats {
    ChampionId: number;
    ChampionName: string;
    Games: number;
    Wins: number;
    TotalKills: number;
    TotalDeaths: number;
    TotalAssists: number;
    WinRate: number;
    AverageKDA: number;
}

export default ChampionStats;
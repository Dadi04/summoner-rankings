
interface Entry {
    leagueId: string;
    summonerId: string;
    puuid: string;
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    inactive: boolean;
    freshBlood: boolean;
    veteran: boolean;
    hotStreak: boolean;
}

export default Entry;
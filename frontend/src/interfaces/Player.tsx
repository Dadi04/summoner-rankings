
interface Player {
    summonerName: string;
    summonerTag: string;
    region: string;
    puuid: string;
    playerData: string;
    summonerData: string;
    entriesData: string;
    topMasteriesData: string;
    matchesData: string; // ranked solo duo games id => string[]
    rankedMatchesData: string; // ranked solo duo games info 
    challengesData: string;
    spectatorData: string;
    clashData: string;
    championStatsData: string;
    preferredRoleData: string;
    addedAt: number;
}

export default Player;
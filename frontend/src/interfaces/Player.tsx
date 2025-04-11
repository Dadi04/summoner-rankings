
interface Player {
    summonerName: string;
    summonerTag: string;
    region: string;
    puuid: string;
    playerData: string;
    summonerData: string;
    entriesData: string;
    topMasteriesData: string;
    soloDuoMatchesData: string; // ranked solo duo games id => string[]
    soloDuoMatchesDetailsData: string; // ranked solo duo games info 
    flexMatchesData: string;
    flexMatchesDetailsData: string;
    challengesData: string;
    spectatorData: string;
    clashData: string;
    championStatsSoloDuoData: string;
    preferredSoloDuoRoleData: string;
    championStatsFlexData: string;
    preferredFlexRoleData: string;
    addedAt: number;
}

export default Player;
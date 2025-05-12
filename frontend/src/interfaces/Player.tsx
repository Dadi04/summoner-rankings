import PreferredRole from "./PreferredRole";
import ChampionStats from "./ChampionStats";
import Match from "./Match";
import Entry from "./Entry";
import Mastery from "./Mastery";
import PlayerBasicInfo from "./PlayerBasicInfo";

interface Summoner {
    accountId: string;
    profileIconId: number;
    revisionDate: number;
    id: string;
    puuid: string;
    summonerLevel: number;
};

interface Player {
    playerBasicInfo: PlayerBasicInfo;
    puuid: string;
    playerData: string;
    summonerData: Summoner;
    entriesData: Entry[];
    masteriesData: Mastery[];
    totalMasteryScoreData: number;
    allMatchIds: string[];
    allMatchesData: Match[];
    allGamesChampionStatsData: ChampionStats[];
    allGamesRoleStatsData: PreferredRole[];
    rankedSoloChampionStatsData: ChampionStats[];
    rankedSoloRoleStatsData: PreferredRole[];
    rankedFlexChampionStatsData:ChampionStats[];
    rankedFlexRoleStatsData: PreferredRole[];
    spectatorData: any;
    clashData: any;
    addedAt: number;
}

export default Player;
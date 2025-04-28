import PreferredRole from "./PreferredRole";
import ChampionStats from "./ChampionStats";
import Match from "./Match";
import Entry from "./Entry";
import Mastery from "./Mastery";
import SummonerInfo from "./SummonerInfo";

interface Player {
    summonerName: string;
    summonerTag: string;
    region: string;
    puuid: string;
    playerData: string;
    summonerData: SummonerInfo;
    entriesData: Entry[];
    topMasteriesData: Mastery[];
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
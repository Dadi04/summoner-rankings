import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {RuneImage} from "../RuneData";
import {ChampionImage} from "../ChampionData";
import {SummonerSpellImage} from "../SummonerSpellData";
import RunesList from "./RunesList";

import Participant from "../../interfaces/LiveGameParticipant";
import PreferredRole from "../../interfaces/PreferredRole";
import ChampionStats from "../../interfaces/ChampionStats";
import Player from "../../interfaces/Player";
import Entry from "../../interfaces/Entry";

import arrowDownDark from "../../assets/arrow-down-dark.png"

interface RoleAccumulator {
    data: PreferredRole;
    roleName: string;
}

const LiveGameRow: React.FC<{participant: Participant; isBeingWatched: boolean; liveGameData: Player | null; region: string; gridCols: string;}> = ({participant, isBeingWatched, liveGameData, region, gridCols}) => {
    const entries = typeof liveGameData?.entriesData === "string" ? JSON.parse(liveGameData.entriesData) : liveGameData?.entriesData || [];
    const summoner = typeof liveGameData?.summonerData === "string" ? JSON.parse(liveGameData.summonerData) : liveGameData?.summonerData || [];
    const rankedSoloDuoEntry = entries.find((entry: Entry) => entry.queueType === "RANKED_SOLO_5x5");
    
    const rawChampionStats = liveGameData?.rankedSoloChampionStatsData;
    const championStats: ChampionStats[] = typeof rawChampionStats === "string" ? (Object.values(JSON.parse(rawChampionStats)) as ChampionStats[]) : Array.isArray(rawChampionStats)
    ? (rawChampionStats as ChampionStats[]) : rawChampionStats ? (Object.values(rawChampionStats) as ChampionStats[]) : [];   

    const rawRoleData = liveGameData?.rankedSoloRoleStatsData;
    const preferredRole: PreferredRole[] = typeof rawRoleData === "string" ? (Object.values(JSON.parse(rawRoleData)) as PreferredRole[]) : Array.isArray(rawRoleData) 
    ? (rawRoleData as PreferredRole[]) : rawRoleData ? (Object.values(rawRoleData) as PreferredRole[]) : [];

    const [champStats, setChampStats] = useState<ChampionStats | null>(null);
    const [showRunesDiv, setShowRunesDiv] = useState(false);
    let winratePercentage = 0;
    if (rankedSoloDuoEntry) {
        winratePercentage = Math.round(rankedSoloDuoEntry.wins / (rankedSoloDuoEntry.wins + rankedSoloDuoEntry.losses) * 100);
    }

    useEffect(() => {
        const championId = participant.championId;
      
        const stats = championStats.find((cs: ChampionStats) => cs.championId === championId);
        
        if (stats) {
            setChampStats(stats);
        } else {
            setChampStats(null);
        }
    }, [participant.championId, championStats]);

    const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    const mostPlayedRoleData = preferredRole.reduce<RoleAccumulator>(
        (max, curr, index) => {
            if (curr.games > max.data.games) {
                return { data: curr, roleName: roleOrder[index] };
            }
            return max;
        },
        { data: preferredRole[0], roleName: roleOrder[0] }
    );
    const isOnRole = participant.predictedRole === mostPlayedRoleData.roleName;

    function getWinrateColor(winrate: number) {
        if (winrate == -1) return "";
        if (winrate < 50) return "text-red-500";
        if (winrate < 60) return "text-green-500";
        if (winrate < 70) return "text-blue-500";
        return "text-orange-500"
    }

    function getWinrateBackgroundColor(winrate: number) {
        if (winrate < 50) return "bg-red-500";
        if (winrate < 60) return "bg-green-500";
        if (winrate < 70) return "bg-blue-500";
        return "bg-orange-500"
    }

    function getKDAColor(kda: number) {
        if (kda == -1) return "";
        if (kda < 1.00) return "text-red-500";
        if (kda < 3.00) return "";
        if (kda < 4.00) return "text-green-500";
        if (kda < 5.00) return "text-blue-500";
        return "text-orange-500"
    }

    return (
        <div className={`grid ${gridCols} w-full items-center relative  ${isBeingWatched ? "bg-[#303030]" : ""}`}>
            <div className="flex items-center gap-2 pl-0.5">
                <div className="ml-1">
                    {/* copyright issues */}
                    <img src={`https://dpm.lol/position/${participant.predictedRole}.svg`} alt={participant.predictedRole} className="h-[35px]" />
                    {preferredRole.length === 0 ? (
                        <p className="m-0 text-sm text-neutral-50 text-center">N/A</p> 
                    ) : (
                        <div>
                            {isOnRole ? (
                                <p className="m-0 text-sm text-neutral-50 text-center">MAIN</p>
                            ) : (
                                <p className="m-0 text-sm text-neutral-50 text-center">OFF</p>
                            )}
                        </div>
                    )}
                </div>
                <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-13"/>
                <div className="flex flex-col gap-0.5">
                    <SummonerSpellImage spellId={participant.spell1Id} classes="h-6" />
                    <SummonerSpellImage spellId={participant.spell2Id} classes="h-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <RuneImage runeTypeId={participant.perks.perkStyle} runeId={participant.perks.perkIds[0]} classes="h-6" />
                    <RuneImage runeTypeId={participant.perks.perkSubStyle} classes="h-6" />
                </div>
                <div>
                    <Link to={`/lol/profile/${region}/${participant.riotId.replace(/#/g, "-")}`} className="cursor-pointer hover:underline">
                        <p className={`font-normal text-lg ml-3 ${isBeingWatched ? "text-purple-400" : ""}`}>
                            {participant.riotId}
                        </p>
                    </Link>
                    <p className="font-normal text-sm ml-3 text-neutral-400">
                        {summoner.summonerLevel ? `Level ${summoner.summonerLevel}` : "Level N/A"}
                    </p>
                </div>
            </div>
            {rankedSoloDuoEntry ? (
                <>
                    <div className="flex items-center gap-2 justify-center">
                        {/* copyright issues */}
                        <img src={`https://static.bigbrain.gg/assets/lol/ranks/s13/mini/${rankedSoloDuoEntry.tier.toLowerCase()}.svg`} alt={rankedSoloDuoEntry.tier.toLowerCase()} className="h-7" />
                        <div className="flex gap-0.5">
                            <p className="capitalize">{rankedSoloDuoEntry.tier.toLowerCase()} {rankedSoloDuoEntry.rank}</p>
                            <p>({rankedSoloDuoEntry.leaguePoints}LP)</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex justify-evenly">
                            <p className={getWinrateColor(winratePercentage)}>{winratePercentage}%</p>
                            <p>{rankedSoloDuoEntry.wins}W / {rankedSoloDuoEntry.losses}L</p>
                        </div>
                        <div className="w-full h-2 bg-neutral-700">
                            <div className={`h-full ${getWinrateBackgroundColor(winratePercentage)}`} style={{width: `${winratePercentage}%` }}></div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-center">Rank not found</p>
                    <p className="text-center">Winrate not found</p>
                </>
            )}
            
            <div className="text-center">
                <p className={getWinrateColor(champStats ? Math.round(champStats.winrate) : -1)}>
                    {champStats ? `${Math.round(champStats.winrate)}%` : "-"}
                </p>
                <p>{champStats ? `(${champStats.games} Played)` : ""}</p>
            </div>
            <div className="text-center">
                <p className={getKDAColor(champStats ? Math.round(champStats.averageKDA*100)/100 : -1)}>
                    {champStats ? `${Math.round(champStats.averageKDA*100)/100}:1 KDA` : "-"}
                </p>
                <p>
                    {champStats ? `(${Math.round(champStats.totalKills/champStats.games*10)/10} / ${Math.round(champStats.totalDeaths/champStats.games*10)/10} / ${Math.round(champStats.totalAssists/champStats.games*10)/10})` : ""}
                </p>
            </div>
            {gridCols.includes("9%") && (
                <>
                    <div onClick={() => setShowRunesDiv(prev => !prev)} className="cursor-pointer font-semibold text-neutral-800 bg-neutral-300 brightness-75 text-center flex justify-center items-center p-2 mr-2">
                        <p>Runes</p>
                        <img src={arrowDownDark} alt="arrow-down" className={`h-4 ml-2 transform transition-transform ${showRunesDiv ? "rotate-180" : ""}`} />
                    </div>
                    <div className={`col-span-full transition-all duration-300 overflow-hidden ${showRunesDiv ? "max-h-[800px]" : "max-h-0"}`}>
                        <div className="bg-neutral-900 p-4">
                            <h1 className="text-neutral-100 font-bold p-2 border-l-4 border-l-purple-600">Player Tags</h1>
                        </div>
                        <hr className="text-neutral-100" />
                        <div className="bg-neutral-900 p-4">
                            <h1 className="text-neutral-100 font-bold p-2 border-l-4 border-l-purple-600">Runes</h1>
                            <RunesList runes={participant.perks} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LiveGameRow;
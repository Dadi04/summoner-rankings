import React, {useState, useEffect, } from "react";
import { useLocation, useParams, Link } from "react-router-dom"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import IconImage from "../components/IconImage";
import RuneImage from "../components/RuneImage";
import SummonerSpellImage from "../components/SummonerSpellImage";
import BannedChampionsList from "../components/BannedChampionList";
import ChampionImage from "../components/ChampionImage";
import GameTimer from "../components/GameTime";
import SummonerProfileHeader from "../components/SummonerProfileHeader";
import ShardSlot from "../components/ShardSlot";
import RuneSlot from "../components/RuneSlot";

import Perk from "../interfaces/Perk";
import Participant from "../interfaces/Participant";
import Entry from "../interfaces/Entry";
import ChampionStats from "../interfaces/ChampionStats";
import PreferredRole from "../interfaces/PreferredRole";
import Player from "../interfaces/Player";

import queueJson from "../assets/json/queues.json";
import runesJson from "../assets/json/runes.json";
import statModsJson from "../assets/json/statMods.json";

import arrowdowndark from '../assets/arrow-down-dark.png'
import loadingAnimation from '../assets/animations/loading.lottie';

interface RoleAccumulator {
    data: PreferredRole;
    roleName: string;
}

const RunesListLiveGame: React.FC<{runes: Perk}> = ({runes}) => {
    const runePrimaryTypeData = runesJson.find((runeType) => runeType.id === runes.perkStyle);
    if (!runePrimaryTypeData) return <span>Primary Rune Type Does Not Exist</span>
    const [slotPrimary0, slotPrimary1, slotPrimary2, slotPrimary3] = runePrimaryTypeData.slots;

    const runeSecondaryTypeData = runesJson.find((runeType) => runeType.id === runes.perkSubStyle);
    if (!runeSecondaryTypeData) return <span>Secondary Rune Type Does Not Exist</span>
    const [, slotSecondary1, slotSecondary2, slotSecondary3] = runeSecondaryTypeData.slots;

    const [statMods0, statMods1, statMods2] = statModsJson.slots;

    const selectedShard0 = statMods0.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;
    const selectedShard1 = statMods1.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;
    const selectedShard2 = statMods2.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;

    return (
        <div className="flex justify-evenly">
            <div className="w-[25%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-800 p-2 rounded">
                    <IconImage icon={runePrimaryTypeData.icon} alt={runePrimaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{runePrimaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-5 items-center mt-4">
                    <RuneSlot runes={slotPrimary0.runes} perkIds={runes.perkIds} height="h-17" />
                    <hr className="w-full text-neutral-300" />
                    <RuneSlot runes={slotPrimary1.runes} perkIds={runes.perkIds} height="h-12" />
                    <RuneSlot runes={slotPrimary2.runes} perkIds={runes.perkIds} height="h-12" />
                    <RuneSlot runes={slotPrimary3.runes} perkIds={runes.perkIds} height="h-12" />
                </div>
            </div>

            <div className="w-[25%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-800 p-2 rounded">
                    <IconImage icon={runeSecondaryTypeData.icon} alt={runeSecondaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{runeSecondaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-2 items-center mt-4 mb-4">
                    <RuneSlot runes={slotSecondary1.runes} perkIds={runes.perkIds} height="h-12" />
                    <RuneSlot runes={slotSecondary2.runes} perkIds={runes.perkIds} height="h-12" />
                    <RuneSlot runes={slotSecondary3.runes} perkIds={runes.perkIds} height="h-12" />
                </div>
                <hr className="text-neutral-300" />
                <div className="flex flex-col items-center mt-3 gap-1">
                    <ShardSlot slot={statMods0} selectedId={selectedShard0} />
                    <ShardSlot slot={statMods1} selectedId={selectedShard1} />
                    <ShardSlot slot={statMods2} selectedId={selectedShard2} />
                </div>
            </div>
        </div>
    );
};

const ParticipantRow: React.FC<{participant: Participant; isBeingWatched: boolean; liveGameData: Player | null; region: string; gridCols: string;}> = ({participant, isBeingWatched, liveGameData, region, gridCols}) => {
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
      
        const stats = championStats.find((cs: ChampionStats) => cs.ChampionId === championId);
        
        if (stats) {
            setChampStats(stats);
        } else {
            setChampStats(null);
        }
    }, [participant.championId, championStats]);

    const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    const mostPlayedRoleData = preferredRole.reduce<RoleAccumulator>(
        (max, curr, index) => {
            if (curr.Games > max.data.Games) {
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
                    <Link to={`/lol/profile/${region}/${participant.riotId.replace(/#/g, '-')}`} className="cursor-pointer hover:underline">
                        <p className={`font-normal text-lg ml-3 ${isBeingWatched ? "text-purple-400" : ""}`}>
                            {participant.riotId}
                        </p>
                    </Link>
                    <p className="font-normal text-sm ml-3 text-neutral-400">
                        {summoner.summonerLevel ? `Level ${summoner.summonerLevel}` : 'Level N/A'}
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
                            <p>({rankedSoloDuoEntry.LeaguePoints}LP)</p>
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
                <p className={getWinrateColor(champStats ? Math.round(champStats.WinRate) : -1)}>
                    {champStats ? `${Math.round(champStats.WinRate)}%` : "-"}
                </p>
                <p>{champStats ? `(${champStats.Games} Played)` : ""}</p>
            </div>
            <div className="text-center">
                <p className={getKDAColor(champStats ? Math.round(champStats.AverageKDA*100)/100 : -1)}>
                    {champStats ? `${Math.round(champStats.AverageKDA*100)/100}:1 KDA` : "-"}
                </p>
                <p>
                    {champStats ? `(${Math.round(champStats.TotalKills/champStats.Games*10)/10} / ${Math.round(champStats.TotalDeaths/champStats.Games*10)/10} / ${Math.round(champStats.TotalAssists/champStats.Games*10)/10})` : ""}
                </p>
            </div>
            {gridCols.includes("9%") && (
                <>
                    <div onClick={() => setShowRunesDiv(prev => !prev)} className="cursor-pointer font-semibold text-neutral-800 bg-neutral-300 brightness-75 text-center flex justify-center items-center p-2 mr-2">
                        <p>Runes</p>
                        <img src={arrowdowndark} alt="arrow-down" className={`h-4 ml-2 transform transition-transform ${showRunesDiv ? "rotate-180" : ""}`} />
                    </div>
                    <div className={`col-span-full transition-all duration-300 overflow-hidden ${showRunesDiv ? "max-h-[800px]" : "max-h-0"}`}>
                        <div className="bg-neutral-900 p-4">
                            <h1 className="text-neutral-100 font-bold p-2 border-l-4 border-l-purple-600">Player Tags</h1>
                        </div>
                        <hr className="text-neutral-100" />
                        <div className="bg-neutral-900 p-4">
                            <h1 className="text-neutral-100 font-bold p-2 border-l-4 border-l-purple-600">Runes</h1>
                            <RunesListLiveGame runes={participant.perks} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const LiveGame: React.FC = () => {
    const location = useLocation();
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }
    
    const initialData = location.state?.apiData || {};
    const [newData, setNewData] = useState(initialData);
    
    const spectatorData = newData.spectatorData ? JSON.parse(newData.spectatorData) : null;

    const [newSpectatorData, _] = useState(spectatorData);
    if (!newSpectatorData) {
        return (
            <div className="container m-auto">
                <SummonerProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
                
                <div className="flex flex-col justify-center container h-[342px] bg-neutral-800 m-auto mt-2 mb-2 p-4 text-center gap-2">
                    <h2 className="text-2xl font-semibold text-neutral-50">
                        "{newData.summonerName}#{newData.summonerTag}" is not in an active game.
                    </h2>
                    <p className="text-lg text-neutral-200">
                        Please try again later if the summoner is currently in game.
                    </p>
                </div>
            </div>
        )
    }

    const [liveGameData, setLiveGameData] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchPromises = newSpectatorData.participants.map(async (participant: Participant) => {
                    try {

                        const response = await fetch(`/api/lol/profile/${regionCode}/by-puuid/${participant.puuid}/livegame`);
                        if (!response.ok) {
                            if (response.status === 404) {
                                console.warn(`Player with puuid ${participant.puuid} not found. Skipping.`);
                                return null;
                            } else {
                                throw new Error(`HTTP error! status: ${response.status} for ${participant.puuid}`);
                            }
                        }
                        return response.json();
                    } catch (error) {
                        console.error(`Error fetching data for puuid ${participant.puuid}:`, error);
                        return null;
                    }
                });

                const data = await Promise.all(fetchPromises);
                const parsedData = data.map(item => {
                    if (item === null) return null;
                    
                    return {
                        ...item,
                        summonerName: item.summonerName,
                        summonerTag: item.summonerTag,
                        region: item.region,
                        puuid: item.puuid,
                        playerData:
                            typeof item.playerData === "string" && item.playerData.trim()
                                ? JSON.parse(item.playerData)
                                : item.playerData,
                        summonerData:
                            typeof item.summonerData === "string" && item.summonerData.trim()
                                ? JSON.parse(item.summonerData)
                                : item.summonerData,
                        entriesData:
                            typeof item.entriesData === "string" && item.entriesData.trim()
                                ? JSON.parse(item.entriesData)
                                : item.entriesData,
                        topMasteriesData:
                            typeof item.topMasteriesData === "string" && item.topMasteriesData.trim()
                                ? JSON.parse(item.topMasteriesData)
                                : item.topMasteriesData,
                        allMatchIds:
                            typeof item.allMatchIds === "string" && item.allMatchIds.trim()
                                ? JSON.parse(item.allMatchIds)
                                : item.allMatchIds,
                        allMatchesDetailsData:
                            typeof item.allMatchesDetailsData === "string" && item.allMatchesDetailsData.trim()
                                ? JSON.parse(item.allMatchesDetailsData)
                                : item.allMatchesDetailsData,
                        allGamesChampionStatsData:
                            typeof item.allGamesChampionStatsData === "string" && item.allGamesChampionStatsData.trim()
                                ? JSON.parse(item.allGamesChampionStatsData)
                                : item.allGamesChampionStatsData,
                        allGamesRoleStatsData:
                            typeof item.allGamesRoleStatsData === "string" && item.allGamesRoleStatsData.trim()
                                ? JSON.parse(item.allGamesRoleStatsData)
                                : item.allGamesRoleStatsData,
                        rankedSoloChampionStatsData:
                            typeof item.rankedSoloChampionStatsData === "string" && item.rankedSoloChampionStatsData.trim()
                                ? JSON.parse(item.rankedSoloChampionStatsData)
                                : item.rankedSoloChampionStatsData,
                        rankedSoloRoleStatsData:
                            typeof item.rankedSoloRoleStatsData === "string" && item.rankedSoloRoleStatsData.trim()
                                ? JSON.parse(item.rankedSoloRoleStatsData)
                                : item.rankedSoloRoleStatsData,
                        rankedFlexChampionStatsData:
                            typeof item.rankedFlexChampionStatsData === "string" && item.rankedFlexChampionStatsData.trim()
                                ? JSON.parse(item.rankedFlexChampionStatsData)
                                : item.rankedFlexChampionStatsData,
                        rankedFlexRoleStatsData:
                            typeof item.rankedFlexRoleStatsData === "string" && item.rankedFlexRoleStatsData.trim()
                                ? JSON.parse(item.rankedFlexRoleStatsData)
                                : item.rankedFlexRoleStatsData,
                        challengesData:
                            typeof item.challengesData === "string" && item.challengesData.trim()
                                ? JSON.parse(item.challengesData)
                                : item.challengesData,
                        spectatorData:
                            typeof item.spectatorData === "string" && item.spectatorData.trim()
                                ? JSON.parse(item.spectatorData)
                                : item.spectatorData,
                        clashData:
                            typeof item.clashData === "string" && item.clashData.trim()
                                ? JSON.parse(item.clashData)
                                : item.clashData,
                        addedAt: item.addedAt
                    };
                });
                setLiveGameData(parsedData);
            } catch (error) {
                console.error("Error fetching live game data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [regionCode, encodedSummoner, newSpectatorData.participants]);

    const queueId = newSpectatorData.gameQueueConfigId;
    const queueData = queueJson.find((item) => item.queueId === queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";
    const isTeamIdSame = newSpectatorData.participants.every(
        (participant: Participant) => participant.teamId === newSpectatorData.participants[0].teamId
    );

    if (loading || !liveGameData) {
        return (
            <div className="container m-auto mb-[39px]">
                <SummonerProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
                <div className="w-full flex justify-center mt-5">
                    <DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay />
                </div>
            </div>
        );
    }

    return (
        <div className="container m-auto">
            <SummonerProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
            <div className="flex justify-between items-center text-neutral-100 bg-neutral-800 mt-2 p-2">
                <div className="flex">
                    <h1 className="mr-2">
                        {gamemode}
                    </h1>
                    <h1 className="mr-2 bg-purple-500 pl-2 pr-2 rounded font-bold text-sm">
                        Live
                        <span className="animate-pulse text-purple-800 ml-1.5">●</span>
                    </h1>
                    <h1 className="mr-2 border-r-1 border-l-1 pl-2 pr-2 border-neutral-600">
                        {map}
                    </h1>
                    <GameTimer gameLength={newSpectatorData.gameLength} gameStartTime={newSpectatorData.gameStartTime} classes="mr-2" />
                </div>
            </div>

            {isTeamIdSame ? (
                <div className="bg-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl font-semibold">Bans</h1>
                        <BannedChampionsList bannedChampions={newSpectatorData.bannedChampions} isTeamIdSame={isTeamIdSame} />
                    </div>
                    <hr className="text-neutral-400" />
                </div>
            ) : (
                <div className="flex w-full justify-between bg-neutral-800 p-2">
                    <BannedChampionsList bannedChampions={newSpectatorData.bannedChampions} isTeamIdSame={isTeamIdSame} teamFilter={100} />
                    <BannedChampionsList bannedChampions={newSpectatorData.bannedChampions} isTeamIdSame={isTeamIdSame} teamFilter={200} />
                </div>
            )}

            {isTeamIdSame ? (
                <div className="bg-neutral-800">
                    <div className="grid grid-cols-[50%_12.5%_12.5%_12.5%_12.5%] w-full mb-2 mt-2 text-xl font-semibold">
                        <h1>Summoner</h1>
                        <h1 className="text-center">1st Place</h1>
                        <h1 className="text-center">Top 2</h1>
                        <h1 className="text-center">Top 4</h1>
                        <h1 className="text-center">Matches</h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        {newSpectatorData.participants.map((participant: Participant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                isBeingWatched={newData.puuid === participant.puuid}
                                liveGameData={liveGameData.find(player => player?.puuid === participant.puuid) || null}
                                region={regionCode}
                                gridCols="grid-cols-[50%_12.5%_12.5%_12.5%_12.5%]"
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-neutral-800 mb-2 p-2">
                    <div className="grid grid-cols-[35%_20%_12%_12%_12%_9%] w-full mb-2 text-neutral-50">
                        <div className="flex items-center">
                            <h1 className="font-bold text-blue-500 mr-2">Blue Team</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center"></p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-blue-500 text-neutral-200">
                        {newSpectatorData.participants.filter((participant: Participant) => participant.teamId === 100).map((participant: Participant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                isBeingWatched={newData.puuid === participant.puuid}
                                liveGameData={liveGameData.find(player => player?.puuid === participant.puuid) || null}
                                region={regionCode}
                                gridCols="grid-cols-[35%_20%_12%_12%_12%_9%]"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-[35%_20%_12%_12%_12%_9%] w-full mb-2 mt-5 text-neutral-50">
                        <div className="flex items-center">
                            <h1 className="font-bold text-red-500 mr-2">Red Team</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center"></p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-red-500 text-neutral-200">
                        {newSpectatorData.participants.filter((participant: Participant) => participant.teamId === 200).map((participant: Participant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                isBeingWatched={newData.puuid === participant.puuid}
                                liveGameData={liveGameData.find(player => player?.puuid === participant.puuid) || null}
                                region={regionCode}
                                gridCols="grid-cols-[35%_20%_12%_12%_12%_9%]"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveGame;
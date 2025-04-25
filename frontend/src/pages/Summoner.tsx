import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DD_VERSION, LOL_VERSION } from "../version";

import GameTimer from "../components/GameTime";
import ChampionImage from "../components/ChampionImage";
import ProfileHeader from "../components/ProfileHeader";
import MatchRow from "../components/Summoner/MatchRow";

import Participant from "../interfaces/Participant";
import Entry from "../interfaces/Entry";
import ChampionStats from "../interfaces/ChampionStats";
import PreferredRole from "../interfaces/PreferredRole";
import Mastery from "../interfaces/Mastery";
import Player from "../interfaces/Player";
import Match from "../interfaces/Match";

import queueJson from "../assets/json/queues.json";

import performance from "../assets/performance.png";
import goldMedal from "../assets/gold-medal.png";
import silverMedal from "../assets/silver-medal.png";
import bronzeMedal from "../assets/bronze-medal.png";
import medalLight from "../assets/medal-light.png";
import topThreeLight from "../assets/topthree-light.png";
import filterLight from "../assets/filter-light.png";
import fill from "../assets/fill.png";
import loadingAnimation from "../assets/animations/loading.lottie";
import arrowDownLight from "../assets/arrow-down-light.png";
import noneicon from "../assets/none.jpg";
import arrowGoingUp from "../assets/arrow-going-up.png";

type Role = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";  
const roleLabels: { role: Role; label: string }[] = [
    { role: "TOP", label: "Top" },
    { role: "JUNGLE", label: "Jungle" },
    { role: "MIDDLE", label: "Middle" },
    { role: "BOTTOM", label: "Bottom" },
    { role: "UTILITY", label: "Support" },
];  

const Summoner: React.FC = () => {
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const summoner = decodeURIComponent(encodedSummoner);

    const [selectedChampionPerformanceMode, setSelectedChampionPerformanceMode] = useState<string>("soloduo");
    const [selectedRolePerformanceMode, setSelectedRolePerformanceMode] = useState<string>("soloduo");

    const [selectedRole, setSelectedRole] = useState<string>("fill");
    const [selectedPatch, setSelectedPatch] = useState<string>("all-patches");
    const [selectedQueue, setSelectedQueue] = useState<string>("all-queues");
    const [selectedChampion, setSelectedChampion] = useState<string>("All Champions");
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [showPatch, setShowPatch] = useState<boolean>(false);
    const [champions, setChampions] = useState<any[]>([]);
    const [items, setItems] = useState<any>({});
    const [showSelectChampions, setShowSelectChampions] = useState<boolean>(false);
    const [paginatorPage, setPaginatorPage] = useState<number>(1);
    const inputRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [apiData, setApiData] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    const [major, minor] = LOL_VERSION.split('.').map(Number);
    const versions = Array.from({length: minor - 0}, (_, i) => `${major}.${minor - i}`);

    const matchesByDate = useMemo(() => {
        return apiData?.allMatchesData.reduce<Record<string, Match[]>>((acc, match) => {
            const date = new Date(match.details.info.gameStartTimestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            (acc[date] ??= []).push(match);
            return acc;
        }, {}) || {};
    }, [apiData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (inputRef.current && dropdownRef.current && !inputRef.current.contains(target) && !dropdownRef.current.contains(target)) {
                setShowSelectChampions(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    })

    useEffect(() => {
        const fetchChampions = async () => {
            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/championFull.json`);
                const data = await response.json();
                const championsArray = Object.values(data.data);
                setChampions(championsArray);
            } catch (error) {
                console.error("Error fetching champions", error);
            }
        };
        fetchChampions();
    }, [DD_VERSION]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/item.json`);
                const json = await res.json();
                setItems(json.data);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
    }, [DD_VERSION]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/lol/profile/${regionCode}/${summoner}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApiData(data);
            } catch (error) {
                console.error('Error fetching API data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [regionCode, summoner]);

    if (loading || !apiData) {
        return <div className="w-full flex justify-center mt-[125px] mb-[195px]"><DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay /></div>
    }

    console.log("apiData", apiData);

    // const clashData = apiData.clashData;
    const championStatsSoloDuoData = Object.values(apiData.rankedSoloChampionStatsData);
    const championStatsFlexData = Object.values(apiData.rankedFlexChampionStatsData);
    const preferredSoloDuoRoleData = Object.values(apiData.rankedSoloRoleStatsData);
    const preferredFlexRoleData = Object.values(apiData.rankedFlexRoleStatsData);
    // const summonerData: SummonerInfo = apiData.summonerData;
    const entriesData: Entry[] = apiData.entriesData;
    const topMasteriesData: Mastery[] = apiData.topMasteriesData;
    // const allMatchIds: string[] = apiData.allMatchIds;
    const allMatchesData: Match[] = apiData.allMatchesData;
    const spectatorData = apiData.spectatorData;
    
    championStatsSoloDuoData.sort((a: ChampionStats, b: ChampionStats) => b.games - a.games || b.winRate - a.winRate);
    championStatsFlexData.sort((a: ChampionStats, b: ChampionStats) => b.games - a.games || b.winRate - a.winRate);

    const championsStatsData = selectedChampionPerformanceMode === "soloduo" ? championStatsSoloDuoData : championStatsFlexData;
    const preferredRoleData = selectedRolePerformanceMode === "soloduo" ? preferredSoloDuoRoleData : preferredFlexRoleData;

    const isTeamIdSame = spectatorData?.participants.every(
        (participant: Participant) => participant.teamId === spectatorData.participants[0].teamId
    );

    const queueId = spectatorData?.gameQueueConfigId;
    const queueData = queueJson.find((item) => item.queueId === queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";

    const rankedSoloDuoEntry = entriesData.find((entry: Entry) => entry.queueType === "RANKED_SOLO_5x5");
    const rankedFlexEntry = entriesData.find((entry: Entry) => entry.queueType === "RANKED_FLEX_SR");
    let rankedSoloDuoWinrate = 0;
    if (rankedSoloDuoEntry) {
        rankedSoloDuoWinrate = Math.round(rankedSoloDuoEntry.wins / (rankedSoloDuoEntry.wins + rankedSoloDuoEntry.losses) * 100);
    }
    let rankedFlexWinrate = 0;
    if (rankedFlexEntry) {
        rankedFlexWinrate = Math.round(rankedFlexEntry.wins / (rankedFlexEntry.wins + rankedFlexEntry.losses) * 100);
    }
    
    const totalPlayerKills = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.kills ?? 0)
    }, 0);
    const totalPlayerDeaths = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.deaths ?? 0)
    }, 0);
    const totalPlayerAssists = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.assists ?? 0)
    }, 0);
    const avgKDA = totalPlayerDeaths > 0 ? ((totalPlayerKills + totalPlayerAssists) / totalPlayerDeaths).toFixed(2) : "Perfect";

    const totalKills = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        if (player) {
            const playerTeamId = player.teamId;
            const teamKills = match.details.info.participants.filter(p => p.teamId === playerTeamId).reduce((teamSum, teammate) => teamSum + (teammate.kills || 0), 0);  
            
            return sum + teamKills;
        }
        return sum;
    }, 0);
    const avgKP = Math.round((totalPlayerAssists+totalPlayerKills)/totalKills*100);

    const champStats = new Map<number, ChampionStats>();
    for (const match of allMatchesData) {
        const p = match.details.info.participants.find((player) => player.puuid === apiData.puuid);
        if (!p) continue;
        const { championId: id, championName: name, win, kills, deaths, assists } = p;

        if (!champStats.has(id)) {
            champStats.set(id, {
              championId: id,
              championName: name,
              games: 0,
              wins: 0,
              totalKills: 0,
              totalDeaths: 0,
              totalAssists: 0,
              winRate: 0,
              averageKDA: 0,
            });
        }
        const entry = champStats.get(id)!;
        entry.games += 1;
        if (win) entry.wins += 1;
        entry.totalKills   += kills;
        entry.totalDeaths  += deaths;
        entry.totalAssists += assists;
    }

    for (const entry of champStats.values()) { 
        entry.winRate = (entry.wins / entry.games) * 100;
        entry.averageKDA = entry.totalDeaths > 0 ? (entry.totalKills + entry.totalAssists) / entry.totalDeaths : entry.totalKills + entry.totalAssists;
    }

    const top3 = Array.from(champStats.values()).sort((a, b) => {
        if (b.games !== a.games) {
          return b.games - a.games;
        }
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        return b.averageKDA - a.averageKDA;
    }).slice(0, 3);

    const roleCounts = roleLabels.reduce((acc, { role }) => {
        acc[role] = 0;
        return acc;
    }, {} as Record<Role, number>);

    allMatchesData.forEach(match => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        if (player) {
            roleCounts[player.teamPosition as Role]++;
        }
    });
    const totalGames = allMatchesData.length;  

    const rolePercents: Record<Role, number> = {} as any;
    (roleLabels as typeof roleLabels).forEach(({ role }) => {rolePercents[role] = totalGames > 0 ? Math.round((roleCounts[role] / totalGames) * 100) : 0;});

    const totalPages = Math.round(apiData.totalMatches / apiData.pageSize);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const allWins = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.win ? 1 : 0)
    }, 0);
    const winratePercent = Math.round(allWins / totalGames * 100);
    const winAngle = winratePercent * 1.8;

    function getWinrateColor(winrate: number, games: number) {
        if (games == 0) return "";
        if (winrate < 50) return "text-red-500";
        if (winrate < 60) return "text-green-500";
        if (winrate < 70) return "text-blue-500";
        return "text-orange-500"
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
        <div className="container m-auto">
            <ProfileHeader data={apiData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setApiData} />
            <div className="mt-2 text-neutral-50"> 
                {spectatorData && (
                    <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: apiData}}>
                        <div className="relative group w-full flex items-center bg-neutral-800 cursor-pointer pb-4">
                            {isTeamIdSame ? (
                                <div className="flex p-2 cursor-pointer">
                                    {spectatorData.participants.map((participant: Participant) => (
                                        <div>
                                            <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${participant.profileIconId}.png`} alt={`${participant.profileIconId}`} className="h-30 rounded-xl border-2 border-purple-600" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full flex justify-between p-2">
                                    <div className="flex w-[40%] justify-evenly">
                                        {spectatorData.participants.filter((participant: Participant) => (participant.teamId === 100)).map((participant: Participant) => (
                                            <div key={participant.championId} className="relative">
                                                <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${participant.profileIconId}.png`} alt={`${participant.profileIconId}`} className={`h-20 rounded-xl border-2 ${apiData.puuid === participant.puuid ? "border-purple-600" : "border-blue-600"}`} />
                                                <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-[35px] absolute bottom-0 left-0 transform translate-y-1/3" />
                                                {/* copyright issues */}
                                                <div className="bg-black absolute bottom-0 right-0 transform translate-y-1/3">
                                                    <img src={`https://dpm.lol/position/${participant.predictedRole}.svg`} alt={participant.predictedRole} className="h-[35px]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-0.5 text-center">
                                        <div className="flex items-center text-xl font-bold">
                                            <span className="animate-pulse text-purple-500 mr-1.5">●</span>
                                            <p>Live Game</p>
                                        </div>
                                        <p className="text-sm">{gamemode}</p>
                                        <GameTimer gameLength={spectatorData.gameLength} gameStartTime={spectatorData.gameStartTime} classes="text-xl text-neutral-50" />
                                    </div>
                                    <div className="flex w-[40%] justify-evenly">
                                        {spectatorData.participants.filter((participant: Participant) => (participant.teamId === 200)).map((participant: Participant) => (
                                            <div key={participant.championId} className="relative">
                                                <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${participant.profileIconId}.png`} alt={`${participant.profileIconId}`} className={`h-20 rounded-xl border-2 ${apiData.puuid === participant.puuid ? "border-purple-600" : "border-red-600"}`} />
                                                <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-[35px] absolute bottom-0 left-0 transform translate-y-1/3" />
                                                {/* copyright issues */}
                                                <div className="bg-black absolute bottom-0 right-0 transform translate-y-1/3">
                                                    <img src={`https://dpm.lol/position/${participant.predictedRole}.svg`} alt={participant.predictedRole} className="h-[35px]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" style={{background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 10%, #262626 40%, #262626 100%)'}} />                        
                            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                                <span className="text-white text-2xl font-bold">LIVE DETAILS</span>
                            </div>
                        </div>
                    </Link>
                )}
                <div className="flex justify-between mt-2 gap-2">
                    <div className="w-[25%] flex flex-col gap-2">
                        <div className="bg-neutral-800">
                            {rankedSoloDuoEntry ? (
                                <>
                                    <div className="flex justify-between p-2">
                                        <div className="flex items-center gap-1">
                                            <img src={medalLight} alt="medalLight" className="h-5" />
                                            <h1>Ranked Solo/Duo</h1>
                                        </div>
                                        <div>
                                            <select name="" id="" className="bg-neutral-800 outline-none border-none" defaultValue={"Last 7 days"}>
                                                <option value="">Last 7 days</option>
                                                <option value="">Last 30 days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        {/* copyright issues */}
                                        <img src={`https://dpm.lol/rank/${rankedSoloDuoEntry.tier}.webp`} alt={rankedSoloDuoEntry.tier.toLowerCase()} className="h-25" />
                                        <div className="flex flex-col gap-1 text-center">
                                            <p className="font-bold text-lg">{rankedSoloDuoEntry.tier} {rankedSoloDuoEntry.rank} {rankedSoloDuoEntry.leaguePoints} LP</p>
                                            <p>{rankedSoloDuoEntry.wins}W-{rankedSoloDuoEntry.losses}L ({rankedSoloDuoWinrate}%)</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        GRAPH TODO
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between p-2">
                                    <div className="flex items-center gap-1"> 
                                        <img src={medalLight} alt="medalLight" className="h-5" />
                                        <h1>Ranked Solo/Duo</h1>
                                    </div>
                                    <p>Unranked</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-neutral-800">
                            {rankedFlexEntry ? (
                                <>
                                    <div className="flex justify-between p-2">
                                        <div className="flex items-center gap-1">
                                            <img src={medalLight} alt="medalLight" className="h-5" />
                                            <h1>Ranked Flex</h1>
                                        </div>
                                        <div>
                                            <select name="" id="" className="bg-neutral-800 outline-none border-none" defaultValue={"Last 7 days"}>
                                                <option value="">Last 7 days</option>
                                                <option value="">Last 30 days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        {/* copyright issues */}
                                        <img src={`https://dpm.lol/rank/${rankedFlexEntry.tier}.webp`} alt={rankedFlexEntry.tier.toLowerCase()} className="h-25" />
                                        <div className="flex flex-col gap-1 text-center">
                                            <p className="font-bold">{rankedFlexEntry.tier} {rankedFlexEntry.rank} {rankedFlexEntry.leaguePoints} LP</p>
                                            <p>{rankedFlexEntry.wins}W-{rankedFlexEntry.losses}L ({rankedFlexWinrate}%)</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        GRAPH TODO
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between p-2">
                                    <div className="flex items-center gap-1"> 
                                        <img src={medalLight} alt="medalLight" className="h-5" />
                                        <h1>Ranked Flex</h1>
                                    </div>
                                    <p>Unranked</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-neutral-800">
                            <div className="flex justify-between p-2 items-center">
                                <div className="flex items-center gap-1">
                                    <img src={performance} alt="performance" className="h-7" />
                                    <h1>Champion Performance</h1>
                                </div>
                                <div>
                                    <select onChange={(e) => setSelectedChampionPerformanceMode(e.target.value)} className="bg-neutral-800 outline-none border-none" value={selectedChampionPerformanceMode}>
                                        <option value="soloduo">Ranked Solo/Duo</option>
                                        <option value="flex">Ranked Flex</option>
                                    </select>
                                </div>
                            </div>
                            {championsStatsData.length > 0 ? (
                                <div className="grid grid-cols-[28%_26%_26%_20%] mb-1 pr-5 text-neutral-400 text-lg">
                                    <p></p>
                                    <h1 className="text-center">KDA</h1>
                                    <h1 className="text-center">Games</h1>
                                    <h1 className="text-center">Winrate</h1>
                                </div>
                            ) : (
                                <div className="text-center p-2">
                                    <p>No games found</p>
                                </div>
                            )}
                            <div>
                                {championsStatsData.slice(0, 5).map((championStat: ChampionStats, index: number) => {
                                    return (
                                        <div key={championStat.championId}>
                                            { index !== 0 && <hr /> }
                                            <div className="grid grid-cols-[28%_26%_26%_20%] pr-5 mb-1 mt-1 items-center text-center">
                                                <div className="flex justify-center">
                                                    <ChampionImage championId={championStat.championId} isTeamIdSame={true} classes="h-15" />
                                                </div>
                                                <div>
                                                    <p className={`${getKDAColor(Math.round(championStat.averageKDA*100)/100)}`}>
                                                        {Math.round(championStat.averageKDA*100)/100}:1
                                                    </p>
                                                    <div className="flex justify-center gap-1 items-center">
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalKills/championStat.games*10)/10}</p>
                                                        <p className="text-neutral-400 text-sm">/</p>
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalDeaths/championStat.games*10)/10}</p>
                                                        <p className="text-neutral-400 text-sm">/</p>
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalAssists/championStat.games*10)/10}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {championStat.games}
                                                </div>
                                                <div className={`${getWinrateColor(Math.round(championStat.winRate), championStat.games)}`}>
                                                    <p>{Math.round(championStat.winRate)}%</p> 
                                                    {/* <p>({championStat.Wins}W-{championStat.Games-championStat.Wins}L)</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition-all duration-150 ease-in hover:bg-neutral-600">
                                    See More Champions
                                </Link>
                            </div>
                        </div>
                        <div className="bg-neutral-800 pb-2">
                            <div className="flex justify-between mb-1 p-2 items-center">
                                <div className="flex items-center gap-1">
                                    <img src={performance} alt="performance" className="h-7" />
                                    <h1>Role Performance</h1>
                                </div>
                                <div>
                                    <select onChange={(e) => setSelectedRolePerformanceMode(e.target.value)} className="bg-neutral-800 outline-none border-none" value={selectedRolePerformanceMode}>
                                        <option value="soloduo">Ranked Solo/Duo</option>
                                        <option value="flex">Ranked Flex</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 text-center text-neutral-400 text-lg">
                                <p></p>
                                <p>Role</p>
                                <p>Games</p>
                                <p>Winrate</p>
                                <p></p>
                            </div>
                            <div>
                                {preferredRoleData.sort((a: PreferredRole, b: PreferredRole) => b.games - a.games).map((role: PreferredRole) => (
                                    <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 items-center text-center">
                                        <div className="flex justify-end">
                                            <img src={`https://dpm.lol/position/${role.roleName}.svg`} alt={role.roleName} className="h-[35px]" />
                                        </div>
                                        <div>
                                            <p className="capitalize">{role.roleName === "UTILITY" ? "support" : role.roleName.toLowerCase()}</p>
                                        </div>
                                        <div>
                                            <p>{role.games}</p>
                                        </div>
                                        <div className={getWinrateColor(Math.round(role.winRate), role.games)}>
                                            <p>{Math.round(role.winRate)}%</p>
                                            {/* <p>({role.Wins}W-{role.Games-role.Wins}L)</p> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-neutral-800">
                            <div className="flex gap-2 p-2">
                                <img src={topThreeLight} alt="topThreeLight" className="h-7" />
                                <h1>Top 3 Highest Masteries</h1>
                            </div>
                            <div className="flex justify-around mb-7">
                                {[topMasteriesData[1], topMasteriesData[0], topMasteriesData[2]].map((mastery: Mastery, index: number) => {
                                    let medalSrc, medalAlt;
                                    if (index === 0) {
                                        medalSrc = silverMedal;
                                        medalAlt = "silverMedal";
                                    } else if (index === 1) {
                                        medalSrc = goldMedal;
                                        medalAlt = "goldMedal";
                                    } else {
                                        medalSrc = bronzeMedal;
                                        medalAlt = "bronzeMedal";
                                    }
                                    return (
                                        <div key={mastery.championId} className="flex flex-col items-center">
                                            <div className="relative">
                                                <img src={`https://opgg-static.akamaized.net/images/champion_mastery/renew_v2/mastery-${mastery.championLevel > 10 ? 10 : mastery.championLevel}.png`} alt={`${mastery.championLevel}`} className="h-15" />
                                                {mastery.championLevel > 10 && (
                                                    <p className="text-sm bg-neutral-900 pl-2 pr-2 absolute transform bottom-0 left-1/2 -translate-x-1/2">{mastery.championLevel}</p>
                                                )}
                                                {/* <p className="text-center text-sm">{mastery.championPoints}</p> */}
                                            </div>
                                            <div className="relative">
                                                <img src={medalSrc} alt={medalAlt} className="h-8 absolute transform bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2" />
                                                <ChampionImage championId={mastery.championId} isTeamIdSame={true} classes="h-15" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition-all duration-150 ease-in hover:bg-neutral-600">
                                See More Masteries
                            </Link>
                        </div>
                    </div>
                    <div className="w-[75%] flex flex-col">
                        <div className="bg-neutral-800 text-center p-2 pb-4 mb-2 border-b-6 border-purple-600 rounded-b-lg shadow-xl">
                            <div className="flex justify-center items-center gap-2 p-2">
                                <img src={arrowGoingUp} alt="arrowGoingUp" className="h-8" />
                                <h1 className="text-lg">Last 20 Games Pefrormance</h1>
                            </div>
                            <div className="grid grid-cols-[25%_25%_25%_25%]">
                                <div className="flex flex-col items-center justify-center space-y-10 relative">
                                    <div className="relative w-52 h-52 rounded-full" style={{ background: `conic-gradient( #ef4444 0deg ${winAngle}deg, #3b82f6 ${winAngle}deg 360deg)`}}>
                                        <div className="absolute inset-0 m-auto w-40 h-40 bg-neutral-800 rounded-full flex items-center justify-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className={`text-xl font-semibold m-0 ${getWinrateColor(winratePercent, totalGames)}`}>
                                                    {winratePercent}%
                                                </p>
                                                <p className="text-neutral-400 text-lg mb-2">Winrate</p>
                                                <p className="text-xl text-neutral-300 font-semibold">
                                                    {allWins}W - {totalGames - allWins}L
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-full justify-center gap-4">
                                    {top3.map(champStats => (
                                        <div className="flex items-center justify-center gap-4">
                                            <ChampionImage championId={champStats.championId} teamId={200} isTeamIdSame={true} classes="h-13" />
                                            <div className="flex flex-col text-lg">
                                                <div className="flex gap-2">
                                                    <p className={`${getWinrateColor(champStats.winRate, champStats.games)}`}>{Math.round(champStats.winRate)}%</p>
                                                    <p className="text-neutral-400">{champStats.wins}W-{champStats.games-champStats.wins}L</p>
                                                </div>
                                                <div>
                                                    <p className={`text-left ${getKDAColor(champStats.averageKDA)}`}>{champStats.averageKDA.toFixed(1)} KDA</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-lg">KDA</p>
                                    <p className="text-6xl text-purple-400 font-semibold mt-12 mb-5">{avgKDA}</p>
                                    <div className="flex items-center justify-center">
                                        <p className="text-xl">{(totalPlayerKills/apiData.pageSize).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl text-purple-300">{(totalPlayerDeaths/apiData.pageSize).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl">{(totalPlayerAssists/apiData.pageSize).toFixed(1)}</p>
                                    </div>
                                    <p className="text-neutral-400 mt-4">Average Kill Participation {avgKP}%</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-lg">Preferred Roles</p>
                                    <div className="space-y-2 p-2">
                                        {roleLabels.map(({ role, }) => {
                                            const percent = rolePercents[role];
                                            return (
                                                <div key={role}>
                                                    <div className="flex justify-between mb-1 text-sm text-neutral-300 items-center">
                                                        <img src={`https://dpm.lol/position/${role}.svg`} alt="" />
                                                        <span>{percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex bg-neutral-700 rounded-xl gap-3 p-2 border border-purple-500">
                                <img onClick={() => setSelectedRole("fill")} src={fill} alt="FILL" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "fill" ? "bg-neutral-800" : ""}`} />
                                <img onClick={() => setSelectedRole("top")} src={`https://dpm.lol/position/TOP.svg`} alt="TOP" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "top" ? "bg-neutral-800" : ""}`} />
                                <img onClick={() => setSelectedRole("jungle")} src={`https://dpm.lol/position/JUNGLE.svg`} alt="JUNGLE" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "jungle" ? "bg-neutral-800" : ""}`} />
                                <img onClick={() => setSelectedRole("middle")} src={`https://dpm.lol/position/MIDDLE.svg`} alt="MIDDLE" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "middle" ? "bg-neutral-800" : ""}`} />
                                <img onClick={() => setSelectedRole("bottom")} src={`https://dpm.lol/position/BOTTOM.svg`} alt="BOTTOM" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "bottom" ? "bg-neutral-800" : ""}`} />
                                <img onClick={() => setSelectedRole("utility")} src={`https://dpm.lol/position/UTILITY.svg`} alt="UTILITY" className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "utility" ? "bg-neutral-800" : ""}`} />
                            </div>
                            <div>
                                <div 
                                    onClick={() => setShowFilter(prev => !prev)} 
                                    className="flex gap-1 p-2 items-center text-xl font-bold relative cursor-pointer border bg-neutral-600 rounded-xl border-purple-500">
                                    <img src={filterLight} alt="filterLight" className="h-6 mr-2" />
                                    <p>Filter</p>
                                    <img src={arrowDownLight} alt="arrowDownLight" className={`h-4 transform transition-transform ${showFilter ? "rotate-180" : ""}`} />
                                </div>
                            </div>
                        </div>
                        <div className={`w-full bg-neutral-800 transition-all duration-300 ${showFilter ? "max-h-[800px] overflow-visible mb-2" : "max-h-0 overflow-hidden"}`}>
                            <div className="flex justify-between items-center p-2">
                                <div>
                                    <div className="flex gap-4 p-2">
                                        <p onClick={() => setSelectedQueue("all-queues")} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === "all-queues" ? "bg-neutral-700" : ""}`}>All</p>
                                        <p onClick={() => setSelectedQueue("solo-duo")} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === "solo-duo" ? "bg-neutral-700" : ""}`}>Solo Duo</p>
                                        <p onClick={() => setSelectedQueue("flex")} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === "flex" ? "bg-neutral-700" : ""}`}>Flex</p>
                                        <p onClick={() => setSelectedQueue("aram")} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === "aram" ? "bg-neutral-700" : ""}`}>Aram</p>
                                        <p onClick={() => setSelectedQueue("normal")} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === "normal" ? "bg-neutral-700" : ""}`}>Normal</p>
                                    </div>
                                    <div className="relative">
                                        <div onClick={() => setShowPatch(prev => !prev)} className="flex items-center justify-center p-2 text-lg font-bold">
                                            <p>Select Patch</p>
                                            <img src={arrowDownLight} alt="arrowDownLight" className={`h-4 transform transition-transform ${showPatch ? "rotate-180" : ""}`} />
                                        </div>
                                        <div className={`absolute top-full left-0 w-full bg-neutral-800 text-center transition-all duration-300 border border-purple-500 overflow-y-auto shadow-lg max-h-[300px]
                                            ${showPatch ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                                            <p key="all-patches" onClick={() => setSelectedPatch("all-patches")} className={`p-1 cursor-pointer text-lg transition-all duration-100 hover:text-neutral-300 ${selectedPatch === "all-patches" ? "bg-neutral-700" : ""}`}>
                                                All Patches
                                            </p>
                                            {versions.map((version) => (
                                                <p key={version} onClick={() => setSelectedPatch(`${version}`)} className={`p-1 cursor-pointer text-lg transition-all duration-100 hover:text-neutral-300 ${selectedPatch === version ? "bg-neutral-700" : ""}`}>
                                                    {version}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div ref={inputRef} onClick={() => setShowSelectChampions(true)} className="text-xl">
                                    {/* You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`. */}
                                        <input type="text" placeholder="Select Champion" value={selectedChampion} className="w-full border-none outline-none" />
                                    </div>
                                    <div ref={dropdownRef} className={`absolute top-full left-0 w-full bg-neutral-800 transition-all duration-300 border border-purple-500 overflow-y-auto shadow-lg max-h-[400px]
                                         ${showSelectChampions ? "opacity-100 visible" : "opacity-0 invisible"} custom-scrollbar`}>
                                        <div onClick={() => setSelectedChampion("All Champions")} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === "All Champions" ? "bg-neutral-700" : ""}`}>
                                            <img src={noneicon} alt="none-icon" className="h-12" />
                                            <span>All Champions</span>
                                        </div>
                                        <div>
                                            {champions.map((champion) => (
                                                <div key={champion.id} onClick={() => setSelectedChampion(champion.name)} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === champion.name ? "bg-neutral-700" : ""} `}>
                                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${champion.id}.png`} alt={champion.name} className="h-12" />
                                                    <span>{champion.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800">
                            {Object.entries(matchesByDate).map(([date, matches]) => (
                                <div key={date}>
                                    <h2 className="px-4 py-2 text-xl font-semibold">{date}</h2>
                                    {matches.map(match => (
                                        <MatchRow
                                            key={match.details.info.gameId}
                                            info={match.details.info}
                                            timelineJson={match.timelineJson}
                                            items={items}
                                            champions={champions}
                                            puuid={apiData.puuid}
                                            region={regionCode}
                                            classes="mb-1 px-2"
                                        />
                                    ))}
                                </div>
                            ))}
                            <div className="flex justify-center mt-4">
                                <ul className="flex items-center h-10 text-base">
                                    <li>
                                        <span onClick={() => setPaginatorPage((prev) => Math.max(prev - 1, 1))} className="flex items-center justify-center px-4 h-10 leading-tight border cursor-pointer transition-all border-gray-300 rounded-s-lg hover:bg-neutral-900 hover:text-neutral-100">
                                            <span className="sr-only">Previous</span>
                                            <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                                            </svg>
                                        </span>
                                    </li>
                                    {pageNumbers.map((page: number) => (
                                        <li key={page} onClick={() => setPaginatorPage(page)}>
                                            <span className={`flex items-center justify-center px-4 h-10 leading-tight border-y border-r cursor-pointer transition-all ${paginatorPage === page ? "text-purple-600 border-purple-300 bg-purple-100 hover:bg-purple-200 hover:text-purple-700" : "border-gray-300 hover:bg-neutral-900 hover:text-neutral-100"}`}>
                                                {page}
                                            </span>
                                        </li>
                                    ))}
                                    <li>
                                        <span onClick={() => setPaginatorPage((prev) => Math.min(prev + 1, totalPages))} className="flex items-center justify-center px-4 h-10 leading-tight border-y border-r cursor-pointer transition-all border-gray-300 rounded-e-lg hover:bg-neutral-900 hover:text-neutral-100">
                                            <span className="sr-only">Next</span>
                                            <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                                            </svg>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summoner;
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DD_VERSION, LOL_VERSION } from "../version";

import GameTimer from "../components/GameTime";
import ChampionImage from "../components/ChampionImage";
import ProfileHeader from "../components/ProfileHeader";
import MatchRow from "../components/Summoner/MatchRow";

import Participant from "../interfaces/LiveGameParticipant";
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

type QueueDef = {
    key: string;
    label: string;
    modeIds: number[] | null;
};
const queueDefs: QueueDef[] = [
    { key: "all-queues", label: "All", modeIds: null },
    { key: "solo-duo", label: "Solo Duo", modeIds: [420] },
    { key: "flex", label: "Flex", modeIds: [440] },
    { key: "aram", label: "Aram", modeIds: [450] },
    { key: "normal", label: "Normal", modeIds: [400, 430, 480, 490] },
    { key: "arena", label: "Arena", modeIds: [1700, 1710] },
    { key: "urf", label: "URF", modeIds: [900, 1900] },
];
  
const patchWindows: { [key: string]: { startMs: number; endMs: number } } = {
    "all-patches": { startMs: -Infinity, endMs: Infinity },
    "15.1": { startMs: Date.parse("2025-01-09T00:00:00Z"), endMs: Date.parse("2025-01-23T00:00:00Z") },
    "15.2": { startMs: Date.parse("2025-01-23T00:00:00Z"), endMs: Date.parse("2025-02-05T00:00:00Z") },
    "15.3": { startMs: Date.parse("2025-02-05T00:00:00Z"), endMs: Date.parse("2025-02-20T00:00:00Z") },
    "15.4": { startMs: Date.parse("2025-02-20T00:00:00Z"), endMs: Date.parse("2025-03-05T00:00:00Z") },
    "15.5": { startMs: Date.parse("2025-03-05T00:00:00Z"), endMs: Date.parse("2025-03-19T00:00:00Z") },
    "15.6": { startMs: Date.parse("2025-03-19T00:00:00Z"), endMs: Date.parse("2025-04-02T00:00:00Z") },
    "15.7": { startMs: Date.parse("2025-04-02T00:00:00Z"), endMs: Date.parse("2025-04-16T00:00:00Z") },
    "15.8": { startMs: Date.parse("2025-04-16T00:00:00Z"), endMs: Date.parse("2025-04-30T00:00:00Z") },
    "15.9": { startMs: Date.parse("2025-04-30T00:00:00Z"), endMs: Date.parse("2025-05-14T00:00:00Z") }
};

const GAMES_PER_PAGE = 20;

const Summoner: React.FC = () => {
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    const location = useLocation();

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const summoner = decodeURIComponent(encodedSummoner);
    const cacheKey = `summoner_${regionCode}_${summoner}`;

    const [selectedChampionPerformanceMode, setSelectedChampionPerformanceMode] = useState<string>("soloduo");
    const [selectedRolePerformanceMode, setSelectedRolePerformanceMode] = useState<string>("soloduo");

    const [selectedRole, setSelectedRole] = useState<string>("fill");
    const [selectedPatch, setSelectedPatch] = useState<string>("all-patches");
    const [selectedQueue, setSelectedQueue] = useState<string>("all-queues");
    const [selectedChampion, setSelectedChampion] = useState<string>("All Champions");
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [showPatch, setShowPatch] = useState<boolean>(false);
    const [filterChampions, setFilterChampions] = useState('');
    const [champions, setChampions] = useState<any[]>([]);
    const [items, setItems] = useState<any>({});
    const [showSelectChampions, setShowSelectChampions] = useState<boolean>(false);
    const [paginatorPage, setPaginatorPage] = useState<number>(1);
    const inputPatchesRef = useRef<HTMLDivElement>(null);
    const dropdownPatchesRef = useRef<HTMLDivElement>(null);
    const inputChampionsRef = useRef<HTMLDivElement>(null);
    const dropdownChampionsRef = useRef<HTMLDivElement>(null);

    const getCachedData = () => {
        try {
            const cachedData = localStorage.getItem(cacheKey);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (error) {
            console.error('Error retrieving cached data:', error);
            return null;
        }
    };

    const [apiData, setApiData] = useState<Player | null>(() => {
        if (location.state?.apiData) {
            return location.state.apiData;
        }
        return getCachedData();
    });
    const [loading, setLoading] = useState(!apiData);

    const [major, minor] = LOL_VERSION.split('.').map(Number);
    const versions = Array.from({length: minor - 0}, (_, i) => `${major}.${minor - i}`);

    const filteredMatches = useMemo(() => {
        if (!apiData) return [];
        return apiData.allMatchesData.filter(match => {
            if (selectedRole !== "fill" && match.details.info.participants.find(p => p.puuid === apiData.puuid)?.teamPosition.toLowerCase() !== selectedRole) {
                return false;
            }

            const allowedQueues = queueDefs.find(q => q.key === selectedQueue)?.modeIds;
            if (allowedQueues && !allowedQueues.includes(match.details.info.queueId)) {
                return false;
            }

            const { startMs, endMs } = patchWindows[selectedPatch] || { startMs: -Infinity, endMs: Infinity };
            if (match.details.info.gameStartTimestamp < startMs || match.details.info.gameStartTimestamp >= endMs) {
                return false;
            }

            if (selectedChampion !== "All Champions" && match.details.info.participants.find(p => p.puuid === apiData.puuid)?.championName !== selectedChampion) {
                return false;
            }
            // setPaginatorPage(1)
            return true;
        })
    }, [apiData, selectedRole, selectedQueue, selectedPatch, selectedChampion])

    const { grouped: matchesByDate, pageMatches } = useMemo(() => {
        if (!filteredMatches.length) return { grouped: {}, pageMatches: [] };

        const sorted = [...filteredMatches].sort(
            (a, b) => b.details.info.gameStartTimestamp - a.details.info.gameStartTimestamp
        );

        const start = (paginatorPage - 1) * GAMES_PER_PAGE;
        const end = start + GAMES_PER_PAGE;

        const pageMatches = sorted.slice(start, end);
        
        const grouped = pageMatches.reduce<Record<string, Match[]>>((acc, match) => {
            const date = new Date(match.details.info.gameStartTimestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            (acc[date] ??= []).push(match);
            return acc;
        }, {});
        
        return { grouped, pageMatches };
    }, [filteredMatches, paginatorPage]);

    const pageStats = useMemo(() => {
        const matches = pageMatches;
        const totalGames = matches.length;
        const allWins = matches.reduce((sum, match) => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            return sum + (p?.win ? 1 : 0);
        }, 0)
        const allLosses = totalGames - allWins;
        const winrate = totalGames > 0 ? Math.round((allWins/totalGames)*100) : 0;

        const totalKills = matches.reduce((sum, match) => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            return sum + (p?.kills ?? 0);
        }, 0)
        const totalDeaths = matches.reduce((sum, match) => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            return sum + (p?.deaths ?? 0);
        }, 0)
        const totalAssists = matches.reduce((sum, match) => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            return sum + (p?.assists ?? 0);
        }, 0)
        const avgKDA = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : "Perfect";

        const totalTeamKills = matches.reduce((sum, match) => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            if (!p) return sum;
            const teamKills = match.details.info.participants.filter(t => t.teamId === p.teamId).reduce((ts, t) => ts + (t.kills || 0), 0);
            return sum + teamKills;
        }, 0)
        const avgKP = totalTeamKills > 0 ? Math.round(((totalKills + totalAssists) / totalTeamKills) * 100) : 0;

        const champMap = new Map();
        matches.forEach(match => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            if (!p) return;
            const key = p.championId;
            if (!champMap.has(key)) {
                champMap.set(key, {
                    championId: key,
                    championName: p.championName,
                    games: 0,
                    wins: 0,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                });
            }

            const e = champMap.get(key);
            e.games++;
            e.wins += p.win ? 1 : 0;
            e.kills += p.kills;
            e.deaths += p.deaths;
            e.assists += p.assists;
        });
        const top3 = Array.from(champMap.values())
        .map(e => ({
            ...e,
            winrate: (e.wins / e.games) * 100,
            averageKDA: e.deaths > 0 ? (e.kills + e.assists) / e.deaths : e.kills + e.assists,
        }))
        .sort((a, b) => b.games - a.games || b.winrate - a.winrate || b.averageKDA - a.averageKDA)
        .slice(0, 3);

        const roleCounts = roleLabels.reduce((acc, {role}) => {
            acc[role] = 0;
            return acc;
        }, {} as Record<Role, number>);
        matches.forEach(match => {
            const p = match.details.info.participants.find(p => p.puuid === apiData?.puuid);
            if (p) {
                roleCounts[p.teamPosition as Role]++;
            }
        });
        const rolePercents = roleLabels.reduce((acc, {role}) => {
            acc[role] = totalGames > 0 ? Math.round((roleCounts[role] / totalGames) * 100) : 0;
            return acc;
        }, {} as Record<Role, number>);

        return { totalGames, allWins, allLosses, winrate, avgKDA, avgKP, top3, totalKills, totalDeaths, totalAssists, rolePercents };
    }, [pageMatches, apiData?.puuid]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (inputChampionsRef.current && dropdownChampionsRef.current && !inputChampionsRef.current.contains(target) && !dropdownChampionsRef.current.contains(target)) {
                setShowSelectChampions(false);
            }

            if (inputPatchesRef.current && dropdownPatchesRef.current && !inputPatchesRef.current.contains(target) && !dropdownPatchesRef.current.contains(target)) {
                setShowPatch(false)
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
        if (apiData) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(apiData));
            } catch (error) {
                console.error('Error caching data:', error);
            }
        }
    }, [apiData, cacheKey]);

    useEffect(() => {
        const fetchData = async () => {
            if (apiData) {
                return;
            }
            
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
    }, [regionCode, summoner, apiData]);

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
    // const allMatchesData: Match[] = apiData.allMatchesData;
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
    
    const totalPages = Math.ceil(filteredMatches.length / GAMES_PER_PAGE);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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
                            {championsStatsData.length === 0 && (
                                <div className="text-center p-2">
                                    <p>No games found</p>
                                </div>
                            )}
                            <div>
                                {championsStatsData.slice(0, 5).map((championStat: ChampionStats, index: number) => {
                                    return (
                                        <div key={championStat.championId}>
                                            { index !== 0 && <hr /> }
                                            <div className="grid grid-cols-[40%_40%_20%] px-2 mb-1 mt-1 items-center text-center">
                                                <div className="flex items-center gap-1">
                                                    <ChampionImage championId={championStat.championId} isTeamIdSame={true} classes="h-15" />
                                                    <div className="flex flex-col text-md items-start">
                                                        <p>{championStat.championName === "MonkeyKing" ? "Wukong" : championStat.championName}</p>
                                                        <p className="text-sm text-neutral-200">CS {championStat.totalCS} ({championStat.totalCS/championStat.totalMin})</p>
                                                    </div>
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
                                                <div className={`flex flex-col items-end ${getWinrateColor(Math.round(championStat.winRate), championStat.games)}`}>
                                                    <p>{Math.round(championStat.winRate)}%</p> 
                                                    <p className="text-sm text-gray-200">{championStat.games} Games</p>
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
                            <div className="flex justify-around mb-2">
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
                                            <p className="mt-5 text-md text-gray-200">{mastery.championPoints}</p>
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
                                    <div className="relative w-52 h-52 rounded-full" style={{ background: `conic-gradient( #3b82f6 0deg ${pageStats.winrate * 3.6}deg, #ef4444 ${pageStats.winrate * 3.6}deg 360deg)`}}>
                                        <div className="absolute inset-0 m-auto w-40 h-40 bg-neutral-800 rounded-full flex items-center justify-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className={`text-xl font-semibold m-0 ${getWinrateColor(pageStats.winrate, pageStats.totalGames)}`}>
                                                    {pageStats.winrate}%
                                                </p>
                                                <p className="text-neutral-400 text-lg mb-2">Winrate</p>
                                                <p className="text-xl text-neutral-300 font-semibold">
                                                    {pageStats.allWins}W - {pageStats.allLosses}L
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-full justify-center gap-4">
                                    {pageStats.top3.map(champStats => (
                                        <div className="flex items-center justify-end gap-6">
                                            <ChampionImage championId={champStats.championId} teamId={200} isTeamIdSame={true} classes="h-13" />
                                            <div className="w-[140px] flex flex-col text-lg">
                                                <div className="flex gap-2">
                                                    <p className={`${getWinrateColor(champStats.winrate, champStats.games)}`}>{Math.round(champStats.winrate)}%</p>
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
                                    <p className="text-6xl text-purple-400 font-semibold mt-12 mb-5">{pageStats.avgKDA}</p>
                                    <div className="flex items-center justify-center">
                                        <p className="text-xl">{(pageStats.totalKills/GAMES_PER_PAGE).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl text-purple-300">{(pageStats.totalDeaths/GAMES_PER_PAGE).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl">{(pageStats.totalAssists/GAMES_PER_PAGE).toFixed(1)}</p>
                                    </div>
                                    <p className="text-neutral-400 mt-4">Average Kill Participation {pageStats.avgKP}%</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-lg">Preferred Roles</p>
                                    <div className="space-y-2 p-2">
                                        {roleLabels.map(({ role, }) => {
                                            const percent = pageStats.rolePercents[role];
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
                            {["fill","top","jungle","middle","bottom","utility"].map((role) => (
                                <>
                                    {role === "fill" ? (
                                        <img key="fill" 
                                            onClick={() => setSelectedRole(role)}
                                            src={fill} 
                                            alt={role} 
                                            className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === role ? "bg-neutral-800" : ""}`} 
                                        />
                                    ) : (
                                        <img key={role} 
                                            onClick={() => setSelectedRole(role)}
                                            src={`https://dpm.lol/position/${role.toUpperCase()}.svg`} 
                                            alt={role} 
                                            className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === role ? "bg-neutral-800" : ""}`} 
                                        />
                                    )}
                                </>
                            ))}
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
                                        {queueDefs.map(({ key, label }) => (
                                            <p key={key} onClick={() => setSelectedQueue(key)} className={`cursor-pointer p-2 transition-all duration-100 hover:text-neutral-300 ${selectedQueue === key ? "bg-neutral-700" : ""}`}>
                                                {label}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <div ref={inputPatchesRef} className="flex items-center justify-center p-2 text-lg font-bold">
                                            <p onClick={() => setShowPatch(prev => !prev)}>Select Patch</p>
                                            <img src={arrowDownLight} alt="arrowDownLight" onClick={() => setShowPatch(prev => !prev)} className={`h-4 transform transition-transform ${showPatch ? "rotate-180" : ""}`} />
                                        </div>
                                        <div ref={dropdownPatchesRef} className={`z-100 absolute top-full left-0 w-full bg-neutral-800 text-center transition-all duration-300 border border-purple-500 overflow-y-auto shadow-lg max-h-[300px] custom-scrollbar
                                            ${showPatch ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                                            <p key="all-patches" onClick={() => {setSelectedPatch("all-patches"); setShowPatch(false)}} className={`p-1 cursor-pointer text-lg transition-all duration-100 hover:text-neutral-300 ${selectedPatch === "all-patches" ? "bg-neutral-700" : ""}`}>
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
                                    <div ref={inputChampionsRef} onClick={() => setShowSelectChampions(true)} className="text-xl">
                                        <input type="text" placeholder="Select Champion" value={filterChampions} onChange={e => setFilterChampions(e.target.value)} className="w-full border-none outline-none bg-neutral-900 px-2 py-1" />
                                    </div>
                                    <div ref={dropdownChampionsRef} className={`z-100 absolute top-full left-0 w-full bg-neutral-800 transition-all duration-300 border border-purple-500 overflow-y-auto shadow-lg max-h-[400px]
                                         ${showSelectChampions ? "opacity-100 visible" : "opacity-0 invisible"} custom-scrollbar`}>
                                        <div onClick={() => {setSelectedChampion("All Champions"); setFilterChampions('All Champions'); setShowSelectChampions(false)}} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === "All Champions" ? "bg-neutral-700" : ""}`}>
                                            <img src={noneicon} alt="none-icon" className="h-12" />
                                            <span>All Champions</span>
                                        </div>
                                        <div>
                                            {champions.filter(champ =>champ.name.toLowerCase().startsWith(filterChampions.toLowerCase())).map((champion) => (
                                                <div key={champion.id} onClick={() => {setSelectedChampion(champion.name); setFilterChampions(champion.name); setShowSelectChampions(false);}} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === champion.name ? "bg-neutral-700" : ""} `}>
                                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${champion.id}.png`} alt={champion.name} className="h-12" />
                                                    <span>{champion.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {Object.values(matchesByDate).length > 0 && (
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
                                    {pageNumbers.length > 1 && (
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
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summoner;
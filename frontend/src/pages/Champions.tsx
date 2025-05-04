import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import ProfileHeader from "../components/ProfileHeader";
import SelectMenu from "../components/SelectMenu";
import { ChampionImage, ChampionSpellName, ChampionSpellCooldowns, ChampionSpellTooltip, ChampionSpellNotes } from "../components/ChampionData";

import Player from "../interfaces/Player";
import ChampionStats from "../interfaces/ChampionStats";

import champions from "../assets/json/championsFull.json";

import arrowDownLight from "../assets/arrow-down-light.png";
import noneIcon from "../assets/none.jpg";
import clockIcon from "../assets/clock.png"

import avgDmgDealtPerMinIcon from "../assets/dmg-dealt-per-min-icon.png"
import avgDmgTakenPerMinIcon from "../assets/dmg-taken-per-min-icon.png"
import avgGoldPerMinIcon from "../assets/gold-per-min-icon.png"
import avgCSPerMinIcon from "../assets/cs-per-min-icon.png"
import avgVSPerMinIcon from "../assets/vs-per-min-icon.png"

import grubsIcon from "../assets/monsters/icons/grubs.png";
import drakeIcon from "../assets/monsters/icons/dragon.png";
import heraldIcon from "../assets/monsters/icons/riftherald.png";
import baronIcon from "../assets/monsters/icons/baron.png";
import atakhanIcon from "../assets/monsters/icons/atakhan.png";
import turretIcon from "../assets/monsters/icons/tower.png";
import inhibitorIcon from "../assets/monsters/icons/inhibitor.png";

const gamemodeOptions = [
    { label: "All Gamemodes", value: "all-gamemodes" },
    { label: "Ranked Solo/Duo", value: "soloduo" },
    { label: "Ranked Flex", value: "flex" },
];

const Champions: React.FC = () => {
    const location = useLocation();
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const [gamemodeFilter, setGamemodeFilter] = useState<string>("all-gamemodes");
    const [openMatchupDiv, setOpenMatchupDiv] = useState<number | string | null>(null);

    const summoner = decodeURIComponent(encodedSummoner);
    const cacheKey = `summoner_${regionCode}_${summoner}`;

    const getInitialData = () => {
        if (location.state?.apiData) {
            return location.state.apiData;
        }
        
        try {
            const cachedData = localStorage.getItem(cacheKey);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (error) {
            console.error("Error retrieving cached data:", error);
            return null;
        }
    };

    const [apiData, setApiData] = useState<Player | null>(getInitialData());
    const [loading, setLoading] = useState(!apiData);

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
                
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (error) {
                    console.error("Error caching data:", error);
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [regionCode, summoner, apiData, cacheKey]);

    if (loading || !apiData) {
        return <div className="flex justify-center mt-10">Loading...</div>;
    }

    let championStats: ChampionStats[] = [];
    if (gamemodeFilter === "all-gamemodes") championStats = Object.values(apiData.allGamesChampionStatsData);
    if (gamemodeFilter === "soloduo") championStats = Object.values(apiData.rankedSoloChampionStatsData);
    if (gamemodeFilter === "flex") championStats = Object.values(apiData.rankedFlexChampionStatsData);

    const allChampionMatchups = useMemo(
        () => championStats.flatMap((stat) => stat.opponentMatchups),
        [championStats]
    );

    const groupedChampionMatchups = useMemo(() => {
        const map = allChampionMatchups.reduce((acc, m) => {
            const key = m.championId;
            if (!acc.has(key)) {
              acc.set(key, { ...m });
              return acc;
            }
            const agg = acc.get(key)!;
            agg.games += m.games;
            agg.wins += m.wins;
            agg.totalKills += m.totalKills;
            agg.totalDeaths += m.totalDeaths;
            agg.totalAssists += m.totalAssists;
            agg.totalDMGDealt += m.totalDMGDealt;
            agg.totalDMGTaken += m.totalDMGTaken;
            agg.totalGoldEarned += m.totalGoldEarned;
            agg.totalCS += m.totalCS;
            agg.totalVisionScore += m.totalVisionScore;
            agg.totalBaronKills += m.totalBaronKills;
            agg.totalDragonKills += m.totalDragonKills;
            agg.totalHeraldKills += m.totalHeraldKills;
            agg.totalGrubsKills += m.totalGrubsKills;
            agg.totalAtakhanKills += m.totalAtakhanKills;
            agg.totalTowerKills += m.totalTowerKills;
            agg.totalInhibitorKills += m.totalInhibitorKills;
            agg.totalSpell1Casts += m.totalSpell1Casts;
            agg.totalSpell2Casts += m.totalSpell2Casts;
            agg.totalSpell3Casts += m.totalSpell3Casts;
            agg.totalSpell4Casts += m.totalSpell4Casts;
            agg.totalDoubleKills += m.totalDoubleKills;
            agg.totalTripleKills += m.totalTripleKills;
            agg.totalQuadraKills += m.totalQuadraKills;
            agg.totalPentaKills += m.totalPentaKills;
            agg.totalFirstBloodKills += m.totalFirstBloodKills;
            agg.totalFirstBloodAssists += m.totalFirstBloodAssists;
            agg.totalTimeSpentDeadMin += m.totalTimeSpentDeadMin;
            agg.totalMin += m.totalMin;
            agg.totalBlueSideGames += m.totalBlueSideGames;
            agg.totalRedSideGames += m.totalRedSideGames;
            agg.totalBlueSideWins += m.totalBlueSideWins;
            agg.totalRedSideWins += m.totalRedSideWins;
            return acc;
        }, new Map<number, ChampionStats>());

        return Array.from(map.values()).map((c) => {
            const winrate = c.games > 0 ? c.wins / c.games : 0;
            const averageKDA = c.totalDeaths > 0 ? (c.totalKills + c.totalAssists) / c.totalDeaths : 0;
            const csPerMin = c.totalMin > 0 ? c.totalCS / c.totalMin : 0;
        
            return {
                ...c,
                winrate,
                averageKDA,
                csPerMin,
            };
        });
        
    }, [allChampionMatchups]);

    const allGames = groupedChampionMatchups.reduce((sum, m) => sum + m.games, 0);
    const allWins = groupedChampionMatchups.reduce((sum, m) => sum + m.wins, 0);
    const allLosses = allGames - allWins;
    const allWinrate = allGames > 0 ? Math.round(allWins / allGames * 100) : 0;

    const totalKills = groupedChampionMatchups.reduce((sum, m) => sum + m.totalKills, 0);
    const totalDeaths = groupedChampionMatchups.reduce((sum, m) => sum + m.totalDeaths, 0);
    const totalAssists = groupedChampionMatchups.reduce((sum, m) => sum + m.totalAssists, 0);
    const allKDA = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : 0;

    const totalCS = groupedChampionMatchups.reduce((sum, m) => sum + m.totalCS, 0);
    const totalMin = groupedChampionMatchups.reduce((sum, m) => sum + m.totalMin, 0);
    const avgCSperGame = allGames > 0 ? totalCS / allGames : 0;
    const avgCSperMin = totalMin > 0 ? totalCS / totalMin : 0;

    const allDoubleKills = groupedChampionMatchups.reduce((sum, m) => sum + m.totalDoubleKills, 0)
    const allTripleKills = groupedChampionMatchups.reduce((sum, m) => sum + m.totalTripleKills, 0)
    const allQuadraKills = groupedChampionMatchups.reduce((sum, m) => sum + m.totalQuadraKills, 0)
    const allPentaKills = groupedChampionMatchups.reduce((sum, m) => sum + m.totalPentaKills, 0)

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
        <div className="container m-auto">
            <ProfileHeader data={apiData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setApiData} />
            <div className="text-neutral-50 bg-neutral-800 my-2 p-2">
                <SelectMenu options={gamemodeOptions} value={gamemodeFilter} onChange={setGamemodeFilter} placeholder="All Gamemodes" classes="w-[250px] text-white" />
            </div>
            <div className="text-neutral-50 bg-neutral-800 my-2 p-2">
                <div className="grid grid-cols-[5%_15%_17%_10%_8%_8%_8%_8%_8%_8%_5%] text-center p-2">
                    <p>#</p>
                    <p>Champion</p>
                    <p>Winrate</p>
                    <p>KDA</p>
                    <p>CS (CS/min)</p>
                    <p>Double Kills</p>
                    <p>Triple Kills</p>
                    <p>Quadra Kills</p>
                    <p>Penta Kills</p>
                    <p>Time Played</p>
                    <p></p>
                </div>
                <div className="text-neutral-50 bg-neutral-800 p-2">
                    <div onClick={() => setOpenMatchupDiv(prev => prev === "-" ? null : "-")} className="grid grid-cols-[5%_15%_17%_10%_8%_8%_8%_8%_8%_8%_5%] items-center text-center my-2 transition-all hover:bg-neutral-900">
                        <p>-</p>
                        <div className="flex items-center gap-1">
                            <img src={noneIcon} alt="noneIcon" className="h-12" />
                            <p>All Champions</p>
                        </div>
                        <div className="flex justify-between">
                            <div className="relative flex w-[75%] h-6 bg-neutral-700">
                                <p className="absolute left-1">{allWins}</p>
                                <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(allWinrate))}`} style={{width: `${Math.round(allWinrate)}%` }}></div>
                                <p className="absolute right-1">{allLosses}</p>
                            </div>
                            <p className={`${getWinrateColor(allWinrate)}`}>{allWinrate}%</p>
                        </div>
                        <p className={`${getKDAColor(allKDA)}`}>{allKDA.toFixed(1)}:1</p>
                        <p>{Math.round(avgCSperGame)} ({avgCSperMin.toFixed(1)})</p>
                        <p>{allDoubleKills}</p>
                        <p>{allTripleKills}</p>
                        <p>{allQuadraKills}</p>
                        <p>{allPentaKills}</p>
                        <p>{totalMin.toFixed(1)}min</p>
                        <img src={arrowDownLight} alt="arrowDownLight" className={`h-5 transform transition-transform duration-200 ${openMatchupDiv === "-" ? "rotate-180" : "rotate-0"}`} />
                    </div>
                    <div className={`text-neutral-50 overflow-hidden transition-max-height duration-300 ease-in-out ${openMatchupDiv === "-" ? "max-h-[3000px]" : "max-h-0"}`}>
                        {groupedChampionMatchups.map(stat => (
                            <div className="grid grid-cols-[5%_17%_15%_10%_8%_8%_8%_8%_8%_8%_5%] items-center text-center p-2">
                                <p></p>
                                <div className="flex items-center gap-1">
                                    <p className="text-neutral-500 text-lg">VS</p>
                                    <ChampionImage championId={stat.championId} isTeamIdSame={true} classes="h-12" />
                                    <p>{stat.championName}</p>
                                </div>
                                <div className="flex justify-between">
                                    <div className="relative flex w-[75%] h-6 bg-neutral-700">
                                        <p className="absolute left-1">{stat.wins}W</p>
                                        <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(stat.wins / (stat.games) * 100))}`} style={{width: `${Math.round(stat.wins / (stat.games) * 100)}%` }}></div>
                                        <p className="absolute right-1">{stat.games-stat.wins}L</p>
                                    </div>
                                    <p className={`${getWinrateColor(stat.winrate)}`}>{Math.round(stat.winrate*100)/100}%</p>
                                </div>
                                <p className={`${getKDAColor(stat.averageKDA)}`}>{stat.averageKDA.toFixed(1)}:1</p>
                                <p>{Math.round(stat.totalCS/stat.games)} ({(stat.totalMin > 0 ? stat.totalCS/stat.totalMin : 0).toFixed(1)})</p>
                                <p>{stat.totalDoubleKills}</p>
                                <p>{stat.totalTripleKills}</p>
                                <p>{stat.totalQuadraKills}</p>
                                <p>{stat.totalPentaKills}</p>
                                <p>{Math.round(stat.totalMin*10)/10}min</p>
                                <p></p>
                            </div>
                        ))}
                        <hr />
                    </div>
                    {championStats.map((stat, i) => {
                        const champ = Object.values(champions).find(c => c.key.toLowerCase() === stat.championName.toLowerCase());
                        if (!champ) return <div>Champion not found</div>;
                        const { abilities,  } = champ;

                        const slots = ["Q","W","E","R"];
                        const casts = [
                            stat.totalSpell1Casts,
                            stat.totalSpell2Casts,
                            stat.totalSpell3Casts,
                            stat.totalSpell4Casts,
                        ];
                        const spells = slots.map(slot => abilities[slot]?.[0]).filter((s): s is { name: string; icon: string } => !!s);

                        return (
                            <div key={`${stat.championId}-${i+1}`} className="text-neutral-50">
                                <div onClick={() => setOpenMatchupDiv(prev => prev === i ? null : i)} className="grid grid-cols-[5%_15%_17%_10%_8%_8%_8%_8%_8%_8%_5%] items-center text-center my-1 transition-all hover:bg-neutral-900">
                                    <p>{i+1}</p>
                                    <div className="flex items-center gap-1">
                                        <ChampionImage championId={stat.championId} isTeamIdSame={true} classes="h-12" />
                                        <p>{stat.championName}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="relative flex w-[75%] h-6 bg-neutral-700">
                                            <p className="absolute left-1">{stat.wins}W</p>
                                            <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(stat.wins / (stat.games) * 100))}`} style={{width: `${Math.round(stat.wins / (stat.games) * 100)}%` }}></div>
                                            <p className="absolute right-1">{stat.games-stat.wins}L</p>
                                        </div>
                                        <p className={`${getWinrateColor(stat.winrate)}`}>{Math.round(stat.winrate*100)/100}%</p>
                                    </div>
                                    <p className={`${getKDAColor(stat.averageKDA)}`}>{stat.averageKDA.toFixed(1)}:1</p>
                                    <p>{Math.round(stat.totalCS/stat.games)} ({(stat.totalMin > 0 ? stat.totalCS/stat.totalMin : 0).toFixed(1)})</p>
                                    <p>{stat.totalDoubleKills}</p>
                                    <p>{stat.totalTripleKills}</p>
                                    <p>{stat.totalQuadraKills}</p>
                                    <p>{stat.totalPentaKills}</p>
                                    <p>{Math.round(stat.totalMin*10)/10}min</p>
                                    <img src={arrowDownLight} alt="arrowDownLight" className={`h-5 transform transition-transform duration-200 ${openMatchupDiv === i ? "rotate-180" : "rotate-0"}`} />
                                </div>
                                <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${openMatchupDiv === i ? "max-h-[1000px]" : "max-h-0"}`}>
                                    <div className="h-auto flex justify-evenly pb-6">
                                        <div className="flex flex-col flex-1/3 gap-10">
                                            <div className="flex flex-col gap-3">
                                                <h1 className="text-xl font-semibold text-center my-6">Average ability cast</h1>
                                                <div className="flex justify-evenly">
                                                    {spells.map((spell, i) => (
                                                        <div key={spell.name} className="flex flex-col items-center">
                                                            <Tippy
                                                                content={
                                                                    <div>
                                                                        <ChampionSpellName spell={spell} classes="text-md font-bold text-purple-500" />
                                                                        <ChampionSpellCooldowns spell={spell} classes="text-sm text-neutral-400" />
                                                                        <ChampionSpellTooltip spell={spell} classes="text-sm" />
                                                                        <div className="mt-2">
                                                                            <Tippy
                                                                                content={<ChampionSpellNotes spell={spell} classes="text-sm" />}
                                                                                interactive={true}
                                                                                placement="right"
                                                                                appendTo="parent"
                                                                                maxWidth={500}
                                                                            >
                                                                                <div className="w-fit ml-auto text-lg underline cursor-pointer text-neutral-400">
                                                                                    <p>Notes</p>
                                                                                </div>
                                                                            </Tippy>
                                                                        </div>
                                                                    </div>
                                                                }
                                                                allowHTML={true}
                                                                interactive={true}
                                                                placement="top"
                                                                maxWidth={600}
                                                            >
                                                                <div className="relative">
                                                                    <img src={spell.icon} alt={spell.name} className="h-14" />
                                                                    <p className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 bg-black px-1 text-lg rounded-full text-white">
                                                                        {slots[i]}
                                                                    </p>
                                                                </div>
                                                            </Tippy>
                                                            <div className="text-center mt-4">
                                                                <p className="font-bold">{Math.round(casts[i]/stat.games*10)/10}</p>
                                                                <p className="text-neutral-400">times</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-evenly">
                                                <div className="flex flex-col">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto rotate-90 w-[52px] h-[52px] text-blue-400">
                                                        <path opacity="0.2" d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z" />
                                                        <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z" />
                                                        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z" />
                                                    </svg>
                                                    <div className="flex justify-center gap-1 items-baseline">
                                                        <p className="text-xl">{Math.round(stat.totalBlueSideWins/stat.totalBlueSideGames*100*100)/100}</p>
                                                        <p className="text-neutral-400">%</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto -rotate-90 w-[52px] h-[52px] text-red-600">
                                                        <path opacity="0.2" d="M17.7929 3C18.2383 3 18.4614 3.53857 18.1464 3.85355L15.1464 6.85355C15.0527 6.94732 14.9255 7 14.7929 7H7.5C7.22386 7 7 7.22386 7 7.5V14.7929C7 14.9255 6.94732 15.0527 6.85355 15.1464L3.85355 18.1464C3.53857 18.4614 3 18.2383 3 17.7929V3.5C3 3.22386 3.22386 3 3.5 3H17.7929Z" />
                                                        <path d="M6.20711 21C5.76165 21 5.53857 20.4614 5.85355 20.1464L8.85355 17.1464C8.94732 17.0527 9.0745 17 9.20711 17H16.5C16.7761 17 17 16.7761 17 16.5V9.20711C17 9.0745 17.0527 8.94732 17.1464 8.85355L20.1464 5.85355C20.4614 5.53857 21 5.76165 21 6.20711L21 20.5C21 20.7761 20.7761 21 20.5 21L6.20711 21Z" />
                                                        <path opacity="0.2" d="M10 10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V13.5C14 13.7761 13.7761 14 13.5 14H10.5C10.2239 14 10 13.7761 10 13.5V10.5Z" />
                                                    </svg>
                                                    <div className="flex justify-center gap-1 items-baseline">
                                                        <p className="text-xl">{Math.round(stat.totalRedSideWins/stat.totalRedSideGames*100*100)/100}</p>
                                                        <p className="text-neutral-400">%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1/3 gap-7">
                                            <h1 className="text-xl font-semibold text-center mt-6">Global stats</h1>
                                            <div className="w-[60%] mx-auto">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <img src={avgDmgDealtPerMinIcon} alt="avgDmgDealtPerMinIcon" className="h-9" />
                                                        <p className="text-lg">{(stat.totalMin > 0 ? stat.totalDMGDealt/stat.totalMin : 0).toFixed(1)}</p>
                                                    </div>
                                                    <p className="text-neutral-400">Damage Dealt per Minute</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <img src={avgDmgTakenPerMinIcon} alt="avgDmgTakenPerMinIcon" className="h-9" />
                                                        <p className="text-lg">{(stat.totalMin > 0 ? stat.totalDMGTaken/stat.totalMin : 0).toFixed(1)}</p>
                                                    </div>
                                                    <p className="text-neutral-400">Damage Taken per Minute</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <img src={avgGoldPerMinIcon} alt="avgGoldPerMinIcon" className="h-9" />
                                                        <p className="text-lg">{(stat.totalMin > 0 ? stat.totalGoldEarned/stat.totalMin : 0).toFixed(1)}</p>
                                                    </div>
                                                    <p className="text-neutral-400">Gold Earned per Minute</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <img src={avgCSPerMinIcon} alt="avgCSPerMinIcon" className="h-9" />
                                                        <p className="text-lg">{(stat.totalMin > 0 ? stat.totalCS/stat.totalMin : 0).toFixed(1)}</p>
                                                    </div>
                                                    <p className="text-neutral-400">CS per Minute</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <img src={avgVSPerMinIcon} alt="avgVSPerMinIcon" className="h-9" />
                                                        <p className="text-lg">{(stat.totalMin > 0 ? stat.totalVisionScore/stat.totalMin : 0).toFixed(1)}</p>
                                                    </div>
                                                    <p className="text-neutral-400">Vision Score per Minute</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-around">
                                                <div>
                                                    <div className="flex justify-center gap-2 items-baseline">
                                                        <p className="text-xl">{stat.totalFirstBloodKills}</p>
                                                        <p className="text-neutral-400">/ {stat.games}</p>
                                                    </div>
                                                    <p className="text-neutral-400">First blood kills</p>
                                                </div>
                                                <div>
                                                    <div className="flex justify-center gap-2 items-baseline">
                                                        <p className="text-xl">{stat.totalFirstBloodAssists}</p>
                                                        <p className="text-neutral-400">/ {stat.games}</p>
                                                    </div>
                                                    <p className="text-neutral-400">First blood assists</p>
                                                </div>
                                                <div>
                                                    <div className="flex justify-center gap-1 items-baseline">
                                                        <p className="text-xl">{Math.round(stat.totalTimeSpentDeadMin/stat.totalMin*100*100)/100}</p>
                                                        <p className="text-neutral-400">%</p>
                                                    </div>
                                                    <p className="text-neutral-400">Time Spent Dead</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1/3">
                                            <div>
                                                <h1 className="text-xl font-semibold text-center my-6">Objectives</h1>
                                                <div className="w-full flex justify-center flex-wrap">
                                                    <div className="w-[25%] text-center">
                                                        <img src={baronIcon} alt="baronIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalBaronKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Baron Nashors</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={drakeIcon} alt="drakeIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalDragonKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Drakes</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={heraldIcon} alt="heraldIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalHeraldKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Rift Heralds</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={grubsIcon} alt="grubsIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalGrubsKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Voidgrubs</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={atakhanIcon} alt="atakhanIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalAtakhanKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Atakhan</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={turretIcon} alt="turretIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalTowerKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Turrets</p>
                                                    </div>
                                                    <div className="w-[25%] text-center">
                                                        <img src={inhibitorIcon} alt="inhibitorIcon" className="h-8 mx-auto" />
                                                        <p className="text-lg">{Math.round(stat.totalInhibitorKills/stat.games*100)/100}</p>
                                                        <p className="text-neutral-400">Inhibitors</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-semibold text-center my-6">Time Played</h1>
                                                <div className="flex justify-center gap-7 items-center">
                                                    <img src={clockIcon} alt="clockIcon" className="h-8" />
                                                    <div>
                                                        <p>{Math.round(stat.totalMin / 60)}h {Math.round(stat.totalMin % 60)}min</p>
                                                        <p className="text-neutral-400">Total time</p>
                                                    </div>
                                                    <div>
                                                        <p>{Math.round(stat.totalMin/stat.games*10)/10}min</p>
                                                        <p className="text-neutral-400">Avg time</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[5%_17%_15%_10%_8%_8%_8%_8%_8%_8%_5%] text-center p-2">
                                        <p></p>
                                        <p>Champion</p>
                                        <p>Winrate</p>
                                        <p>KDA</p>
                                        <p>CS (CS/min)</p>
                                        <p>Double Kills</p>
                                        <p>Triple Kills</p>
                                        <p>Quadra Kills</p>
                                        <p>Penta Kills</p>
                                        <p>Time Played</p>
                                        <p></p>
                                    </div>
                                    {stat.opponentMatchups.map((oppStat) => (
                                        <div className="grid grid-cols-[5%_17%_15%_10%_8%_8%_8%_8%_8%_8%_5%] items-center text-center my-2">
                                            <p></p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-neutral-500 text-lg">VS</p>
                                                <ChampionImage championId={oppStat.championId} isTeamIdSame={true} classes="h-12" />
                                                <p>{oppStat.championName}</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="relative flex w-[75%] h-6 bg-neutral-700">
                                                    <p className="absolute left-1">{oppStat.wins}W</p>
                                                    <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(oppStat.wins / (oppStat.games) * 100))}`} style={{width: `${Math.round(oppStat.wins / (oppStat.games) * 100)}%` }}></div>
                                                    <p className="absolute right-1">{oppStat.games-oppStat.wins}L</p>
                                                </div>
                                                <p className={`${getWinrateColor(oppStat.winrate)}`}>{Math.round(oppStat.winrate*100)/100}%</p>
                                            </div>
                                            <p className={`${getKDAColor(oppStat.averageKDA)}`}>{oppStat.averageKDA.toFixed(1)}:1</p>
                                            <p>{Math.round(oppStat.totalCS/oppStat.games)} ({(oppStat.totalCS/oppStat.totalMin).toFixed(1)})</p>
                                            <p>{oppStat.totalDoubleKills}</p>
                                            <p>{oppStat.totalTripleKills}</p>
                                            <p>{oppStat.totalQuadraKills}</p>
                                            <p>{oppStat.totalPentaKills}</p>
                                            <p>{oppStat.totalMin}min</p>
                                        </div>
                                    ))}
                                    <hr />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Champions;
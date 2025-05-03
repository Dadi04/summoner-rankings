import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

import ProfileHeader from "../components/ProfileHeader";
import SelectMenu from "../components/SelectMenu";
import { ChampionImage } from "../components/ChampionData";

import Player from "../interfaces/Player";
import ChampionStats from "../interfaces/ChampionStats";

import arrowDownLight from "../assets/arrow-down-light.png";
import noneIcon from "../assets/none.jpg";

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
                <div className="grid grid-cols-[10%_40%_15%_15%_15%_5%] text-center p-2">
                    <p>#</p>
                    <p>Champion</p>
                    <p>Winrate</p>
                    <p>KDA</p>
                    <p>CS</p>
                    <p></p>
                </div>
                <div className="text-neutral-50 bg-neutral-800 p-2">
                    <div onClick={() => setOpenMatchupDiv(prev => prev === '-' ? null : '-')} className="grid grid-cols-[10%_40%_15%_15%_15%_5%] items-center text-center my-2">
                        <p>-</p>
                        <div className="flex items-center gap-1">
                            <img src={noneIcon} alt="noneIcon" className="h-12" />
                            <p>All Champions</p>
                        </div>
                        <div>
                            <div className="relative flex w-full h-6 bg-neutral-700">
                                <p className="absolute left-1">allW</p>
                                {/* <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(allWins / allGames * 100))}`} style={{width: `${Math.round(allWins / allGames * 100)}%` }}></div> */}
                                <p className="absolute right-1">allL</p>
                            </div>
                            {/* <p className={`${getWinrateColor(avgAllWinrate)}`}>{angAllWinrate}</p> */}
                        </div>
                        {/* <p className={`${getKDAColor(stat.averageKDA)}`}>{stat.averageKDA.toFixed(1)}:1</p>
                        <p>{Math.round(stat.totalCS/stat.games)} ({(stat.totalCS/stat.totalMin).toFixed(1)})</p> */}
                        <p></p>
                        <p></p>
                        <img src={arrowDownLight} alt="arrowDownLight" className={`h-5 transform transition-transform duration-200 ${openMatchupDiv === '-' ? "rotate-180" : "rotate-0"}`} />
                    </div>
                    {championStats.map((stat, i) => (
                        <div key={`${stat.championId}-${i+1}`}>
                            <div onClick={() => setOpenMatchupDiv(prev => prev === i ? null : i)} className="grid grid-cols-[10%_40%_15%_15%_15%_5%] items-center text-center my-1">
                                <p>{i+1}</p>
                                <div className="flex items-center gap-1">
                                    <ChampionImage championId={stat.championId} isTeamIdSame={true} classes="h-12" />
                                    <p>{stat.championName}</p>
                                </div>
                                <div>
                                    <div className="relative flex w-full h-6 bg-neutral-700">
                                        <p className="absolute left-1">{stat.wins}W</p>
                                        <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(stat.wins / (stat.games) * 100))}`} style={{width: `${Math.round(stat.wins / (stat.games) * 100)}%` }}></div>
                                        <p className="absolute right-1">{stat.games-stat.wins}L</p>
                                    </div>
                                    <p className={`${getWinrateColor(stat.winrate)}`}>{stat.winrate}</p>
                                </div>
                                <p className={`${getKDAColor(stat.averageKDA)}`}>{stat.averageKDA.toFixed(1)}:1</p>
                                <p>{Math.round(stat.totalCS/stat.games)} ({(stat.totalCS/stat.totalMin).toFixed(1)})</p>
                                <img src={arrowDownLight} alt="arrowDownLight" className={`h-5 transform transition-transform duration-200 ${openMatchupDiv === i ? "rotate-180" : "rotate-0"}`} />
                            </div>
                            <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${openMatchupDiv === i ? 'max-h-[1000px]' : 'max-h-0'}`}>
                                {stat.opponentMatchups.map((oppStat) => (
                                    <div className="grid grid-cols-[10%_40%_15%_15%_15%_5%] items-center text-center my-2">
                                        <p></p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-neutral-500 text-lg">VS</p>
                                            <ChampionImage championId={oppStat.championId} isTeamIdSame={true} classes="h-12" />
                                            <p>{oppStat.championName}</p>
                                        </div>
                                        <div>
                                            <div className="relative flex w-full h-6 bg-neutral-700">
                                                <p className="absolute left-1">{oppStat.wins}W</p>
                                                <div className={`h-full flex justify-between ${getWinrateBackgroundColor(Math.round(oppStat.wins / (oppStat.games) * 100))}`} style={{width: `${Math.round(oppStat.wins / (oppStat.games) * 100)}%` }}></div>
                                                <p className="absolute right-1">{oppStat.games-oppStat.wins}L</p>
                                            </div>
                                            <p className={`${getWinrateColor(oppStat.winrate)}`}>{oppStat.winrate}</p>
                                        </div>
                                        <p className={`${getKDAColor(oppStat.averageKDA)}`}>{oppStat.averageKDA.toFixed(1)}:1</p>
                                        <p>{Math.round(oppStat.totalCS/oppStat.games)} ({(oppStat.totalCS/oppStat.totalMin).toFixed(1)})</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Champions;
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DD_VERSION } from '../version';

import UpdateButton from "../components/UpdateButton";
import GameTimer from "../components/GameTime";
import ChampionImage from '../components/ChampionImage';

import Participant from '../interfaces/Participant';
import Entry from '../interfaces/Entry';
import ChampionStats from '../interfaces/ChampionStats';
import PreferredRole from '../interfaces/PreferredRole';
import Mastery from '../interfaces/Mastery';

import queueJson from "../assets/json/queues.json";

import favorite from "../assets/favorite.svg";
import performance from "../assets/performance.png";
import goldmedal from "../assets/gold-medal.png"
import silvermedal from "../assets/silver-medal.png"
import bronzemedal from "../assets/bronze-medal.png"
import medallight from "../assets/medal-light.png";
import topthreelight from "../assets/topthree-light.png"
import loadingAnimation from "../assets/animations/loading.lottie";

interface ApiData {
    summonerName: string;
    summonerTag: string;
    region: string;
    puuid: string;
    playerData: string;
    summonerData: string;
    entriesData: string;
    topMasteriesData: string;
    matchesData: string;
    rankedMatchesData: string;
    challengesData: string;
    spectatorData: string;
    clashData: string;
    championStatsData: string;
    preferredRoleData: string;
}

const Summoner: React.FC = () => {
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const summoner = decodeURIComponent(encodedSummoner);

    const [apiData, setApiData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState(true);

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
                console.log('Error fetching API data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [regionCode, summoner]);

    if (loading || !apiData) {
        return <div className="w-full flex justify-center mt-[125px]"><DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay /></div>
    }

    const summonerData = JSON.parse(apiData.summonerData);
    const entriesData = JSON.parse(apiData.entriesData);
    const topMasteriesData = JSON.parse(apiData.topMasteriesData);
    const matchesData = JSON.parse(apiData.matchesData);
    const rankedMatchesData = JSON.parse(apiData.rankedMatchesData);
    const challengesData = JSON.parse(apiData.challengesData);
    const spectatorData = JSON.parse(apiData.spectatorData);
    const clashData = JSON.parse(apiData.clashData);
    const championStatsSoloDuoData = JSON.parse(apiData.championStatsData);
    championStatsSoloDuoData.sort((a: ChampionStats, b: ChampionStats) => b.Games - a.Games || b.WinRate - a.WinRate);
    // championStatsFlexData need to add
    const preferredRoleData = JSON.parse(apiData.preferredRoleData);

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

    function getWinrateColor(winrate: number) {
        if (winrate == -1) return "";
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
            <div className="w-full bg-neutral-800 mt-1">
                <div className="flex border-b-1 pt-5 pb-5 pl-5">
                    <div className="relative p-3">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                    </div>
                    <div className="pt-3 pb-3">
                        <div className="flex">
                            <h1 className="text-white font-bold text-3xl mr-2">{apiData.summonerName}</h1>
                            <h1 className="text-neutral-400 text-3xl mr-2">#{apiData.summonerTag}</h1>
                            <button type="button" className="bg-neutral-200 pl-1.5 pr-1.5 rounded-lg">
                                <img src={favorite} alt="favorite" className="h-6 border-2 border-neutral-700 rounded" />
                            </button>
                        </div>
                        <div className="flex text-sm text-neutral-100">
                            <div className="pt-2 pb-2 pl-1">
                                <p className="uppercase border-r-1 pr-2">{apiData.region}</p>
                            </div>
                            <p className="p-2">Ladder Rank num </p>
                        </div>
                        <div>
                            <UpdateButton regionCode={regionCode} encodedSummoner={encodedSummoner} api={`/api/lol/profile/${regionCode}/${encodedSummoner}/update`} buttonText={"Update"} setData={setApiData} />
                        </div>
                    </div>  
                </div>
                <div className="p-2">
                    <ul className="flex gap-10 p-2">
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: apiData}} className="cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100">Summary</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Champions</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Mastery</Link></li>
                        {spectatorData ? (
                            <li>
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">
                                    Live Game
                                    <span className="animate-pulse text-purple-500 ml-1.5">●</span>
                                </Link>
                            </li>
                        ) : (
                            <li>
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">
                                    Live Game
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
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
                                            <img src={medallight} alt="medal-light" className="h-5" />
                                            <h1>Ranked Solo/Duo</h1>
                                        </div>
                                        <div>
                                            <select name="" id="" className="bg-neutral-800">
                                                <option value="" selected>Last 7 days</option>
                                                <option value="">Last 30 days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        {/* copyright issues */}
                                        <img src={`https://dpm.lol/rank/${rankedSoloDuoEntry.tier}.webp`} alt={rankedSoloDuoEntry.tier.toLowerCase()} className="h-25" />
                                        <div className="flex flex-col gap-1 text-center">
                                            <p className="font-bold text-lg">{rankedSoloDuoEntry.tier} {rankedSoloDuoEntry.rank} {rankedSoloDuoEntry.LeaguePoints} LP</p>
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
                                        <img src={medallight} alt="medal-light" className="h-5" />
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
                                            <img src={medallight} alt="medal-light" className="h-5" />
                                            <h1>Ranked Flex</h1>
                                        </div>
                                        <div>
                                            <select name="" id="" className="bg-neutral-800">
                                                <option value="" selected>Last 7 days</option>
                                                <option value="">Last 30 days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        {/* copyright issues */}
                                        <img src={`https://dpm.lol/rank/${rankedSoloDuoEntry.tier}.webp`} alt={rankedFlexEntry.tier.toLowerCase()} className="h-25" />
                                        <div className="flex flex-col gap-1 text-center">
                                            <p className="font-bold">{rankedFlexEntry.tier} {rankedFlexEntry.rank} {rankedFlexEntry.LeaguePoints} LP</p>
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
                                        <img src={medallight} alt="medal-light" className="h-5" />
                                        <h1>Ranked Flex</h1>
                                    </div>
                                    <p>Unranked</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-neutral-800">
                            <div className="flex justify-between p-2">
                                <div className="flex items-center gap-1">
                                    <img src={performance} alt="performance" className="h-7" />
                                    <h1>Champion Performance</h1>
                                </div>
                                <div>
                                    <select name="" id="" className="bg-neutral-800">
                                        <option value="" selected>Ranked Solo/Duo</option>
                                        <option value="">Ranked Flex</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-[28%_26%_26%_20%] mb-1 pr-5">
                                <p></p>
                                <h1 className="text-center">KDA</h1>
                                <h1 className="text-center">Games</h1>
                                <h1 className="text-center">Winrate</h1>
                            </div>
                            <div>
                                {championStatsSoloDuoData.slice(0, 5).map((championStat: ChampionStats, i: number) => (
                                    <React.Fragment key={championStat.ChampionId}>
                                        { i !== 0 && <hr /> }
                                        <div className="grid grid-cols-[28%_26%_26%_20%] pr-5 mb-1 mt-1 items-center text-center">
                                            <div className="flex justify-center">
                                                <ChampionImage championId={championStat.ChampionId} isTeamIdSame={true} classes="h-15" />
                                            </div>
                                            <div>
                                                <p className={`${getKDAColor(Math.round(championStat.AverageKDA*100)/100)}`}>
                                                    {Math.round(championStat.AverageKDA*100)/100}:1
                                                </p>
                                                <p>
                                                    {Math.round(championStat.TotalKills/championStat.Games*10)/10}/
                                                    {Math.round(championStat.TotalDeaths/championStat.Games*10)/10}/
                                                    {Math.round(championStat.TotalAssists/championStat.Games*10)/10}
                                                </p>
                                            </div>
                                            <div>
                                                {championStat.Games}
                                            </div>
                                            <div className={`${getWinrateColor(Math.round(championStat.WinRate))}`}>
                                                {Math.round(championStat.WinRate)}%
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition duration-150 ease-in hover:bg-neutral-600">
                                    See More Champions
                                </Link>
                            </div>
                        </div>
                        <div className="bg-neutral-800 pb-2">
                            <div className="flex justify-between mb-1 p-2">
                                <div className="flex items-center gap-1">
                                    <img src={performance} alt="performance" className="h-7" />
                                    <h1>Role Performance</h1>
                                </div>
                                <div>
                                    <select name="" id="" className="bg-neutral-800">
                                        <option value="" selected>Ranked Solo/Duo</option>
                                        <option value="">Ranked Flex</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 text-center">
                                <p></p>
                                <p>Role</p>
                                <p>Games</p>
                                <p>Winrate</p>
                                <p></p>
                            </div>
                            <div>
                                {preferredRoleData.sort((a: PreferredRole, b: PreferredRole) => b.Games - a.Games).map((role: PreferredRole) => (
                                    <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 items-center text-center">
                                        <div className="flex justify-end">
                                            <img src={`https://dpm.lol/position/${role.RoleName}.svg`} alt={role.RoleName} className="h-[35px]" />
                                        </div>
                                        <div>
                                            <p>{role.RoleName}</p>
                                        </div>
                                        <div>
                                            <p>{role.Games}</p>
                                        </div>
                                        <div>
                                            <p className={getWinrateColor(Math.round(role.WinRate))}>{Math.round(role.WinRate)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-neutral-800">
                            <div className="flex gap-2 p-2">
                                <img src={topthreelight} alt="top-three-light" className="h-7" />
                                <h1>Top 3 Highest Masteries</h1>
                            </div>
                            <div className="flex justify-around mb-7">
                                {[topMasteriesData[1], topMasteriesData[0], topMasteriesData[2]].map((mastery: Mastery, index: number) => {
                                    let medalSrc, medalAlt;
                                    if (index === 0) {
                                        medalSrc = silvermedal;
                                        medalAlt = "silver-medal";
                                    } else if (index === 1) {
                                        medalSrc = goldmedal;
                                        medalAlt = "gold-medal";
                                    } else {
                                        medalSrc = bronzemedal;
                                        medalAlt = "bronze-medal";
                                    }
                                    return (
                                        <div key={mastery.championId} className="flex flex-col items-center">
                                            <div className="relative mb-2">
                                                <img src={`https://opgg-static.akamaized.net/images/champion_mastery/renew_v2/mastery-${mastery.championLevel > 10 ? 10 : mastery.championLevel}.png`} alt={`${mastery.championLevel}`} className="h-15" />
                                                {mastery.championLevel > 10 && (
                                                    <p className="text-sm bg-neutral-900 pl-2 pr-2 absolute transform bottom-0 left-1/2 -translate-x-1/2">{mastery.championLevel}</p>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <img src={medalSrc} alt={medalAlt} className="h-8 absolute transform bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2" />
                                                <ChampionImage championId={mastery.championId} isTeamIdSame={true} classes="h-15" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition duration-150 ease-in hover:bg-neutral-600">
                                See More Masteries
                            </Link>
                        </div>
                    </div>
                    <div className="w-[75%] bg-neutral-800 text-center">
                        <h1>Last 30 Solo Duo Games Pefrormance TODO</h1>
                    </div>
                </div>
                <div className="bg-neutral-800 mt-2">
                    <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                    <pre>{JSON.stringify(entriesData, null, 2)}</pre>
                    <pre>{JSON.stringify(championStatsSoloDuoData, null, 2)}</pre>
                    <pre>{JSON.stringify(preferredRoleData, null, 2)}</pre>
                    <pre>{JSON.stringify(topMasteriesData, null, 2)}</pre>
                    <pre>{JSON.stringify(matchesData, null, 2)}</pre>
                    <pre>{JSON.stringify(rankedMatchesData, null, 2)}</pre>
                    <pre>{JSON.stringify(spectatorData, null, 2)}</pre>
                    <pre>{JSON.stringify(clashData, null, 2)}</pre>
                    <pre>{JSON.stringify(challengesData, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default Summoner;
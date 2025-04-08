import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DD_VERSION } from '../version';

import UpdateButton from "../components/UpdateButton";
import GameTimer from "../components/GameTime";
import ChampionImage from '../components/ChampionImage';

import Participant from '../interfaces/Participant';
import Entry from '../interfaces/Entry';

import queueJson from "../assets/json/queues.json";

import favorite from "../assets/favorite.svg";
import medallight from "../assets/medal-light.png"
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
    const championStatsData = JSON.parse(apiData.championStatsData);
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
                                                <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${participant.profileIconId}.png`} alt={`${participant.profileIconId}`} className="h-20 rounded-xl border-2 border-blue-600" />
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
                                                <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${participant.profileIconId}.png`} alt={`${participant.profileIconId}`} className="h-20 rounded-xl border-2 border-red-600" />
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
                    <div className="w-[30%] flex flex-col gap-2">
                        <div className="bg-neutral-800">
                            
                            {rankedSoloDuoEntry ? (
                                <>
                                    <div className="flex items-center gap-1 p-2">
                                        <img src={medallight} alt="medal-light" className="h-5" />
                                        <h1>Ranked Solo/Duo</h1>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        {/* copyright issues */}
                                        <img src={`https://dpm.lol/rank/${rankedSoloDuoEntry.tier}.webp`} alt={rankedSoloDuoEntry.tier.toLowerCase()} className="h-25" />
                                        <div className="flex flex-col gap-1 text-center">
                                            <p className="font-bold">{rankedSoloDuoEntry.tier} {rankedSoloDuoEntry.rank} {rankedSoloDuoEntry.LeaguePoints} LP</p>
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
                                    <div className="flex items-center gap-1 p-2">
                                        <img src={medallight} alt="medal-light" className="h-5" />
                                        <h1>Ranked Flex</h1>
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
                    </div>
                    <div className="w-[70%] bg-neutral-800 text-center">
                        <h1>Last 30 Solo Duo Games Pefrormance TODO</h1>
                    </div>
                </div>
                <div className="bg-neutral-800 mt-2">
                    <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                    <pre>{JSON.stringify(entriesData, null, 2)}</pre>
                    <pre>{JSON.stringify(championStatsData, null, 2)}</pre>
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
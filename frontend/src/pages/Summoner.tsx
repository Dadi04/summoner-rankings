import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DD_VERSION, LOL_VERSION } from '../version';

import GameTimer from "../components/GameTime";
import ChampionImage from '../components/ChampionImage';
import SummonerSpellImage from "../components/SummonerSpellImage";
import RuneImage from '../components/RuneImage';
import SummonerProfileHeader from '../components/SummonerProfileHeader';

import Participant from '../interfaces/Participant';
import Entry from '../interfaces/Entry';
import ChampionStats from '../interfaces/ChampionStats';
import PreferredRole from '../interfaces/PreferredRole';
import Mastery from '../interfaces/Mastery';
import Player from '../interfaces/Player';
import Match from '../interfaces/Match';
import MatchInfo from '../interfaces/MatchInfo';

import queueJson from "../assets/json/queues.json";

import performance from "../assets/performance.png";
import goldmedal from "../assets/gold-medal.png";
import silvermedal from "../assets/silver-medal.png";
import bronzemedal from "../assets/bronze-medal.png";
import medallight from "../assets/medal-light.png";
import topthreelight from "../assets/topthree-light.png";
import filterlight from "../assets/filter-light.png";
import fill from "../assets/fill.png";
import loadingAnimation from "../assets/animations/loading.lottie";
import arrowdownlight from "../assets/arrow-down-light.png";
import noneicon from "../assets/none.jpg";

const ItemImage: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    if (itemId === 0) {
        return (
            <div className="h-8 w-8 bg-blue-400"></div>
        );
    }

    return (
        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`} alt={`${itemId}`} className={classes} />
    );
}

const MatchRow: React.FC<{info: MatchInfo; puuid: string;}> = ({info, puuid}) => {
    const participant = info.participants.find((p) => p.puuid === puuid);
    if (!participant) return <div>Player not found</div>
    const divColor = participant.win ? "bg-blue-500" : "bg-red-500";

    const queueId = info.queueId;
    const queueData = queueJson.find((item) => item.queueId === queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";

    const teamParticipants = info.participants.filter((p) => p.teamId === participant.teamId);
    const totalKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
    let killParticipation;
    if (totalKills === 0) {
        killParticipation = 100;
    } else {
        killParticipation = Math.round(((participant.kills + participant.assists) / totalKills) * 100);
    }

    return (
        <div className={`w-full grid grid-cols-[20%_35%_20%_20%_5%] items-center ${divColor}`}>
            <div className="p-2">
                <p>{gamemode}</p>
                <p>{map}</p>
                {/* fix da budu sati -> dani -> nedelje */}
                <p>{Math.round((Date.now() - info.gameEndTimestamp)/60000)} minutes ago</p>
                <div className="flex gap-2">
                    <p>{participant.win ? "Victory" : "Defeat"}</p>
                    <p>{Math.round(info.gameDuration/60)}m {Math.round(info.gameDuration%60)}s</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-2">
                <div className="flex gap-2">
                    <div className="relative">
                        <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-15" />
                        <p className="absolute right-0 bottom-0 bg-black px-0.5">{participant.champLevel}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <SummonerSpellImage spellId={participant.summoner1Id} classes="h-7" />
                        <SummonerSpellImage spellId={participant.summoner2Id} classes="h-7" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-7" />
                        <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-7" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div>
                            <p>{participant.kills} / {participant.deaths} / {participant.assists}</p>
                            {participant.deaths === 0 ? (
                                <p>Perfect</p>
                            ) : (
                                <p>{((participant.kills + participant.assists) / participant.deaths).toFixed(2)}:1 KDA</p>
                            )}
                        </div>
                        <div>
                            <p>CS {participant.totalMinionsKilled + participant.neutralMinionsKilled} ({((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)})</p>
                            <p>KP {killParticipation}%</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ItemImage itemId={participant.item0} classes="h-8" />
                    <ItemImage itemId={participant.item1} classes="h-8" />
                    <ItemImage itemId={participant.item2} classes="h-8" />
                    <ItemImage itemId={participant.item3} classes="h-8" />
                    <ItemImage itemId={participant.item4} classes="h-8" />
                    <ItemImage itemId={participant.item5} classes="h-8" />
                    <ItemImage itemId={participant.item6} classes="h-8" />
                </div>
            </div>
            <div className="flex flex-col gap-1 text-sm p-2">
                {info.participants.filter((participant) => participant.teamId === 100).map(participant => (
                    <div key={participant.puuid} className="flex gap-1 items-center">
                        <ChampionImage championId={participant.championId} teamId={100} isTeamIdSame={true} classes="h-8" />
                        <p className={`${participant.puuid === puuid ? "text-purple-500" : ""}`}>
                            {participant.riotIdGameName}#{participant.riotIdTagline}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-1 text-sm p-2">
                {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                    <div key={participant.puuid} className="flex gap-1 items-center">
                        <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-8" />
                        <p className={`${participant.puuid === puuid ? "text-purple-500" : ""}`}>
                            {participant.riotIdGameName}#{participant.riotIdTagline}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex items-end justify-end">
                <img src={arrowdownlight} alt="arrow-down-light" className='h-10' />
            </div>
        </div>
    );
};

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
    const [showSelectChampions, setShowSelectChampions] = useState<boolean>(false);
    const inputRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [apiData, setApiData] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    const [major, minor] = LOL_VERSION.split('.').map(Number);
    const versions = Array.from({length: minor - 0}, (_, i) => `${major}.${minor - i}`);

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
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/champion.json`);
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

    const summonerData = JSON.parse(apiData.summonerData);
    const entriesData = JSON.parse(apiData.entriesData);
    const topMasteriesData = JSON.parse(apiData.topMasteriesData);
    // const allMatchIds = JSON.parse(apiData.allMatchIds);
    const allMatchesDetailsData = JSON.parse(apiData.allMatchesDetailsData) as Match[];
    const challengesData = JSON.parse(apiData.challengesData);
    const spectatorData = JSON.parse(apiData.spectatorData);
    const clashData = JSON.parse(apiData.clashData);
    const championStatsSoloDuoData = Object.values(JSON.parse(apiData.rankedSoloChampionStatsData)) as ChampionStats[];
    const championStatsFlexData = Object.values(JSON.parse(apiData.rankedFlexChampionStatsData)) as ChampionStats[];
    const preferredSoloDuoRoleData = Object.values(JSON.parse(apiData.rankedSoloRoleStatsData)) as PreferredRole[];
    const preferredFlexRoleData = Object.values(JSON.parse(apiData.rankedFlexRoleStatsData)) as PreferredRole[];
    const allGamesChampionStatsData = Object.values(JSON.parse(apiData.allGamesChampionStatsData)) as ChampionStats[];
    const allGamesRoleStatsData = Object.values(JSON.parse(apiData.allGamesRoleStatsData)) as PreferredRole[];

    championStatsSoloDuoData.sort((a: ChampionStats, b: ChampionStats) => b.Games - a.Games || b.WinRate - a.WinRate);
    championStatsFlexData.sort((a: ChampionStats, b: ChampionStats) => b.Games - a.Games || b.WinRate - a.WinRate);

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
            <SummonerProfileHeader data={apiData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setApiData} />
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
                                    <select onChange={(e) => setSelectedChampionPerformanceMode(e.target.value)} className="bg-neutral-800 outline-none border-none" value={selectedChampionPerformanceMode}>
                                        <option value="soloduo">Ranked Solo/Duo</option>
                                        <option value="flex">Ranked Flex</option>
                                    </select>
                                </div>
                            </div>
                            {championsStatsData.length > 0 ? (
                                <div className="grid grid-cols-[28%_26%_26%_20%] mb-1 pr-5">
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
                                {championsStatsData.slice(0, 5).map((championStat: ChampionStats, index: number) => (
                                    <React.Fragment key={championStat.ChampionId}>
                                        { index !== 0 && <hr /> }
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
                                            <div className={`${getWinrateColor(Math.round(championStat.WinRate), championStat.Games)}`}>
                                                <p>{Math.round(championStat.WinRate)}%</p> 
                                                <p>({championStat.Wins}W-{championStat.Games-championStat.Wins}L)</p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition-all duration-150 ease-in hover:bg-neutral-600">
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
                                    <select onChange={(e) => setSelectedRolePerformanceMode(e.target.value)} className="bg-neutral-800 outline-none border-none" value={selectedRolePerformanceMode}>
                                        <option value="soloduo">Ranked Solo/Duo</option>
                                        <option value="flex">Ranked Flex</option>
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
                                        <div className={getWinrateColor(Math.round(role.WinRate), role.Games)}>
                                            <p>{Math.round(role.WinRate)}%</p>
                                            {/* <p>({role.Wins}W-{role.Games-role.Wins}L)</p> */}
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
                            <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition-all duration-150 ease-in hover:bg-neutral-600">
                                See More Masteries
                            </Link>
                        </div>
                    </div>
                    <div className="w-[75%] flex flex-col">
                        <div className="bg-neutral-800 text-center p-2 mb-2">
                            <div className="p-2">
                                <h1>Last 20 Games Pefrormance TODO</h1>
                            </div>
                            <div className="grid grid-cols-[25%_25%_25%_25%]">
                                <div>
                                    Winrate TODO (DPM.LOL)
                                </div>
                                <div>
                                    Champions TODO (DPM.LOL)
                                </div>
                                <div>
                                    KDA TODO (DPM.LOL)
                                </div>
                                <div>
                                    Preferred Roles TODO (OP.GG)
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
                                    <img src={filterlight} alt="filter-light" className="h-6 mr-2" />
                                    <p>Filter</p>
                                    <img src={arrowdownlight} alt="arrow-down" className={`h-4 transform transition-transform ${showFilter ? "rotate-180" : ""}`} />
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
                                            <img src={arrowdownlight} alt="arrow-down" className={`h-4 transform transition-transform ${showPatch ? "rotate-180" : ""}`} />
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
                            <div className="flex flex-col gap-1 px-2">
                                {allMatchesDetailsData.map((match: Match) => (
                                    <MatchRow info={match.info} puuid={apiData.puuid} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-neutral-800 mt-2">
                    <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                    <pre>{JSON.stringify(entriesData, null, 2)}</pre>
                    <pre>{JSON.stringify(championStatsSoloDuoData, null, 2)}</pre>
                    <pre>{JSON.stringify(championStatsFlexData, null, 2)}</pre>
                    <pre>{JSON.stringify(preferredSoloDuoRoleData, null, 2)}</pre>
                    <pre>{JSON.stringify(preferredFlexRoleData, null, 2)}</pre>
                    <pre>{JSON.stringify(topMasteriesData, null, 2)}</pre>
                    <pre>{JSON.stringify(allGamesChampionStatsData, null, 2)}</pre>
                    <pre>{JSON.stringify(allGamesRoleStatsData, null, 2)}</pre>
                    <pre>{JSON.stringify(allMatchesDetailsData, null, 2)}</pre>
                    <pre>{JSON.stringify(spectatorData, null, 2)}</pre>
                    <pre>{JSON.stringify(clashData, null, 2)}</pre>
                    <pre>{JSON.stringify(challengesData, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default Summoner;
import React, {useState, useEffect, } from "react";
import { useLocation, useParams } from "react-router-dom"
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { playerCache } from "../utils/playerCache";

import BannedChampionsList from "../components/LiveGame/BannedChampionList";
import GameTimer from "../components/GameTimer";
import ProfileHeader from "../components/ProfileHeader";
import LiveGameRow from "../components/LiveGame/LiveGameRow";

import Participant from "../interfaces/LiveGameParticipant";
import Player from "../interfaces/Player";

import queueJson from "../assets/json/queues.json";

import loadingAnimation from "../assets/animations/loading.lottie";

const LiveGame: React.FC = () => {
    const location = useLocation();
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const summoner = decodeURIComponent(encodedSummoner);
    const cacheKey = `summoner_${regionCode}_${summoner}`;
    
    const [newData, setNewData] = useState<Player>(() => {
        if (location.state?.apiData) {
            return location.state.apiData;
        }
        return {} as Player;
    });
    
    useEffect(() => {
        const loadCachedData = async () => {
            if (!location.state?.apiData) {
                try {
                    const cachedData = await playerCache.getItem(cacheKey);
                    if (cachedData) {
                        setNewData(cachedData);
                    }
                } catch (error) {
                    console.error("Error retrieving cached data:", error);
                }
            }
        };
        loadCachedData();
    }, [cacheKey, location.state?.apiData]);
    
    useEffect(() => {
        const cacheData = async () => {
            if (newData && Object.keys(newData).length > 0) {
                try {
                    await playerCache.setItem(cacheKey, newData);
                } catch (error) {
                    console.error("Error caching data:", error);
                }
            }
        };
        cacheData();
    }, [newData, cacheKey]);
    
    const spectatorData = newData.spectatorData;

    const [newSpectatorData, _] = useState(spectatorData);
    if (!newSpectatorData) {
        return (
            <div className="container m-auto">
                <ProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
                
                <div className="flex flex-col justify-center container h-[342px] bg-neutral-800 m-auto mt-2 mb-2 p-4 text-center gap-2">
                    <h2 className="text-2xl font-semibold text-neutral-50">
                        "{newData.playerBasicInfo.summonerName}#{newData.playerBasicInfo.summonerTag}" is not in an active game.
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
                        summonerName: item.playerBasicInfo.summonerName,
                        summonerTag: item.playerBasicInfo.summonerTag,
                        region: item.playerBasicInfo.region,
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
                <ProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
                <div className="w-full flex justify-center mt-5">
                    <DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay />
                </div>
            </div>
        );
    }

    return (
        <div className="container m-auto">
            <ProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
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
                            <LiveGameRow
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
                            <LiveGameRow
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
                            <LiveGameRow
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
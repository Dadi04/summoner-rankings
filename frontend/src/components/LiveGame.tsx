import React, {useState, useEffect, } from "react";
import queueJson from "../assets/json/queues.json";
import championJson from "../assets/json/champion.json";
import summonerSpellsJson from "../assets/json/summonerSpells.json";
import runesJson from "../assets/json/runes.json";
import statModsJson from "../assets/json/statMods.json";
import arrowdown from '../assets/arrow-down.png'
import forbiddenlight from "../assets/forbidden-light.png";
import noneicon from "../assets/none.jpg";

interface Shard {
    id: number;
    key: string;
    icon: string;
    name: string;
    shortDesc: string;
}

interface Perk {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
}

interface Participant {
    puuid: string;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    riotId: string;
    bot: boolean;
    summonerId: string;
    gameCustomizationObjects: any[];
    perks: Perk;
}

interface Entry {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
}

interface LiveGameData {
    summoner: {
        puuid: string;
        summonerLevel: number;
    };
    entries: Entry[];
}

interface MergedParticipant extends Participant {
    liveData: LiveGameData;
}

const GameTimer: React.FC<{gameLength: number, gameStartTime: number}> = ({ gameLength, gameStartTime }) => {
    const getElapsedTime = (): number => {
        return Math.floor((Date.now() - gameStartTime) / 1000);
    };

    const [time, setTime] = useState<number>(getElapsedTime());
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(getElapsedTime());
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [gameLength]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
};

const getQueueData = (queueId: number) =>
    queueJson.find((item) => item.queueId === queueId);

const getChampionData = (championId: number) =>
    Object.values(championJson.data).find(
        (champion) => champion.key === championId.toString()
    );

const ChampionImage: React.FC<{championId: number; teamId: number; isTeamIdSame: boolean;}> = ({championId, teamId, isTeamIdSame}) => {
    const championData = getChampionData(championId);
    const borderClasses = isTeamIdSame ? "" : `border ${teamId === 200 ? "border-red-500" : "border-blue-500"}`;
    return (
        <img 
            src={championData ? `https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${championData.id}.png` : noneicon} 
            alt={championData ? championData.id : "noneicon"} 
            className={`h-13 ${borderClasses}`} 
        />
    );
};

const BannedChampionsList: React.FC<{bannedChampions: any[]; isTeamIdSame: boolean; teamFilter?: number;}> = ({bannedChampions, isTeamIdSame, teamFilter}) => (
    <div className="flex gap-1.5">
        {bannedChampions.filter((bc) => (teamFilter ? bc.teamId === teamFilter : true)).map((bc) => (
            <div key={bc.championId} className="relative pb-2">
                <ChampionImage championId={bc.championId} teamId={bc.teamId} isTeamIdSame={isTeamIdSame} />
                <img src={forbiddenlight} alt="forbidden" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
            </div>
        ))}
    </div>
);

const SummonerSpellImage: React.FC<{spellId: number}> = ({spellId}) => {
    const spellData = Object.values(summonerSpellsJson.data).find(
        (spell) => spell.key === spellId.toString()
    );
    return (
        <img 
            src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/${spellData?.id}.png`}
            alt={spellData?.id}
            className="h-6"
        />
    );
};

const IconImage: React.FC<{icon: string; alt: string; className?: string}> = ({icon, alt, className = ""}) => (
    <img src={`https://ddragon.leagueoflegends.com/cdn/img/${icon}`} alt={alt} className={className} />
)

export const RuneImage: React.FC<{runeTypeId: number; runeId?: number}> = ({runeTypeId, runeId}) => {
    const runeTypeData = runesJson.find((runeType) => runeType.id === runeTypeId);
    if (!runeTypeData) return <span>Rune Type Not Found</span>;

    if (!runeId) return (
        <IconImage icon={runeTypeData.icon} alt={runeTypeData.key} className="h-6" />
    );

    const runes = runeTypeData.slots.flatMap((slot) => slot.runes);
    const runeData = runes.find((rune) => rune.id === runeId);
    if (!runeData) return <span>Rune Not Found</span>;
    return (
        <IconImage icon={runeData.icon} alt={runeData.key} className="h-6" />
    );
};

export const ShardSlot: React.FC<{slot: {shards: Shard[]}; selectedId?: number }> = ({slot, selectedId}) => (
    <div className="w-[60%] flex justify-evenly">
        {slot.shards.map((shard, index) => (
            <IconImage
                key={index}
                icon={shard.icon}
                alt={shard.name}
                className={`h-9 ${selectedId === shard.id ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
            />
        ))}
    </div>
)

export const RuneSlot: React.FC<{runes: { id: number; icon: string; name: string }[]; perkIds: number[]; height: string;}> = ({runes, perkIds, height}) => (
    <div className="w-[80%] flex justify-evenly">
        {runes.map((rune) => (
            <IconImage
                key={rune.id}
                icon={rune.icon}
                alt={rune.name}
                className={`${height} ${perkIds.includes(rune.id) ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
            />
        ))}
    </div>
)

const RunesList: React.FC<{runes: Perk}> = ({runes}) => {
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

const ParticipantRow: React.FC<{participant: Participant, liveData: LiveGameData, isBeingWatched: boolean, gridCols: string;}> = ({participant, liveData, isBeingWatched, gridCols}) => {
    const rankedSoloDuoEntry = liveData.entries.find((entry: Entry) => entry.queueType === "RANKED_SOLO_5x5");
    if (!rankedSoloDuoEntry) return <span>Ranked Solo Duo Information Not Found.</span>
    const [showRunesDiv, setShowRunesDiv] = useState(false);
    const winratePercentage = Math.round(rankedSoloDuoEntry.wins / (rankedSoloDuoEntry.wins + rankedSoloDuoEntry.losses) * 100);

    function getWinrateColor(winrate: number) {
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

    return (
        <div className={`grid ${gridCols} w-full items-center relative  ${isBeingWatched ? "bg-[#303030]" : ""}`}>
            <div className="flex items-center gap-2 pl-0.5">
                <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} />
                <div className="flex flex-col gap-0.5">
                    <SummonerSpellImage spellId={participant.spell1Id} />
                    <SummonerSpellImage spellId={participant.spell2Id} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <RuneImage runeTypeId={participant.perks.perkStyle} runeId={participant.perks.perkIds[0]} />
                    <RuneImage runeTypeId={participant.perks.perkSubStyle} />
                </div>
                <div>
                    <p className={`font-normal text-lg ml-3 ${isBeingWatched ? "text-purple-400" : ""}`}>
                        {participant.riotId}
                    </p>
                    <p className="font-normal text-sm ml-3 text-neutral-400">
                        Level {liveData.summoner.summonerLevel}
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
                            <p>{rankedSoloDuoEntry.wins} / {rankedSoloDuoEntry.losses}</p>
                        </div>
                        <div className="w-full h-2 bg-neutral-700">
                            <div className={`h-full ${getWinrateBackgroundColor(winratePercentage)}`} style={{width: `${winratePercentage}%` }}></div>
                        </div>
                    </div>
                </>
            ) : (
                <p>No Ranked Solo Duo entry found.</p>
            )}
            
            <div className="text-center">20%</div>
            <div className="text-center">20%</div>
            {gridCols.includes("9%") && (
                <>
                    <div className="text-center">20%</div>
                    <div onClick={() => setShowRunesDiv(prev => !prev)} className="cursor-pointer font-semibold text-neutral-800 bg-neutral-300 brightness-75 text-center flex justify-center items-center p-2 mr-2">
                        <p>Runes</p>
                        <img src={arrowdown} alt="arrow-down" className={`h-4 ml-2 transform transition-transform ${showRunesDiv ? "rotate-180" : ""}`} />
                    </div>
                    <div className={`col-span-full  transition-all duration-300 overflow-hidden ${showRunesDiv ? "max-h-[800px]" : "max-h-0"}`}>
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

const RefreshButton: React.FC<{region: string, player: any}> = ({region, player}) => {
    const [cooldown, setCooldown] = useState(false);

    const handleClick = () => {
        if (cooldown) return;
        setCooldown(true);

        fetchWithRetry(`/api/lol/profile/${region}/by-puuid/${player.puuid}/livegame`);

        setTimeout(() => {setCooldown(false);}, 300000);
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={cooldown} 
            className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 
                ${cooldown ? "bg-gray-500 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"} 
                focus:ring-4 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900`}>
            {cooldown ? "Wait 5 min..." : "Refresh"}
        </button>
    );
}; 

const delay = (ms : number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries: number = 5): Promise<Response> {
    let attempt = 0;
    while (true) {
        attempt++;
        const response = await fetch(url, options);
        if (response.status !== 429) {
            return response;
        } if (attempt >= maxRetries) {
            throw new Error(`Max retries reached for URL: ${url}`);
        }
        let retryAfterSeconds = 10;
        const retryAfterHeader = response.headers.get('Retry-After');
        if (retryAfterHeader && !isNaN(parseInt(retryAfterHeader))) {
            retryAfterSeconds = parseInt(retryAfterHeader);
        }
        const waitTime = retryAfterSeconds * 1000 * attempt;
        console.warn(`Received 429 for ${url}. Retry attempt ${attempt} in ${waitTime} ms.`);
        await delay(waitTime);
    }
}

const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

interface CachedData<T> {
    timestamp: number;
    data: T;
}

const LiveGame: React.FC<{data: any}> = ({data}) => {
    const {spectator, player, region} = data;
    if (!spectator) {
        return (
            <div className="text-center pt-2 pb-2">
                <h2 className="text-2xl font-semibold text-neutral-50">
                    "{player.gameName}#{player.tagLine}" is not in an active game.
                </h2>
                <p className="text-lg text-neutral-200">
                    Please try again later if the summoner is currently in game.
                </p>
            </div>
        )
    }

    const [liveGameData, setLiveGameData] = useState<LiveGameData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getCachedData = (key: string): LiveGameData | null => {
        const cachedstr = localStorage.getItem(key);
        if (cachedstr) {
            try {
                const cached: CachedData<LiveGameData> = JSON.parse(cachedstr);
                if (Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
                    return cached.data;
                } else {
                    localStorage.removeItem(key);
                }
            } catch (error) {
                console.error("Error parsing cached data:", error);
            }
        }
        return null;
    };

    const setCachedData = (key: string, data: LiveGameData) => {
        const cache: CachedData<LiveGameData> = {
            timestamp: Date.now(),
            data,
        };
        localStorage.setItem(key, JSON.stringify(cache));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const fetchPromises = spectator.participants.map((participant: Participant) => {
                    const storageKey = `liveGameData_${participant.puuid}`;
                    const cachedData = getCachedData(storageKey);
                    if (cachedData) {
                        return Promise.resolve(cachedData);
                    }
                    return fetchWithRetry(`/api/lol/profile/${region}/by-puuid/${participant.puuid}/livegame`)
                        .then((res) => {
                            if (!res.ok) {
                                throw new Error(`Failed to fetch for ${participant.puuid}`);
                            }
                            return res.json();
                        })
                        .then((data: LiveGameData) => {
                            setCachedData(storageKey, data);
                            return data;
                        });
                });

                const results = await Promise.all(fetchPromises);
                setLiveGameData(results);
            } catch(error) {
                console.error("Error fetching live game data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [region, spectator.participants]);

    const queueId = spectator.gameQueueConfigId;
    const queueData = getQueueData(queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";
    const isTeamIdSame = spectator.participants.every(
        (participant: Participant) => participant.teamId === spectator.participants[0].teamId
    );

    const mergedParticipants = spectator.participants.map((participant: Participant) => {
        const liveData = liveGameData.find(data => data.summoner.puuid === participant.puuid);
        return {
            ...participant,
            liveData,
        };
    });

    if (loading || !liveGameData) {
        return <div>Loading live game data...</div>;
    }

    return (
        <>
            <div className="flex mb-4 justify-between items-center text-neutral-100">
                <div className="flex">
                    <h1 className="mr-2">
                        {gamemode}
                    </h1>
                    <h1 className="mr-2 bg-purple-600 pl-2 pr-2 rounded font-bold text-sm">
                        Live
                    </h1>
                    <h1 className="mr-2 border-r-1 border-l-1 pl-2 pr-2 border-neutral-600">
                        {map}
                    </h1>
                    <h1 className="mr-2">
                        <GameTimer gameLength={spectator.gameLength} gameStartTime={spectator.gameStartTime} />
                    </h1>
                </div>
                <RefreshButton region={region} player={player} />
            </div>

            {isTeamIdSame ? (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl font-semibold">Bans</h1>
                        <BannedChampionsList bannedChampions={spectator.bannedChampions} isTeamIdSame={isTeamIdSame} />
                    </div>
                    <hr className="text-neutral-400" />
                </>
            ) : (
                <div className="flex w-full justify-between mb-3">
                    <BannedChampionsList bannedChampions={spectator.bannedChampions} isTeamIdSame={isTeamIdSame} teamFilter={100} />
                    <BannedChampionsList bannedChampions={spectator.bannedChampions} isTeamIdSame={isTeamIdSame} teamFilter={200} />
                </div>
            )}

            {isTeamIdSame ? (
                <>
                    <div className="grid grid-cols-[50%_12.5%_12.5%_12.5%_12.5%] w-full mb-2 mt-2 text-xl font-semibold">
                        <h1>Summoner</h1>
                        <h1 className="text-center">1st Place</h1>
                        <h1 className="text-center">Top 2</h1>
                        <h1 className="text-center">Top 4</h1>
                        <h1 className="text-center">Matches</h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        {mergedParticipants.map((participant: MergedParticipant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                liveData={participant.liveData}
                                isBeingWatched={player.puuid === participant.puuid}
                                gridCols="grid-cols-[50%_12.5%_12.5%_12.5%_12.5%]"
                            />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-[35%_20%_9%_9%_9%_9%_9%] w-full mb-2 text-neutral-50">
                        <div className="flex items-center">
                            <h1 className="font-bold text-blue-500 mr-2">Blue Team</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center">S14-3 Rank</p>
                        <p className="text-center"></p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-blue-500 text-neutral-200">
                        {mergedParticipants.filter((participant: MergedParticipant) => participant.teamId === 100).map((participant: MergedParticipant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                liveData={participant.liveData}
                                isBeingWatched={player.puuid === participant.puuid}
                                gridCols="grid-cols-[35%_20%_9%_9%_9%_9%_9%]"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-[35%_20%_9%_9%_9%_9%_9%] w-full mb-2 mt-5 text-neutral-50">
                        <div className="flex items-center">
                            <h1 className="font-bold text-red-500 mr-2">Red Team</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center">S14-3</p>
                        <p className="text-center"></p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-red-500 text-neutral-200">
                        {mergedParticipants.filter((participant: MergedParticipant) => participant.teamId === 200).map((participant: MergedParticipant) => (
                            <ParticipantRow
                                key={participant.puuid}
                                participant={participant}
                                liveData={participant.liveData}
                                isBeingWatched={player.puuid === participant.puuid}
                                gridCols="grid-cols-[35%_20%_9%_9%_9%_9%_9%]"
                            />
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default LiveGame;
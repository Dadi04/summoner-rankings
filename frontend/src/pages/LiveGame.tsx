import React, {useState, useEffect, } from "react";
import { useLocation, useParams, Link } from "react-router-dom"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import queueJson from "../assets/json/queues.json";
import championJson from "../assets/json/champion.json";
import summonerSpellsJson from "../assets/json/summonerSpells.json";
import runesJson from "../assets/json/runes.json";
import statModsJson from "../assets/json/statMods.json";
import arrowdown from '../assets/arrow-down.png'
import forbiddenlight from "../assets/forbidden-light.png";
import noneicon from "../assets/none.jpg";
import favorite from "../assets/favorite.svg";
import loadingAnimation from '../assets/animations/loading.lottie';

interface BannedChampion {
    championId: number; 
    teamId: number;
    pickTurn: number;
}

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

interface Summoner {
    accountId: string;
    profileIconId: number;
    revisionDate: number;
    id: string;
    puuid: string;
    summonerLevel: number;
}

interface Entry {
    queueType: string;
    tier: string;
    rank: string;
    LeaguePoints: number;
    wins: number;
    losses: number;
}

interface Player {
    summonerName: string;
    summonerTag: string;
    region: string;
    puuid: string;
    playerData: any;
    summonerData: Summoner;
    entriesData: Entry[];
    topMasteriesData: any;
    matchesData: any;
    rankedMatchesData: any;
    challengesData: any;
    spectatorData: any;
    clashData: any;
    championStatsData: ChampionStats[];
    preferredRoleData: any;
}

interface ChampionStats {
    ChampionName: string;
    Games: number;
    Wins: number;
    TotalKills: number;
    TotalDeaths: number;
    TotalAssists: number;
    WinRate: number;
    AverageKDA: number;
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

const BannedChampionsList: React.FC<{bannedChampions: BannedChampion[]; isTeamIdSame: boolean; teamFilter?: number;}> = ({bannedChampions, isTeamIdSame, teamFilter}) => (
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

const ParticipantRow: React.FC<{participant: Participant; isBeingWatched: boolean; liveGameData: Player | null; region: string; gridCols: string;}> = ({participant, isBeingWatched, liveGameData, region, gridCols}) => {
    const entries = typeof liveGameData?.entriesData === "string" ? JSON.parse(liveGameData.entriesData) : liveGameData?.entriesData || [];
    const summoner = typeof liveGameData?.summonerData === "string" ? JSON.parse(liveGameData.summonerData) : liveGameData?.summonerData || [];
    const championStats = typeof liveGameData?.championStatsData === "string" ? JSON.parse(liveGameData.championStatsData) : liveGameData?.championStatsData || [];
    // const preferredRole = typeof liveGameData?.preferredRoleData === "string" ? JSON.parse(liveGameData.preferredRoleData) : liveGameData?.preferredRoleData || [];
    const rankedSoloDuoEntry = entries.find((entry: Entry) => entry.queueType === "RANKED_SOLO_5x5");

    const [champStats, setChampStats] = useState<ChampionStats | null>(null);
    const [showRunesDiv, setShowRunesDiv] = useState(false);
    let winratePercentage = 0;
    if (rankedSoloDuoEntry) {
        winratePercentage = Math.round(rankedSoloDuoEntry.wins / (rankedSoloDuoEntry.wins + rankedSoloDuoEntry.losses) * 100);
    }
    useEffect(() => {
        fetch("https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json")
            .then(response => response.json())
            .then(data => {
                const champions = data.data
                const championIdtoName: {[key: number]: string} = {};
                
                Object.values(champions).forEach((champ:any) => {
                    championIdtoName[champ.key] = champ.id;
                })

                const championName = championIdtoName[participant.championId];
                const stats = championStats.find((cs: ChampionStats) => cs.ChampionName === championName);
                setChampStats(stats);
            
            })
            .catch(error => console.error("Error fetching champion data: ", error));
    }, [participant.championId]);
    
    // const role = preferredRole

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
                    {champStats ? `${Math.round(champStats.AverageKDA*100)/100}:1` : "-"}
                </p>
                <p>
                    {champStats ? `(${Math.round(champStats.TotalKills/champStats.Games*10)/10} / ${Math.round(champStats.TotalDeaths/champStats.Games*10)/10} / ${Math.round(champStats.TotalAssists/champStats.Games*10)/10})` : ""}
                </p>
            </div>
            {gridCols.includes("9%") && (
                <>
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

const RefreshButton: React.FC<{region: string; puuid: string; setSpectatorData: React.Dispatch<React.SetStateAction<any>>;}> = ({region, puuid, setSpectatorData}) => {
    const [cooldown, setCooldown] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        const savedTime = localStorage.getItem("cooldownExpires");
        if (savedTime) {
            const expiresAt = parseInt(savedTime, 10);
            const now = Date.now();
            if (expiresAt > now) {
                setCooldown(true);
                setRemainingTime(Math.ceil((expiresAt - now) / 60000));
            } else {
                localStorage.removeItem("cooldownExpires");
            }
        }
    }, []);

    useEffect(() => {
        if (cooldown && remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCooldown(false);
                        localStorage.removeItem("cooldownExpires");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [cooldown, remainingTime])

    const handleClick = async () => {
        if (cooldown) return;
        setCooldown(true);
        setRemainingTime(5);

        const expiresAt = Date.now() + 300000;
        localStorage.setItem("cooldownExpires", expiresAt.toString());
        console.log(region, puuid);
        try {
            const response = await fetch(`/api/lol/profile/${region}/by-puuid/${puuid}/spectator`); 
            if (!response.ok) {
                console.error("API Error:", response.statusText);
            } else {
                const newLiveData = await response.json();
                setSpectatorData(newLiveData.spectator);
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={cooldown} 
            className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 
                ${cooldown ? "bg-gray-500 cursor-not-allowed brightness-70" : "bg-purple-700 hover:bg-purple-800"} focus:ring-4 focus:ring-purple-300`}>
            {cooldown ? `Wait ${remainingTime} min...` : "Refresh"}
        </button>
    );
}; 

const LiveGame: React.FC = () => {
    const location = useLocation();
    const data = location.state?.apiData;
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }
    
    // const playerData = JSON.parse(data.summonerData)
    const summonerData = JSON.parse(data.summonerData);
    // const entriesData = JSON.parse(data.entriesData);
    // const topMasteriesData = JSON.parse(data.topMasteriesData);
    // const matchesData = JSON.parse(data.matchesData);
    // const rankedMatchesData = JSON.parse(data.rankedMatchesData);
    // const challengesData = JSON.parse(data.challengesData);
    const spectatorData = JSON.parse(data.spectatorData);
    // const clashData = JSON.parse(data.clashData);
    // const championStatsData = JSON.parse(data.championStatsData);
    // const preferredRoleData = JSON.parse(data.preferredRoleData);

    const [newSpectatorData, setSpectatorData] = useState(spectatorData);
    if (!newSpectatorData) {
        return (
            <>
                <div className="m-auto container mt-2 text-center bg-neutral-800">
                    <div className="flex border-b-1 pt-5 pb-5 pl-5">
                        <div className="relative p-3">
                            <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                        </div>
                        <div className="pt-3 pb-3">
                            <div className="flex">
                                <h1 className="text-white font-bold text-3xl mr-2">{data.summonerName}</h1>
                                <h1 className="text-neutral-400 text-3xl mr-2">#{data.summonerTag}</h1>
                                <button type="button" className="bg-neutral-200 pl-1.5 pr-1.5 rounded-lg">
                                    <img src={favorite} alt="favorite" className="h-6 border-2 border-neutral-700 rounded" />
                                </button>
                            </div>
                            <div className="flex text-sm text-neutral-100">
                                <div className="pt-2 pb-2 pl-1">
                                    <p className="uppercase border-r-1 pr-2">{regionCode}</p>
                                </div>
                                <p className="p-2">Ladder Rank num </p>
                            </div>
                            <div className="w-fit">
                                <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-semibold rounded-lg text-md px-8 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Update</button>
                            </div>
                        </div>  
                    </div>
                    <div className="p-2">
                        <ul className="flex gap-10 p-2">
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Summary</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Champions</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Mastery</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: data}} className="cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100">Live Game</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="m-auto container mt-2 text-center p-4 bg-neutral-800">
                    <h2 className="text-2xl font-semibold text-neutral-50">
                        "{data.summonerName}#{data.summonerTag}" is not in an active game.
                    </h2>
                    <p className="text-lg text-neutral-200">
                        Please try again later if the summoner is currently in game.
                    </p>
                </div>
            </>
        )
    }

    const [liveGameData, setLiveGameData] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const storageKey = `liveGameData-${regionCode}-${encodedSummoner}`;
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
            setLiveGameData(JSON.parse(storedData));
            setLoading(false);
            return;
        } 

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
                        challengesData:
                            typeof item.challengesData === "string" && item.challengesData.trim()
                            ? JSON.parse(item.challengesData)
                            : item.challengesData,
                        championStatsData:
                            typeof item.championStatsData === "string" && item.championStatsData.trim()
                            ? JSON.parse(item.championStatsData)
                            : item.championStatsData,
                        clashData:
                            typeof item.clashData === "string" && item.clashData.trim()
                            ? JSON.parse(item.clashData)
                            : item.clashData,
                        entriesData:
                            typeof item.entriesData === "string" && item.entriesData.trim()
                            ? JSON.parse(item.entriesData)
                            : item.entriesData,
                        matchesData:
                            typeof item.matchesData === "string" && item.matchesData.trim()
                            ? JSON.parse(item.matchesData)
                            : item.matchesData,
                        playerData:
                            typeof item.playerData === "string" && item.playerData.trim()
                            ? JSON.parse(item.playerData)
                            : item.playerData,
                        preferredRoleData:
                            typeof item.preferredRoleData === "string" && item.preferredRoleData.trim()
                            ? JSON.parse(item.preferredRoleData)
                            : item.preferredRoleData,
                        rankedMatchesData:
                            typeof item.rankedMatchesData === "string" && item.rankedMatchesData.trim()
                            ? JSON.parse(item.rankedMatchesData)
                            : item.rankedMatchesData,
                        spectatorData:
                            typeof item.spectatorData === "string" && item.spectatorData.trim()
                            ? JSON.parse(item.spectatorData)
                            : item.spectatorData,
                        summonerData:
                            typeof item.summonerData === "string" && item.summonerData.trim()
                            ? JSON.parse(item.summonerData)
                            : item.summonerData,
                        topMasteriesData:
                            typeof item.topMasteriesData === "string" && item.topMasteriesData.trim()
                            ? JSON.parse(item.topMasteriesData)
                            : item.topMasteriesData,
                    };
                });
                setLiveGameData(parsedData);
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (error) {
                console.error("Error fetching live game data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [regionCode, encodedSummoner, newSpectatorData.participants]);

    console.log(liveGameData);
    const queueId = newSpectatorData.gameQueueConfigId;
    const queueData = getQueueData(queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";
    const isTeamIdSame = newSpectatorData.participants.every(
        (participant: Participant) => participant.teamId === newSpectatorData.participants[0].teamId
    );

    if (loading || !liveGameData) {
        return (
            <div className="container m-auto">
                <div className="w-full bg-neutral-800 mt-1">
                    <div className="flex border-b-1 pt-5 pb-5 pl-5">
                        <div className="relative p-3">
                            <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                        </div>
                        <div className="pt-3 pb-3">
                            <div className="flex">
                                <h1 className="text-white font-bold text-3xl mr-2">{data.summonerName}</h1>
                                <h1 className="text-neutral-400 text-3xl mr-2">#{data.summonerTag}</h1>
                                <button type="button" className="bg-neutral-200 pl-1.5 pr-1.5 rounded-lg">
                                    <img src={favorite} alt="favorite" className="h-6 border-2 border-neutral-700 rounded" />
                                </button>
                            </div>
                            <div className="flex text-sm text-neutral-100">
                                <div className="pt-2 pb-2 pl-1">
                                    <p className="uppercase border-r-1 pr-2">{data.region}</p>
                                </div>
                                <p className="p-2">Ladder Rank num </p>
                            </div>
                            <div>
                                <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-semibold rounded-lg text-md px-8 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Update</button>
                            </div>
                        </div>  
                    </div>
                    <div className="p-2">
                        <ul className="flex gap-10 p-2">
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Summary</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Champions</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Mastery</Link></li>
                            <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: data}} className="cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100">Live Game</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-5">
                    <DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay />
                </div>
            </div>
        );
    }

    return (
        <div className="container m-auto">
            <div className="w-full bg-neutral-800 mt-1">
                <div className="flex border-b-1 pt-5 pb-5 pl-5">
                    <div className="relative p-3">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                    </div>
                    <div className="pt-3 pb-3">
                        <div className="flex">
                            <h1 className="text-white font-bold text-3xl mr-2">{data.summonerName}</h1>
                            <h1 className="text-neutral-400 text-3xl mr-2">#{data.summonerTag}</h1>
                            <button type="button" className="bg-neutral-200 pl-1.5 pr-1.5 rounded-lg">
                                <img src={favorite} alt="favorite" className="h-6 border-2 border-neutral-700 rounded" />
                            </button>
                        </div>
                        <div className="flex text-sm text-neutral-100">
                            <div className="pt-2 pb-2 pl-1">
                                <p className="uppercase border-r-1 pr-2">{data.region}</p>
                            </div>
                            <p className="p-2">Ladder Rank num </p>
                        </div>
                        <div>
                            <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-semibold rounded-lg text-md px-8 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Update</button>
                        </div>
                    </div>  
                </div>
                <div className="p-2">
                    <ul className="flex gap-10 p-2">
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Summary</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Champions</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: data}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Mastery</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: data}} className="cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100">Live Game</Link></li>
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center text-neutral-100 bg-neutral-800 mt-2 p-2">
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
                        <GameTimer gameLength={newSpectatorData.gameLength} gameStartTime={newSpectatorData.gameStartTime} />
                    </h1>
                </div>
                <RefreshButton region={data.region} puuid={data.puuid} setSpectatorData={setSpectatorData} />
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
                                isBeingWatched={data.Puuid === participant.puuid}
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
                                isBeingWatched={data.Puuid === participant.puuid}
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
                                isBeingWatched={data.Puuid === participant.puuid}
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
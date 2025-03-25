import React, {useState, useEffect} from "react";
import queueJson from "../assets/json/queues.json";
import championJson from "../assets/json/champion.json";
import summonerSpellsJson from "../assets/json/summonerSpells.json";
import runesJson from "../assets/json/runes.json";
import forbiddenlight from "../assets/forbidden-light.png";
import noneicon from "../assets/none.jpg";

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
    perks: {
        perkIds: number[];
        perkStyle: number;
        perkSubStyle: number;
    };
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

const RuneImage: React.FC<{runeTypeId: number; runeId?: number}> = ({runeTypeId, runeId}) => {
    const runeTypeData = runesJson.find((runeType) => runeType.id === runeTypeId);
    if (!runeTypeData) return <span>Rune Type Not Found</span>;

    if (!runeId) return (
        <img 
            src={`https://ddragon.leagueoflegends.com/cdn/img/${runeTypeData.icon}`}
            alt={runeTypeData.key}
            className="h-6"
        />
    );

    const runes = runeTypeData.slots.flatMap((slot) => slot.runes);
    const runeData = runes.find((rune) => rune.id === runeId);
    if (!runeData) return <span>Rune Not Found</span>;
    return (
        <img 
            src={`https://ddragon.leagueoflegends.com/cdn/img/${runeData.icon}`} 
            alt={runeData.key} 
            className="h-6"
        />
    );
};

const BannedChampionsList: React.FC<{bannedChampions: any[], isTeamIdSame: boolean, teamFilter?: number;}> = ({bannedChampions, isTeamIdSame, teamFilter}) => (
    <div className="flex gap-1.5">
        {bannedChampions.filter((bc) => (teamFilter ? bc.teamId === teamFilter : true)).map((bc) => (
            <div key={bc.championId} className="relative pb-2">
                <ChampionImage championId={bc.championId} teamId={bc.teamId} isTeamIdSame={isTeamIdSame} />
                <img src={forbiddenlight} alt="forbidden.png" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
            </div>
        ))}
    </div>
);

const ParticipantRow: React.FC<{participant: Participant, summonerLevel: number, isBeingWatched: boolean, gridCols: string;}> = ({participant, summonerLevel, isBeingWatched, gridCols}) => (
    <div className={`grid ${gridCols} w-full items-center ${isBeingWatched ? "bg-neutral-200" : ""}`}>
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
                <p className={`font-normal text-lg ml-3 ${isBeingWatched ? "text-purple-700" : ""}`}>
                    {participant.riotId}
                </p>
                <p className="font-normal text-sm ml-3 text-neutral-700">
                    Level {summonerLevel}
                </p>
            </div>
        </div>
        <div className="text-center">20%</div>
        <div className="text-center">20%</div>
        <div className="text-center">20%</div>
        <div className="text-center">20%</div>
        {gridCols.includes("10%") && (
            <>
                <div className="text-center">20%</div>
                <div className="text-center">20%</div>
            </>
        )}
  </div>
)

const LiveGame: React.FC<{data: any}> = ({data}) => {
    const {spectator, player, summoner} = data;
    if (!spectator) {
        return (
            <div className="text-center pt-2 pb-2">
                <h2 className="text-2xl font-semibold text-neutral-800">
                    "{player.gameName}#{player.tagLine}" is not in an active game.
                </h2>
                <p className="text-lg text-neutral-700">
                    Please try again later if the summoner is currently in game.
                </p>
            </div>
        )
    }

    const queueId = spectator.gameQueueConfigId;
    const queueData = getQueueData(queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";
    const isTeamIdSame = spectator.participants.every(
        (participant: Participant) => participant.teamId === spectator.participants[0].teamId
    );

    return (
        <>
            <div className="flex mb-4 justify-between items-center">
                <div className="flex">
                    <h1 className="mr-2">
                        {gamemode}
                    </h1>
                    <h1 className="mr-2 bg-purple-600 pl-2 pr-2 text-neutral-100 rounded font-bold text-sm">
                        Live
                    </h1>
                    <h1 className="mr-2 border-r-1 border-l-1 pl-2 pr-2 border-neutral-600">
                        {map}
                    </h1>
                    <h1 className="mr-2">
                        <GameTimer gameLength={spectator.gameLength} gameStartTime={spectator.gameStartTime} />
                    </h1>
                </div>
                <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
                    Refresh
                </button>
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
                        {spectator.participants.map((p: Participant) => (
                            <ParticipantRow
                                key={p.puuid}
                                participant={p}
                                summonerLevel={summoner.summonerLevel}
                                isBeingWatched={player.puuid === p.puuid}
                                gridCols="grid-cols-[50%_12.5%_12.5%_12.5%_12.5%]"
                            />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-[40%_10%_10%_10%_10%_10%_10%] w-full mb-2">
                        <div className="flex items-center">
                            <h1 className="font-bold text-blue-500 mr-2">Blue Team</h1>
                            <h1 className="text-blue-500 mr-1">Tier Average:</h1>
                            <h1 className="font-bold text-blue-500">avg</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center">S14-3</p>
                        <p className="text-center">Runes</p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-blue-500">
                        {spectator.participants.filter((p: Participant) => p.teamId === 100).map((p: Participant) => (
                            <ParticipantRow
                                key={p.puuid}
                                participant={p}
                                summonerLevel={summoner.summonerLevel}
                                isBeingWatched={player.puuid === p.puuid}
                                gridCols="grid-cols-[40%_10%_10%_10%_10%_10%_10%]"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-[40%_10%_10%_10%_10%_10%_10%] w-full mb-2 mt-5">
                        <div className="flex items-center">
                            <h1 className="font-bold text-red-500 mr-2">Red Team</h1>
                            <h1 className="text-red-500 mr-1">Tier Average:</h1>
                            <h1 className="font-bold text-red-500">avg</h1>
                        </div>
                        <p className="text-center">S15 Rank</p>
                        <p className="text-center">S15 WR</p>
                        <p className="text-center">Champion WR</p>
                        <p className="text-center">Champion Info</p>
                        <p className="text-center">S14-3</p>
                        <p className="text-center">Runes</p>
                    </div>
                    <div className="flex flex-col border-l-4 gap-1 border-red-500">
                        {spectator.participants.filter((p: Participant) => p.teamId === 200).map((p: Participant) => (
                            <ParticipantRow
                                key={p.puuid}
                                participant={p}
                                summonerLevel={summoner.summonerLevel}
                                isBeingWatched={player.puuid === p.puuid}
                                gridCols="grid-cols-[40%_10%_10%_10%_10%_10%_10%]"
                            />
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default LiveGame;
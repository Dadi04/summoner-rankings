import React from "react";
import queueJson from "../assets/json/queues.json";
import championJson from "../assets/json/champion.json";
import summonerSpellsJson from "../assets/json/summonerSpells.json";
import runesJson from "../assets/json/runes.json";
import GameTimer from "./GameTimer";
import forbiddenlight from "../assets/forbidden-light.png";
import noneicon from "../assets/none.jpg";

// refactor scoreboard za live game arama
// pozvati 10 api callova na spectator, entries i summoner preko puuid iz spectattor.participants

interface Perks {
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
    perks: Perks;
}

const LiveGame: React.FC<{data: any}> = ({data}) => {

    const setGamemode = () => {
        const queueId = data.spectator.gameQueueConfigId;
        const queueData = queueJson.find(item => item.queueId === queueId);

        return queueData ? queueData.description : "Unknown game mode";
    };

    const setMap = () => {
        const queueId = data.spectator.gameQueueConfigId;
        const queueData = queueJson.find(item => item.queueId === queueId);

        return queueData ? queueData.map : "Unknown map";
    };

    const findBannedChampion = (championId: number, teamId: number, sameTeam: boolean) => {
        const championData = Object.values(championJson.data).find(
            (champion) => champion.key === championId.toString()
        );
        
        const borderClasses = sameTeam ? "" : `border ${teamId === 200 ? "border-red-500" : "border-blue-500"}`;

        if (!championData) {
            return <img src={noneicon} alt="noneicon" className={`h-13 ${borderClasses}`} />
        }
        return <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${championData.id}.png`} alt={championData.id} className={`h-13 ${borderClasses}`} />;
    };

    const findSummonerSpell = (spellId: number) => {
        const spellData = Object.values(summonerSpellsJson.data).find(
            (spell) => spell.key === spellId.toString()
        );

        return <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/${spellData?.id}.png`} alt={spellData?.id} className="h-6" />;
    };

    const findRune = (runeTypeId: number, runeId?: number) => {
        console.log(runeTypeId)
        const runeTypeData = runesJson.find(runeType => runeType.id === runeTypeId);
        if (!runeTypeData) {
            return <span>Rune Type Not Found</span>;
        }

        if (!runeId) {
            return <img src={`https://ddragon.leagueoflegends.com/cdn/img/${runeTypeData.icon}`} alt={runeTypeData.key} className="h-6" />
        }

        const runes = runeTypeData.slots.flatMap(slot => slot.runes);
        const runeData = runes.find(rune => rune.id === runeId);
        if (!runeData) {
            return <span>Rune Not Found</span>; 
        }

        return <img src={`https://ddragon.leagueoflegends.com/cdn/img/${runeData.icon}`} alt={runeData.key} className="h-6" />
    };

    const isGameLive = () => {
        if (data.spectator) {
            const sameTeam = data.spectator.participants.every(
                (participant: {teamId: number}) => participant.teamId === data.spectator.participants[0].teamId
            );

            return (
                <div>
                    <div className="flex mb-4 justify-between items-center">
                        <div className="flex">
                            <h1 className="mr-2">{setGamemode()}</h1>
                            <h1 className="mr-2 bg-purple-600 pl-2 pr-2 text-neutral-100 rounded font-bold text-sm">Live</h1>
                            <h1 className="mr-2 border-r-1 border-l-1 pl-2 pr-2 border-neutral-600">{setMap()}</h1>
                            <h1 className="mr-2"><GameTimer gameLength={data.spectator.gameLength} gameStartTime={data.spectator.gameStartTime} /></h1>
                        </div>
                        <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Refresh</button>
                    </div>
                    <div>
                        {sameTeam ? (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-xl font-semibold">Bans</h1>
                                    <div className="flex gap-1.5">
                                        {data.spectator.bannedChampions.map(
                                            (bannedChampion: { championId: number; teamId: number }) => (
                                                <div key={bannedChampion.championId} className="relative pb-2">
                                                    {findBannedChampion(bannedChampion.championId, bannedChampion.teamId, sameTeam)}
                                                    <img src={forbiddenlight} alt="forbidden.png" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                                <hr className="text-neutral-400" />
                            </>
                        ) : (
                            <>
                                <div className="flex w-full justify-between mb-3">
                                    <div className="flex gap-2">
                                        {data.spectator.bannedChampions
                                            .filter((bannedChampion: { championId: number; teamId: number }) => bannedChampion.teamId === 100)
                                            .map((bannedChampion: { championId: number; teamId: number }) => (
                                                <div key={bannedChampion.championId} className="relative pb-2">
                                                    {findBannedChampion(bannedChampion.championId, bannedChampion.teamId, sameTeam)}
                                                    <img src={forbiddenlight} alt="forbidden.png" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
                                                </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        {data.spectator.bannedChampions
                                            .filter((bannedChampion: { championId: number; teamId: number }) => bannedChampion.teamId === 200)
                                            .map((bannedChampion: { championId: number; teamId: number }) => (
                                                <div key={bannedChampion.championId} className="relative pb-2">
                                                    {findBannedChampion(bannedChampion.championId, bannedChampion.teamId, sameTeam)}
                                                    <img src={forbiddenlight} alt="forbidden.png" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
                                                </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div>
                        {sameTeam ? (
                            <>
                                <div className="grid grid-cols-[50%_12.5%_12.5%_12.5%_12.5%] w-full mb-2 mt-2 text-xl font-semibold ">
                                    <h1>Summoner</h1>
                                    <h1 className="text-center">1st Place</h1>
                                    <h1 className="text-center">Top 2</h1>
                                    <h1 className="text-center">Top 4</h1>
                                    <h1 className="text-center">Matches</h1>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {data.spectator.participants.map((participant: Participant) => (
                                        <div className="grid grid-cols-[50%_12.5%_12.5%_12.5%_12.5%] w-full">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    {findBannedChampion(participant.championId, participant.teamId, sameTeam)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findSummonerSpell(participant.spell1Id)}
                                                    {findSummonerSpell(participant.spell2Id)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findRune(participant.perks.perkStyle, participant.perks.perkIds[0])}
                                                    {findRune(participant.perks.perkSubStyle)}
                                                </div>
                                                <div>
                                                    <p className={`font-normal text-lg ml-3 ${data.player.puuid === participant.puuid ? "text-purple-700" : ""}`}>{participant.riotId}</p>
                                                    <p className="font-normal text-sm ml-3 text-neutral-700">Level {data.summoner.summonerLevel}</p> 
                                                    {/* mora api call */}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                        </div>
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
                                    {data.spectator.participants
                                        .filter((participant: Participant) => participant.teamId === 100)
                                        .map((participant: Participant) => (
                                        <div className="grid grid-cols-[40%_10%_10%_10%_10%_10%_10%] w-full">
                                            <div className="flex items-center gap-2 pl-1">
                                                <div>
                                                    {findBannedChampion(participant.championId, participant.teamId, sameTeam)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findSummonerSpell(participant.spell1Id)}
                                                    {findSummonerSpell(participant.spell2Id)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findRune(participant.perks.perkStyle, participant.perks.perkIds[0])}
                                                    {findRune(participant.perks.perkSubStyle)}
                                                </div>
                                                <div>
                                                    <p className={`font-normal text-lg ml-3 ${data.player.puuid === participant.puuid ? "text-purple-700" : ""}`}>{participant.riotId}</p>
                                                    <p className="font-normal text-sm ml-3 text-neutral-700">Level {data.summoner.summonerLevel}</p> 
                                                    {/* mora api call */}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                        </div>
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
                                    {data.spectator.participants
                                        .filter((participant: Participant) => participant.teamId === 200)
                                        .map((participant: Participant) => (
                                        <div className="grid grid-cols-[40%_10%_10%_10%_10%_10%_10%] w-full">
                                            <div className="flex items-center gap-2 pl-1">
                                                <div>
                                                    {findBannedChampion(participant.championId, participant.teamId, sameTeam)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findSummonerSpell(participant.spell1Id)}
                                                    {findSummonerSpell(participant.spell2Id)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    {findRune(participant.perks.perkStyle, participant.perks.perkIds[0])}
                                                    {findRune(participant.perks.perkSubStyle)}
                                                </div>
                                                <div>
                                                    <p className={`font-normal text-lg ml-3 ${data.player.puuid === participant.puuid ? "text-purple-700" : ""}`}>{participant.riotId}</p>
                                                    <p className="font-normal text-sm ml-3 text-neutral-700">Level {data.summoner.summonerLevel}</p> 
                                                    {/* mora api call  */}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                {}
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                            <div className="text-center">
                                                20%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )} 
                    </div>
                </div>
            )
        } 
        
        return (
            <div className="text-center pt-2 pb-2">
                <h2 className="text-2xl font-semibold text-neutral-800">"{data.player.gameName}#{data.player.tagLine}" is not in an active game.</h2>
                <p className="text-lg text-neutral-700">Please try again later if the summoner is currently in game.</p>
            </div>
        )
    };


    return (
        <div>
            {isGameLive()}
        </div>
    );
};

export default LiveGame;
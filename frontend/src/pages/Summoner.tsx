import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DD_VERSION, LOL_VERSION } from "../version";

import GameTimer from "../components/GameTime";
import ChampionImage from "../components/ChampionImage";
import SummonerSpellImage from "../components/SummonerSpellImage";
import RuneImage from "../components/RuneImage";
import SummonerProfileHeader from "../components/SummonerProfileHeader";

import Participant from "../interfaces/Participant";
import Entry from "../interfaces/Entry";
import ChampionStats from "../interfaces/ChampionStats";
import PreferredRole from "../interfaces/PreferredRole";
import Mastery from "../interfaces/Mastery";
import Player from "../interfaces/Player";
import Match from "../interfaces/Match";
import MatchInfo from "../interfaces/MatchInfo";
import MatchParticipant from "../interfaces/MatchParticipant";
import MatchPerks from "../interfaces/MatchPerks";
import IconImage from "../components/IconImage";
import RuneSlot from "../components/RuneSlot";
import ShardSlot from "../components/ShardSlot";

import queueJson from "../assets/json/queues.json";
import runesJson from "../assets/json/runes.json";
import statModsJson from "../assets/json/statMods.json";

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
import map from "../assets/map11.png";
import allInPing from "../assets/pings/allInPing.webp";
import assistMePing from "../assets/pings/assistMePing.webp";
import enemyMissingPing from "../assets/pings/enemyMissingPing.webp";
import enemyVisionPing from "../assets/pings/enemyVisionPing.webp";
import genericPing from "../assets/pings/genericPing.webp";
import getBackPing from "../assets/pings/getBackPing.webp";
import needVisionPing from "../assets/pings/needVisionPing.webp";
import onMyWayPing from "../assets/pings/onMyWayPing.webp";
import pushPing from "../assets/pings/pushPing.webp";

type SortField = 
  | "kills"
  | "deaths"
  | "kda"
  | "totalDamageDealt"
  | "totalDamageTaken"
  | "goldEarned"
  | "visionScore"
  | "wardsPlaced"
  | "cs";

const ItemImage: React.FC<{itemId: number; matchWon: boolean; classes: string}> = ({itemId, matchWon, classes}) => {
    if (itemId === 0) {
        return (
            <div className={`h-8 w-8 ${matchWon ? "bg-[#2F436E]" : "bg-[#703C47]"} `}></div>
        );
    }

    return (
        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`} alt={`${itemId}`} className={classes} />
    );
}

const MatchGeneral: React.FC<{info: MatchInfo, puuid: string, region: string}> = ({info, puuid, region}) => {
    const blueSideWon = info.participants.find(p => p.teamId === 100)?.win;

    const blueTeamObjectives = info.teams.find(team => team.teamId === 100)?.objectives;
    const redTeamObjectives = info.teams.find(team => team.teamId === 200)?.objectives;

    const blueTeamKills = {
        grubs: blueTeamObjectives?.horde.kills,
        dragon: blueTeamObjectives?.dragon.kills,
        herald: blueTeamObjectives?.riftHerald.kills,
        baron: blueTeamObjectives?.baron.kills,
        atakhan: 999, // /lol/match/v5/matches/{matchId}/timeline
        turret: blueTeamObjectives?.tower.kills,
        inhibitor: blueTeamObjectives?.inhibitor.kills
    };

    const redTeamKills = {
        grubs: redTeamObjectives?.horde.kills,
        dragon: redTeamObjectives?.dragon.kills,
        herald: redTeamObjectives?.riftHerald.kills,
        baron: redTeamObjectives?.baron.kills,
        atakhan: 999, // /lol/match/v5/matches/{matchId}/timeline
        turret: redTeamObjectives?.tower.kills,
        inhibitor: redTeamObjectives?.inhibitor.kills
    };

    const blueSideTotalKills = info.participants.filter((p) => p.teamId === 100).reduce((sum, p) => sum + p.kills, 0);
    const redSideTotalKills = info.participants.filter((p) => p.teamId === 200).reduce((sum, p) => sum + p.kills, 0);

    return ( 
        <>
            <div>
                <div className="flex gap-3 items-center">
                    {blueSideWon ? 
                        <p className="text-blue-500 font-bold text-lg">Victory</p> 
                    : 
                        <p className="text-red-500 font-bold text-lg">Defeat</p>
                    }
                    <p className="text-neutral-400 text-lg">(Blue Side)</p>
                    <div className="flex gap-2 font-normal text-2xl text-neutral-200 py-2">
                        <p>Voidgrubs: {blueTeamKills.grubs}</p>
                        <p>Drakes: {blueTeamKills.dragon}</p>
                        <p>Herald: {blueTeamKills.herald}</p>
                        <p>Barons: {blueTeamKills.baron}</p>
                        <p>Atakhan: {blueTeamKills.atakhan}</p>
                        <p>Turrets: {blueTeamKills.turret}</p>
                        <p>Inhibitors: {blueTeamKills.inhibitor}</p>
                    </div>
                </div>
                <div className={`${blueSideWon ? "bg-[#28344E]" : "bg-[#59343B]"} flex flex-col gap-2 text-sm p-2`}>
                    {info.participants.filter(participant => participant.teamId === 100).map(participant => (
                        <div key={participant.puuid} className="grid grid-cols-[40%_10%_10%_10%_30%] items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-12" />
                                    <p className="absolute text-sm right-0 bottom-0 transform translate-x-[2px] translate-y-[2px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <SummonerSpellImage spellId={participant.summoner1Id} classes="h-6" />
                                    <SummonerSpellImage spellId={participant.summoner2Id} classes="h-6" />
                                </div>
                                {participant.perks.styles[0].style ? (
                                    <div className="flex flex-col gap-1">
                                        <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-6" />
                                        <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-6" />
                                    </div>
                                ) : (
                                    <></>
                                )}
                                <div>
                                    <Link to={`/lol/profile/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`} className={`cursor-pointer hover:underline ${participant.puuid === puuid ? "text-purple-400" : ""}`}>
                                        {participant.riotIdGameName}
                                    </Link>
                                    <div className="text-neutral-300 flex items-center gap-1">
                                        <img src={`https://static.bigbrain.gg/assets/lol/ranks/s13/mini/${participant.entry.tier.toLowerCase()}.svg`} alt={participant.entry.tier.toLowerCase()} className="h-5" />
                                        <p className="capitalize">{participant.entry.tier.toLowerCase()} {participant.entry.rank} {participant.entry.leaguePoints} LP</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="font-bold text-lg">{participant.kills}</p>
                                <p className="text-neutral-400 px-2 text-lg">/</p> 
                                <p className="text-red-500 font-bold text-lg">{participant.deaths}</p> 
                                <p className="text-neutral-400 px-2 text-lg">/</p> 
                                <p className="font-bold text-lg">{participant.assists}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-normal">{blueSideTotalKills === 0 ? 100 : Math.round(((participant.kills + participant.assists) / blueSideTotalKills) * 100)}%</p>
                                <p className="text-neutral-400">KP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl text-yellow-200">{((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">CS/min</p>
                            </div>
                            <div className="flex gap-2">
                                <ItemImage itemId={participant.item0} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item1} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item2} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item3} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item4} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item5} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item6} matchWon={participant.win} classes="h-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className="flex gap-3 items-center">
                    {!blueSideWon ? 
                        <p className="text-blue-500 font-bold text-lg">Victory</p> 
                    : 
                        <p className="text-red-500 font-bold text-lg">Defeat</p>
                    }
                    <p className="text-neutral-400 text-lg">(Blue Side)</p>
                    <div className="flex gap-2 font-normal text-2xl text-neutral-200 py-2">
                        <p>Voidgrubs: {redTeamKills.grubs}</p>
                        <p>Drakes: {redTeamKills.dragon}</p>
                        <p>Herald: {redTeamKills.herald}</p>
                        <p>Barons: {redTeamKills.baron}</p>
                        <p>Atakhan: {redTeamKills.atakhan}</p>
                        <p>Turrets: {redTeamKills.turret}</p>
                        <p>Inhibitors: {redTeamKills.inhibitor}</p>
                    </div>
                </div>
                <div className={`${!blueSideWon ? "bg-[#28344E]" : "bg-[#59343B]"} flex flex-col gap-2 text-sm p-2`}>
                    {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                        <div key={participant.puuid} className="grid grid-cols-[40%_10%_10%_10%_30%] items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-12" />
                                    <p className="absolute text-sm right-0 bottom-0 transform translate-x-[2px] translate-y-[2px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <SummonerSpellImage spellId={participant.summoner1Id} classes="h-6" />
                                    <SummonerSpellImage spellId={participant.summoner2Id} classes="h-6" />
                                </div>
                                {participant.perks.styles[0].style ? (
                                    <div className="flex flex-col gap-1">
                                        <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-6" />
                                        <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-6" />
                                    </div>
                                ) : (
                                    <></>
                                )}
                                <div>
                                    <Link to={`/lol/profile/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`} className={`cursor-pointer hover:underline ${participant.puuid === puuid ? "text-purple-400" : ""}`}>
                                        {participant.riotIdGameName}
                                    </Link>
                                    <div className="text-neutral-300 flex items-center gap-1">
                                        <img src={`https://static.bigbrain.gg/assets/lol/ranks/s13/mini/${participant.entry.tier.toLowerCase()}.svg`} alt={participant.entry.tier.toLowerCase()} className="h-5" />
                                        <p className="capitalize">{participant.entry.tier.toLowerCase()} {participant.entry.rank} {participant.entry.leaguePoints} LP</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="font-bold text-lg">{participant.kills}</p>
                                <p className="text-neutral-400 px-2 text-lg">/</p> 
                                <p className="text-red-500 font-bold text-lg">{participant.deaths}</p> 
                                <p className="text-neutral-400 px-2 text-lg">/</p> 
                                <p className="font-bold text-lg">{participant.assists}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-normal">{redSideTotalKills === 0 ? 100 : Math.round(((participant.kills + participant.assists) / redSideTotalKills) * 100)}%</p>
                                <p className="text-neutral-400">KP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl text-yellow-200">{((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">CS/min</p>
                            </div>
                            <div className="flex gap-2">
                                <ItemImage itemId={participant.item0} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item1} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item2} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item3} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item4} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item5} matchWon={participant.win} classes="h-8" />
                                <ItemImage itemId={participant.item6} matchWon={participant.win} classes="h-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

const MatchPerformance: React.FC<{info: MatchInfo, puuid: string}> = ({info, puuid}) => {
    const [sortBy, setSortBy] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const getSortValue = (participant: MatchParticipant, field: SortField) => {
        switch (field) {
            case "kills":
                return participant.kills;
            case "deaths":
                return participant.deaths;
            case "kda":
                return participant.deaths === 0 ? Infinity : (participant.kills + participant.assists) / participant.deaths;
            case "totalDamageDealt":
                return participant.totalDamageDealtToChampions;
            case "totalDamageTaken":
                return participant.totalDamageTaken;
            case "goldEarned":
                return participant.goldEarned;
            case "visionScore":
                return participant.visionScore;
            case "wardsPlaced":
                return participant.wardsPlaced;
            case "cs":
                return participant.totalMinionsKilled + participant.neutralMinionsKilled;
            default:
                return 0;
        }
    };

    const handleSort = (field: string) => {
        if (field === "player") {
            setSortBy(null);
            setSortOrder("desc");
        } else {
            const sortField = field as SortField;
            if (sortBy === sortField) {
                setSortOrder(sortOrder === "desc" ? "asc" : "desc");
            } else {
                setSortBy(sortField);
                setSortOrder("desc");
            }
        }
    };
    
    const sortedParticipants = useMemo(() => {
        let sorted = [...info.participants];
        if (sortBy) {
            sorted.sort((a, b) => {
                const aVal = getSortValue(a, sortBy);
                const bVal = getSortValue(b, sortBy);
                return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
            });
        }
        return sorted;
    }, [info.participants, sortBy, sortOrder]);

    return (
        <>
            <div className="grid grid-cols-[19%_6%_6%_6%_13%_13%_13%_13%_10%] text-center text-lg py-2 mt-2">
                <p onClick={() => handleSort("player")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy === null ? "text-white font-bold" : ""}`}>Player</p>
                <p onClick={() => handleSort("kills")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "kills" ? "text-white font-bold" : ""}`}>Kills</p>
                <p onClick={() => handleSort("deaths")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "deaths" ? "text-white font-bold" : ""}`}>Deaths</p>
                <p onClick={() => handleSort("kda")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "kda" ? "text-white font-bold" : ""}`}>KDA</p>
                <p onClick={() => handleSort("totalDamageDealt")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "totalDamageDealt" ? "text-white font-bold" : ""}`}>Damage dealt</p>
                <p onClick={() => handleSort("totalDamageTaken")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "totalDamageTaken" ? "text-white font-bold" : ""}`}>Damage taken</p>
                <p onClick={() => handleSort("goldEarned")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "goldEarned" ? "text-white font-bold" : ""}`}>Gold</p>
                <p onClick={() => handleSort("visionScore")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "visionScore" ? "text-white font-bold" : ""}`}>Vision score</p>
                <p onClick={() => handleSort("cs")} className={`cursor-pointer transition-all duration-150 hover:text-white hover:font-bold ${sortBy as string === "cs" ? "text-white font-bold" : ""}`}>CS</p>
            </div>
            <div>
                {sortedParticipants.map((participant, index: number) => {
                    const rawKDA = participant.deaths === 0 ? Infinity  : (participant.kills + participant.assists) / participant.deaths;
                    const displayKDA = participant.deaths === 0 ? "Perfect" : rawKDA.toFixed(2);

                    return (
                        <div key={index} className={`grid grid-cols-[19%_6%_6%_6%_13%_13%_13%_13%_10%] items-center mt-2 ${participant.win ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                            <div className={`flex items-center text-center gap-0.5 p-2 ${participant.puuid === puuid ? "text-purple-600" : ""}`}>
                                <div className="relative inline-block">
                                    <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-12" />
                                    <img src={`https://dpm.lol/position/${participant.teamPosition}.svg`} alt={participant.teamPosition} className="absolute bottom-0 right-0 h-6 bg-black transform translate-x-1/8 translate-y-1/8" />
                                </div>
                                <p>{participant.riotIdGameName}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "kills" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.kills}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "deaths" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.deaths}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "kda" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{displayKDA}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "totalDamageDealt" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.totalDamageDealtToChampions}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "totalDamageTaken" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.totalDamageTaken}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "goldEarned" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.goldEarned}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "visionScore" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.visionScore}</p>
                            </div>
                            <div className={`flex items-center justify-center h-full text-center ${sortBy as string === "cs" ? `text-white font-bold ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"}` : ""}`}>
                                <p>{participant.totalMinionsKilled + participant.neutralMinionsKilled}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    );
}

const MatchDetails: React.FC<{info: MatchInfo, selectedPlayer: MatchParticipant, champions: any[]}> = ({info, selectedPlayer, champions}) => {

    const champ = champions.find(c => c.id === selectedPlayer.championName);
    if (!champ) return <div>Champion not found</div>;
    const { spells,  } = champ;

    const centerPing = { icon: genericPing, count: selectedPlayer.commandPings };
    const edgePings = [
        { icon: getBackPing,     count: selectedPlayer.getBackPings },
        { icon: pushPing,        count: selectedPlayer.pushPings },
        { icon: onMyWayPing,     count: selectedPlayer.onMyWayPings },
        { icon: allInPing,       count: selectedPlayer.allInPings },
        { icon: assistMePing,    count: selectedPlayer.assistMePings },
        { icon: needVisionPing,  count: selectedPlayer.needVisionPings },
        { icon: enemyMissingPing,count: selectedPlayer.enemyMissingPings },
        { icon: enemyVisionPing, count: selectedPlayer.enemyVisionPings },
    ];

    return (
        <>
            <div>
                <div className="flex justify-between gap-2 my-2">
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">LANING PHASE (AT 15)</h1>
                        <div className="flex justify-between">
                            <div className="w-[25%] text-center">
                                <p>TODO</p>
                                <p className="text-neutral-400">cs diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>TODO</p>
                                <p className="text-neutral-400">gold diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>TODO</p>
                                <p className="text-neutral-400">xp diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>TODO</p>
                                <p className="text-neutral-400">first lvl 2</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">WARDS</h1>
                        <div className="flex justify-between">
                            <div className="w-[33%] text-center">
                                <p>{selectedPlayer.wardsPlaced-selectedPlayer.detectorWardsPlaced}</p>
                                <p className="text-neutral-400">placed</p>
                            </div>
                            <div className="w-[33%] text-center">
                                <p>{selectedPlayer.wardsKilled}</p>
                                <p className="text-neutral-400">killed</p>
                            </div>
                            <div className="w-[33%] text-center">
                                <p>{selectedPlayer.detectorWardsPlaced}</p>
                                <p className="text-neutral-400">control</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">GLOBAL STATS</h1>
                        <div className="flex justify-between">
                            <div className="w-[25%] text-center">
                                <p>{((selectedPlayer.totalMinionsKilled+selectedPlayer.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">CS/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>{(selectedPlayer.visionScore/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">VS/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>{(selectedPlayer.totalDamageDealtToChampions/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">DMG/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p>{(selectedPlayer.goldEarned/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">gold/min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-neutral-700 my-2 p-2">
                <h1 className="text-xl text-neutral-300 mb-2">BUILD ORDER</h1>
                <div>
                    TODO
                </div>
            </div>
            <div className="bg-neutral-700 my-2 p-2">
                <h1 className="text-xl text-neutral-300 mb-2">SKILL ORDER</h1>
                <div>
                    TODO
                </div>
            </div>
            <div className="flex my-1 gap-2 items-stretch">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="bg-neutral-700 p-2 pb-7">
                        <h1 className="text-xl text-neutral-300 mb-4">SPELLS CASTED</h1>
                        <div className="flex justify-around">
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[0].image.full}`} alt="" />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">Q</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell1Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[1].image.full}`} alt="" />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">W</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell2Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[2].image.full}`} alt="" />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">E</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell3Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[3].image.full}`} alt="" />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">R</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell4Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-700 p-2 pb-6">
                        <h1 className="text-xl text-neutral-300 mb-4">SUMMONERS CASTED</h1>
                        <div className="flex justify-evenly">
                            <div>
                                <SummonerSpellImage spellId={selectedPlayer.summoner1Id} />
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.summoner1Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <SummonerSpellImage spellId={selectedPlayer.summoner2Id} />
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.summoner2Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-neutral-700 p-2 pb-4">
                    <h1 className="text-xl text-neutral-300 mb-2">PINGS</h1>
                    <div className="relative w-90 h-90 mx-auto">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center">
                                <img src={centerPing.icon} alt="generic ping" className="w-14 mb-1" />
                                <span className="text-lg text-neutral-200">{centerPing.count}</span>
                            </div>
                        </div>

                        {edgePings.map((p, i) => {
                            const angle = (i / edgePings.length) * 360;
                            return (
                                <div key={i} className="absolute top-1/2 left-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                                style={{transform: `rotate(${angle}deg) translateY(-9rem) rotate(-${angle}deg)`}}>
                                    <img src={p.icon} alt="" className="w-14 mb-1" />
                                    <span className="text-lg text-neutral-200">{p.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

const MatchParticipantList: React.FC<{info: MatchInfo; choosePlayerDetails: string; setChoosePlayerDetails: React.Dispatch<React.SetStateAction<string>>; }> = ({info, choosePlayerDetails, setChoosePlayerDetails }) => {

    return (
        <div className="flex items-center justify-between">
            <div className="flex gap-3">
                {info.participants.filter(participant => participant.teamId === 100).map(participant => (
                    <div key={participant.championId} onClick={() => setChoosePlayerDetails(participant.championName)} className={`relative p-2 transition hover:bg-neutral-700 ${choosePlayerDetails === participant.championName ? "bg-neutral-700" : ""}`}>
                        <ChampionImage championId={participant.championId} teamId={100} isTeamIdSame={false} classes="h-13" />
                        <img src={`https://dpm.lol/position/${participant.teamPosition}.svg`} alt={participant.teamPosition} className="absolute bottom-0 right-0 h-6 bg-black transform -translate-x-1/3 -translate-y-1/3" />
                    </div>
                ))}
            </div>
            <div>
                <p className="text-neutral-400 text-2xl font-bold gap-1">VS</p>
            </div>
            <div className="flex gap-3">
                {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                    <div key={participant.championId} onClick={() => setChoosePlayerDetails(participant.championName)} className={`relative p-2 transition hover:bg-neutral-700 ${choosePlayerDetails === participant.championName ? "bg-neutral-700" : ""}`}>
                        <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={false} classes="h-13" />
                        <img src={`https://dpm.lol/position/${participant.teamPosition}.svg`} alt={participant.teamPosition} className="absolute bottom-0 right-0 h-6 bg-black transform -translate-x-1/3 -translate-y-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

const MatchRunes: React.FC<MatchPerks> = ({ statPerks, styles }) => {
    const primaryStyle = styles[0];
    const primaryTypeData = runesJson.find((r) => r.id === primaryStyle.style);
    if (!primaryTypeData) return <span>Primary Rune Type Not Found</span>;
    const [slotP0, slotP1, slotP2, slotP3] = primaryTypeData.slots;
    const primaryPerkIds = primaryStyle.selections.map((s) => s.perk);
  
    const secondaryStyle = styles[1];
    const secondaryTypeData = runesJson.find((r) => r.id === secondaryStyle.style);
    if (!secondaryTypeData) return <span>Secondary Rune Type Not Found</span>;
    const [, slotS1, slotS2, slotS3] = secondaryTypeData.slots;
    const secondaryPerkIds = secondaryStyle.selections.map((s) => s.perk);
  
    const [statMods0, statMods1, statMods2] = statModsJson.slots;
    const selectedShard0 = statPerks.offense;
    const selectedShard1 = statPerks.flex;
    const selectedShard2 = statPerks.defense;
  
    return (
        <div className="flex justify-evenly my-6">
            <div className="w-[30%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-700 p-2 rounded">
                    <IconImage icon={primaryTypeData.icon} alt={primaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{primaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-6 items-center mt-4">
                    <RuneSlot runes={slotP0.runes} perkIds={primaryPerkIds} height="h-17" />
                    <hr className="w-full text-neutral-300" />
                    <RuneSlot runes={slotP1.runes} perkIds={primaryPerkIds} height="h-12" />
                    <RuneSlot runes={slotP2.runes} perkIds={primaryPerkIds} height="h-12" />
                    <RuneSlot runes={slotP3.runes} perkIds={primaryPerkIds} height="h-12" />
                </div>
            </div>
            <div className="w-[30%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-700 p-2 rounded">
                    <IconImage icon={secondaryTypeData.icon} alt={secondaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{secondaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-3 items-center mt-4 mb-4">
                    <RuneSlot runes={slotS1.runes} perkIds={secondaryPerkIds} height="h-12" />
                    <RuneSlot runes={slotS2.runes} perkIds={secondaryPerkIds} height="h-12" />
                    <RuneSlot runes={slotS3.runes} perkIds={secondaryPerkIds} height="h-12" />
                </div>
                <hr className="text-neutral-300" />
                <div className="flex flex-col items-center mt-3 gap-2">
                    <ShardSlot slot={statMods0} selectedId={selectedShard0} />
                    <ShardSlot slot={statMods1} selectedId={selectedShard1} />
                    <ShardSlot slot={statMods2} selectedId={selectedShard2} />
                </div>
            </div>
        </div>
    );
};

const MatchTimeline: React.FC<{info: MatchInfo; selectedPlayer: MatchParticipant}> = ({info, selectedPlayer}) => {
    console.log(info, selectedPlayer)
    return (
        <>  
            <div className="flex justify-center gap-4">
                <div>
                    <input type="checkbox" />
                    <span>Kills</span>
                </div>
                <div>
                    <input type="checkbox" />
                    <span>Objectives</span>
                </div>
                <div>
                    <input type="checkbox" />
                    <span>Vision</span>
                </div>
            </div>
            <div className="flex">
                <div className="flex-1">
                    info
                </div>
                <div className="flex-1">
                    <img src={map} alt="summonersrift" />
                </div>
            </div>
        </>
    );
}

const MatchRow: React.FC<{info: MatchInfo; puuid: string; region: string;}> = ({info, puuid, region}) => {
    const [showDetailsDiv, setShowDetailsDiv] = useState<boolean>(false);
    const [chooseTab, setChooseTab] = useState<string>("General");
    const [champions, setChampions] = useState<any[]>([]);

    const participant = info.participants.find((p) => p.puuid === puuid)!;
    const [choosePlayerDetails, setChoosePlayerDetails] = useState<string>(participant.championName);

    const queueId = info.queueId;
    const queueData = queueJson.find((item) => item.queueId === queueId);
    const gamemode = queueData ? queueData.description : "Unknown game mode";
    const map = queueData ? queueData.map : "Unknown map";

    const selectedPlayer = info.participants.find(participant => participant.championName === choosePlayerDetails);
    if (!selectedPlayer) return <div>Detail not found</div>;
      
    let gameEnded = Math.round((Date.now() - info.gameEndTimestamp)/60000);
    let timeUnit = gameEnded === 1 ? "minute ago" : "minutes ago";
    if (gameEnded > 60) {
        gameEnded = Math.round(gameEnded / 60);
        timeUnit = gameEnded === 1 ? "hour ago" : "hours ago";
        if (gameEnded > 24) {
            gameEnded = Math.round(gameEnded / 24);
            timeUnit = gameEnded === 1 ? "day ago" : "days ago";
            if (gameEnded > 7) {
                gameEnded = Math.round(gameEnded / 7);
                timeUnit = gameEnded === 1 ? "week ago" : "weeks ago";
                if (gameEnded > 4) {
                    gameEnded = Math.round(gameEnded / 4);
                    timeUnit = gameEnded === 1 ? "month ago" : "months ago";
                    if (gameEnded > 12) {
                        gameEnded = Math.round(gameEnded / 12);
                        timeUnit = gameEnded === 1 ? "year ago" : "years ago";
                    }
                }
            }
        }
    } 

    const teamParticipants = info.participants.filter((p) => p.teamId === participant.teamId);
    const totalKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
    let killParticipation;
    if (totalKills === 0) {
        killParticipation = 100;
    } else {
        killParticipation = Math.round(((participant.kills + participant.assists) / totalKills) * 100);
    }
 
    useEffect(() => {
        const fetchChampions = async () => {
            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/championFull.json`);
                const data = await response.json();
                setChampions(Object.values(data.data));
            } catch (error) {
                console.error(error);
            }
        };
        fetchChampions();
    }, [DD_VERSION]);

    return (
        <>
            <div className={`w-full grid grid-cols-[25%_35%_17.5%_17.5%_5%] items-center ${participant.win ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                <div className="p-2">
                    <div className="w-[80%] border-b-2 border-neutral-400 p-2">
                        <p className={`font-bold ${participant.win ? "text-blue-400" : "text-red-400"}`}>{gamemode}</p>
                        <p className="text-sm text-neutral-300">{map}</p>
                        <p>{gameEnded} {timeUnit}</p>
                    </div>
                    <div className="flex flex-col p-2">
                        <p className="font-bold text-neutral-200">{participant.win ? "Victory" : "Defeat"}</p>
                        <p className="text-md text-neutral-400">{Math.round(info.gameDuration/60)}m {Math.round(info.gameDuration%60)}s</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-2">
                    <div className="flex gap-2">
                        <div className="relative">
                            <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-15" />
                            <p className="absolute text-sm right-0 bottom-0 transform translate-x-[4px] translate-y-[4px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <SummonerSpellImage spellId={participant.summoner1Id} classes="h-7" />
                            <SummonerSpellImage spellId={participant.summoner2Id} classes="h-7" />
                        </div>
                        {participant.perks.styles[0].style ? (
                            <div className="flex flex-col gap-1">
                                <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-7" />
                                <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-7" />
                            </div>
                        ) : (
                            <></>
                        )}
                        <div className="flex gap-2 items-center">
                            <div className="text-center pr-2">
                                <div className="flex items-center">
                                    <p className="font-bold text-xl">{participant.kills}</p>
                                    <p className="text-xl text-neutral-400 px-2">/</p> 
                                    <p className="text-red-500 font-bold text-xl">{participant.deaths}</p> 
                                    <p className="text-xl text-neutral-400 px-2">/</p> 
                                    <p className="font-bold text-xl">{participant.assists}</p>
                                </div>
                                {participant.deaths === 0 ? (
                                    <p className="text-md text-neutral-400">Perfect</p>
                                ) : (
                                    <p className="text-md text-neutral-400">{((participant.kills + participant.assists) / participant.deaths).toFixed(2)}:1 KDA</p>
                                )}
                            </div>
                            <div className="border-l-1 border-neutral-600 pl-2 text-md text-neutral-300">
                                <p>CS {participant.totalMinionsKilled + participant.neutralMinionsKilled} ({((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)})</p>
                                <p>KP {killParticipation}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <ItemImage itemId={participant.item0} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item1} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item2} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item3} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item4} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item5} matchWon={participant.win} classes="h-8" />
                        <ItemImage itemId={participant.item6} matchWon={participant.win} classes="h-8" />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 text-sm p-2">
                    {info.participants.filter((participant) => participant.teamId === 100).map(participant => (
                        <div key={participant.puuid}>
                            <Link to={`/lol/profile/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`} className="w-fit flex gap-0.5 items-center cursor-pointer hover:underline">
                                <ChampionImage championId={participant.championId} teamId={100} isTeamIdSame={true} classes="h-6" />
                                <p className={`${participant.puuid === puuid ? "text-purple-400" : ""}`}>
                                    {participant.riotIdGameName}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-0.5 text-sm p-2">
                    {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                        <div key={participant.puuid}>
                            <Link to={`/lol/profile/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`} className="w-fit flex gap-0.5 items-center cursor-pointer hover:underline">
                                <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-6" />
                                <p className={`${participant.puuid === puuid ? "text-purple-400" : ""}`}>
                                    {participant.riotIdGameName}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
                <div onClick={() => setShowDetailsDiv(prev => !prev)} className={`h-full flex items-end justify-end cursor-pointer ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"} transition-all duration-200 ${participant.win ? "hover:bg-[#28344E]" : "hover:bg-[#59343B]"}`}>
                    <img src={arrowdownlight} alt="arrow-down-light" className={`h-10 transform transition-transform ${showDetailsDiv ? "rotate-180" : ""}`} />
                </div>
            </div>
            {/* <div className={`bg-neutral-800 overflow-hidden transition-all duration-300 ease-in-out ${showDetailsDiv ? "max-h-[1000px] pt-2" : "max-h-0 pt-0"}`}> */}
            <div className={`bg-neutral-800 ${showDetailsDiv ? "block py-2" : "hidden"}`}>
                <div className="flex justify-around">
                    <p onClick={() => setChooseTab("General")} className={`${chooseTab === "General" ? "bg-neutral-600" : ""} text-xl px-4 py-2 rounded-xl cursor-pointer transition-all hover:text-neutral-300`}>General</p>
                    <p onClick={() => setChooseTab("Performance")} className={`${chooseTab === "Performance" ? "bg-neutral-600" : ""} text-xl px-4 py-2 rounded-xl cursor-pointer transition-all hover:text-neutral-300`}>Performance</p>
                    <p onClick={() => setChooseTab("Details")} className={`${chooseTab === "Details" ? "bg-neutral-600" : ""} text-xl px-4 py-2 rounded-xl cursor-pointer transition-all hover:text-neutral-300`}>Details</p>
                    <p onClick={() => setChooseTab("Runes")} className={`${chooseTab === "Runes" ? "bg-neutral-600" : ""} text-xl px-4 py-2 rounded-xl cursor-pointer transition-all hover:text-neutral-300`}>Runes</p>
                    <p onClick={() => setChooseTab("Timeline")} className={`${chooseTab === "Timeline" ? "bg-neutral-600" : ""} text-xl px-4 py-2 rounded-xl cursor-pointer transition-all hover:text-neutral-300`}>Timeline</p>
                </div>
                {chooseTab === "General" && (
                    <div className="mt-2 mb-1">
                        <MatchGeneral info={info} puuid={puuid} region={region} />
                    </div>
                )}
                {chooseTab === "Performance" && (
                    <div className="mt-2 mb-1">
                        <MatchPerformance info={info} puuid={puuid} />
                    </div>
                )}
                {chooseTab === "Details" && (
                    <div className="mt-2 mb-1">
                        <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                        <MatchDetails info={info} selectedPlayer={selectedPlayer} champions={champions} />
                    </div>
                )}
                {chooseTab === "Runes" && (
                    <div className="mt-2 mb-1">
                        <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                        <MatchRunes statPerks={selectedPlayer.perks.statPerks} styles={selectedPlayer.perks.styles} />
                    </div>
                )}
                {chooseTab === "Timeline" && (
                    <div className="mt-2 mb-1">
                        <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                        <MatchTimeline info={info} selectedPlayer={selectedPlayer} />
                    </div>
                )}
            </div>
        </>
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
    const allMatchesData = JSON.parse(apiData.allMatchesData) as Match[];
    // const challengesData = JSON.parse(apiData.challengesData);
    const spectatorData = JSON.parse(apiData.spectatorData);
    // const clashData = JSON.parse(apiData.clashData);
    const championStatsSoloDuoData = Object.values(JSON.parse(apiData.rankedSoloChampionStatsData)) as ChampionStats[];
    const championStatsFlexData = Object.values(JSON.parse(apiData.rankedFlexChampionStatsData)) as ChampionStats[];
    const preferredSoloDuoRoleData = Object.values(JSON.parse(apiData.rankedSoloRoleStatsData)) as PreferredRole[];
    const preferredFlexRoleData = Object.values(JSON.parse(apiData.rankedFlexRoleStatsData)) as PreferredRole[];
    // const allGamesChampionStatsData = Object.values(JSON.parse(apiData.allGamesChampionStatsData)) as ChampionStats[];
    // const allGamesRoleStatsData = Object.values(JSON.parse(apiData.allGamesRoleStatsData)) as PreferredRole[];

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
                                            <p className="font-bold text-lg">{rankedSoloDuoEntry.tier} {rankedSoloDuoEntry.rank} {rankedSoloDuoEntry.leaguePoints} LP</p>
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
                                            <p className="font-bold">{rankedFlexEntry.tier} {rankedFlexEntry.rank} {rankedFlexEntry.leaguePoints} LP</p>
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
                                                {/* <p>({championStat.Wins}W-{championStat.Games-championStat.Wins}L)</p> */}
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
                            <div className="flex flex-col gap-1 p-2">
                                {allMatchesData.map((match: Match) => (
                                    <MatchRow info={match.details.info} puuid={apiData.puuid} region={regionCode} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-neutral-800 mt-2">
                    <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                {/*     <pre>{JSON.stringify(entriesData, null, 2)}</pre>
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
                    <pre>{JSON.stringify(challengesData, null, 2)}</pre>*/}
                </div> 
            </div>
        </div>
    );
};

export default Summoner;
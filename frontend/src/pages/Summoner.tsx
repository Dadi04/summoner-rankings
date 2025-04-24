import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DD_VERSION, LOL_VERSION } from "../version";

import GameTimer from "../components/GameTime";
import ChampionImage from "../components/ChampionImage";
import SummonerSpellImage from "../components/SummonerSpellImage";
import RuneImage from "../components/RuneImage";
import SummonerProfileHeader from "../components/SummonerProfileHeader";
import IconImage from "../components/IconImage";
import RuneSlot from "../components/RuneSlot";
import ShardSlot from "../components/ShardSlot";

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
// import SummonerInfo from "../interfaces/SummonerInfo";

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
import arrow_going_up from "../assets/arrow-going-up.png";
import grubsicon from "../assets/monsters/icons/grubs.png";
import drakeicon from "../assets/monsters/icons/dragon.png";
import air_drakeicon from "../assets/monsters/icons/dragon_cloud.png";
import earth_drakeicon from "../assets/monsters/icons/dragon_mountain.png";
import fire_drakeicon from "../assets/monsters/icons/dragon_infernal.png";
import water_drakeicon from "../assets/monsters/icons/dragon_ocean.png";
import chemtech_drakeicon from "../assets/monsters/icons/dragon_chemtech.png";
import hextech_drakeicon from "../assets/monsters/icons/dragon_hextech.png";
import elder_drakeicon from "../assets/monsters/icons/dragon_elder.png";
import heraldicon from "../assets/monsters/icons/riftherald.png";
import baronicon from "../assets/monsters/icons/baron.png";
import atakhanicon from "../assets/monsters/icons/atakhan.png";
import turreticon from "../assets/monsters/icons/tower.png";
import inhibitoricon from "../assets/monsters/icons/inhibitor.png";
import grubsimg from "../assets/monsters/imgs/grubs.webp";
import air_drakeimg from "../assets/monsters/imgs/dragon_cloud.webp";
import earth_drakeimg from "../assets/monsters/imgs/dragon_mountain.webp";
import fire_drakeimg from "../assets/monsters/imgs/dragon_infernal.webp";
import water_drakeimg from "../assets/monsters/imgs/dragon_ocean.webp";
import chemtech_drakeimg from "../assets/monsters/imgs/dragon_chemtech.webp";
import hextech_drakeimg from "../assets/monsters/imgs/dragon_hextech.webp";
import elder_drakeimg from "../assets/monsters/imgs/dragon_elder.webp";
import heraldimg from "../assets/monsters/imgs/riftherald.png";
import baronimg from "../assets/monsters/imgs/baron.webp";
import atakhanimg from "../assets/monsters/imgs/atakhan.webp";
import red_turretimg from "../assets/monsters/imgs/red_tower.webp";
import blue_turretimg from "../assets/monsters/imgs/blue_tower.webp";
import red_nexusimg from "../assets/monsters/imgs/red_nexus.webp";
import blue_nexusimg from "../assets/monsters/imgs/blue_nexus.webp";
import red_inhibitorimg from "../assets/monsters/imgs/red_inhibitor.png";
import blue_inhibitorimg from "../assets/monsters/imgs/blue_inhibitor.webp";
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

type Role = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";  
const roleLabels: { role: Role; label: string }[] = [
    { role: "TOP", label: "Top" },
    { role: "JUNGLE", label: "Jungle" },
    { role: "MIDDLE", label: "Middle" },
    { role: "BOTTOM", label: "Bottom" },
    { role: "UTILITY", label: "Support" },
];  

const ItemImage: React.FC<{itemId: number; matchWon?: boolean; classes: string}> = ({itemId, matchWon, classes}) => {
    if (itemId === 0) {
        return (
            <div className={`h-8 w-8 ${matchWon ? "bg-[#2F436E]" : "bg-[#703C47]"} `}></div>
        );
    }

    return (
        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`} alt={`${itemId}`} className={classes} />
    );
}

const MatchGeneral: React.FC<{info: MatchInfo, timeline: any; puuid: string, region: string}> = ({info, timeline, puuid, region}) => {
    const blueSideWon = info.participants.find(p => p.teamId === 100)?.win;

    const blueTeamObjectives = info.teams.find(team => team.teamId === 100)?.objectives;
    const redTeamObjectives = info.teams.find(team => team.teamId === 200)?.objectives;
    let teamThatKilledAtakhan = null;

    const dragonTypes = ['AIR_DRAGON', 'EARTH_DRAGON', 'FIRE_DRAGON', 'WATER_DRAGON', 'CHEMTECH_DRAGON', 'HEXTECH_DRAGON', 'ELDER_DRAGON'];
    const dragonKills = {
        blue: Object.fromEntries(dragonTypes.map(type => [type.toLowerCase(), [] as any[]])),
        red: Object.fromEntries(dragonTypes.map(type => [type.toLowerCase(), [] as any[]]))
    };

    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        const atakhanKillEvent = frame.events.find((event: any) => event.type === "ELITE_MONSTER_KILL" && event.monsterType === "ATAKHAN");
        if (atakhanKillEvent) {
            teamThatKilledAtakhan = atakhanKillEvent.killerTeamId;
        }

        for (const event of frame.events) {
            if (event.type === "ELITE_MONSTER_KILL" && event.monsterType === "DRAGON") {
                const team = event.killerTeamId === 100 ? 'blue' : (event.killerTeamId === 200 ? 'red' : null);
                if (team && dragonTypes.includes(event.monsterSubType)) {
                    const dragonType = event.monsterSubType.toLowerCase();
                    dragonKills[team][dragonType].push(event);
                }
            }
        }
    }

    const blueTeamKills = {
        grubs: blueTeamObjectives?.horde.kills,
        dragon: blueTeamObjectives?.dragon.kills,
        air_dragon: dragonKills.blue.air_dragon.length,
        earth_dragon: dragonKills.blue.earth_dragon.length,
        fire_dragon: dragonKills.blue.fire_dragon.length,
        water_dragon: dragonKills.blue.water_dragon.length,
        chemtech_dragon: dragonKills.blue.chemtech_dragon.length,
        hextech_dragon: dragonKills.blue.hextech_dragon.length,
        elder_dragon: dragonKills.blue.elder_dragon.length,
        herald: blueTeamObjectives?.riftHerald.kills,
        baron: blueTeamObjectives?.baron.kills,
        atakhan: teamThatKilledAtakhan ? (teamThatKilledAtakhan === 100 ? 1 : 0) : 0,
        turret: blueTeamObjectives?.tower.kills,
        inhibitor: blueTeamObjectives?.inhibitor.kills
    };

    const redTeamKills = {
        grubs: redTeamObjectives?.horde.kills,
        dragon: redTeamObjectives?.dragon.kills,
        air_dragon: dragonKills.red.air_dragon.length,
        earth_dragon: dragonKills.red.earth_dragon.length,
        fire_dragon: dragonKills.red.fire_dragon.length,
        water_dragon: dragonKills.red.water_dragon.length,
        chemtech_dragon: dragonKills.red.chemtech_dragon.length,
        hextech_dragon: dragonKills.red.hextech_dragon.length,
        elder_dragon: dragonKills.red.elder_dragon.length,
        herald: redTeamObjectives?.riftHerald.kills,
        baron: redTeamObjectives?.baron.kills,
        atakhan: teamThatKilledAtakhan ? (teamThatKilledAtakhan === 100 ? 0 : 1) : 0,
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
                    <div className="flex gap-3 font-normal text-2xl text-neutral-200 py-2">
                        <div className="flex items-center">
                            <img src={grubsicon} alt="grubsicon" className="h-10" />
                            <p>{blueTeamKills.grubs}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={drakeicon} alt="drakeicon" className="h-10" />
                            <p>{blueTeamKills.dragon}</p>
                        </div>
                        {blueTeamKills.air_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={air_drakeicon} alt="air_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.air_dragon}</p>
                            </div>
                        )}
                        {blueTeamKills.earth_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={earth_drakeicon} alt="earth_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.earth_dragon}</p>
                            </div>
                        )}
                        {blueTeamKills.fire_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={fire_drakeicon} alt="fire_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.fire_dragon}</p>
                            </div>
                        )}
                        {blueTeamKills.water_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={water_drakeicon} alt="water_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.water_dragon}</p>
                            </div>
                        )}
                        {blueTeamKills.chemtech_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={chemtech_drakeicon} alt="chemtech_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.chemtech_dragon}</p>
                            </div>
                        )}
                        {blueTeamKills.hextech_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={hextech_drakeicon} alt="hextech_drakeicon" className="h-6" />
                                <p className="text-xl">{blueTeamKills.hextech_dragon}</p>
                            </div>
                        )}
                        {((blueTeamKills.dragon ?? 0) + (redTeamKills.dragon ?? 0) > 3) && (
                            <div className="flex items-center">
                                <img src={elder_drakeicon} alt="elder_drakeicon" className="h-10" />
                                <p>{blueTeamKills.elder_dragon}</p>
                            </div>
                        )}
                        <div className="flex items-center">
                            <img src={heraldicon} alt="heraldicon" className="h-10" />
                            <p>{blueTeamKills.herald}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={baronicon} alt="baronicon" className="h-10" />
                            <p>{blueTeamKills.baron}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={atakhanicon} alt="atakhanicon" className="h-10" />
                            <p>{blueTeamKills.atakhan}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={turreticon} alt="turreticon" className="h-10" />
                            <p>{blueTeamKills.turret}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={inhibitoricon} alt="inhibitoricon" className="h-10" />
                            <p>{blueTeamKills.inhibitor}</p>
                        </div>
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
                                        {/* <img src={`https://static.bigbrain.gg/assets/lol/ranks/s13/mini/${participant.entry.tier.toLowerCase()}.svg`} alt={participant.entry.tier.toLowerCase()} className="h-5" /> */}
                                        {/* <p className="capitalize">{participant.entry.tier.toLowerCase()} {participant.entry.rank} {participant.entry.leaguePoints} LP</p> */}
                                        <p className="capitalize">Level {participant.summonerLevel} (TODO RANK)</p>
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
                    <div className="flex gap-3 font-normal text-2xl text-neutral-200 py-2">
                        <div className="flex items-center">
                            <img src={grubsicon} alt="grubsicon" className="h-10" />
                            <p>{redTeamKills.grubs}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={drakeicon} alt="drakeicon" className="h-10" />
                            <p>{redTeamKills.dragon}</p>
                        </div>
                        {redTeamKills.air_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={air_drakeicon} alt="air_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.air_dragon}</p>
                            </div>
                        )}
                        {redTeamKills.earth_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={earth_drakeicon} alt="earth_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.earth_dragon}</p>
                            </div>
                        )}
                        {redTeamKills.fire_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={fire_drakeicon} alt="fire_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.fire_dragon}</p>
                            </div>
                        )}
                        {redTeamKills.water_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={water_drakeicon} alt="water_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.water_dragon}</p>
                            </div>
                        )}
                        {redTeamKills.chemtech_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={chemtech_drakeicon} alt="chemtech_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.chemtech_dragon}</p>
                            </div>
                        )}
                        {redTeamKills.hextech_dragon > 0 && (
                            <div className="flex items-center">
                                <img src={hextech_drakeicon} alt="hextech_drakeicon" className="h-6" />
                                <p className="text-xl">{redTeamKills.hextech_dragon}</p>
                            </div>
                        )}
                        {((blueTeamKills.dragon ?? 0) + (redTeamKills.dragon ?? 0) > 3) && (
                            <div className="flex items-center">
                                <img src={elder_drakeicon} alt="elder_drakeicon" className="h-10" />
                                <p>{redTeamKills.elder_dragon}</p>
                            </div>
                        )}
                        <div className="flex items-center">
                            <img src={heraldicon} alt="heraldicon" className="h-10" />
                            <p>{redTeamKills.herald}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={baronicon} alt="baronicon" className="h-10" />
                            <p>{redTeamKills.baron}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={atakhanicon} alt="atakhanicon" className="h-10" />
                            <p>{redTeamKills.atakhan}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={turreticon} alt="turreticon" className="h-10" />
                            <p>{redTeamKills.turret}</p>
                        </div>
                        <div className="flex items-center">
                            <img src={inhibitoricon} alt="inhibitoricon" className="h-10" />
                            <p>{redTeamKills.inhibitor}</p>
                        </div>
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
                                        {/* <img src={`https://static.bigbrain.gg/assets/lol/ranks/s13/mini/${participant.entry.tier.toLowerCase()}.svg`} alt={participant.entry.tier.toLowerCase()} className="h-5" /> */}
                                        {/* <p className="capitalize">{participant.entry.tier.toLowerCase()} {participant.entry.rank} {participant.entry.leaguePoints} LP</p> */}
                                        <p className="capitalize">Level {participant.summonerLevel} (TODO RANK (CANCER))</p>
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

const MatchDetails: React.FC<{info: MatchInfo, timeline: any, selectedPlayer: MatchParticipant, champions: any[]}> = ({info, timeline, selectedPlayer, champions}) => {
    console.log(timeline, info)
    const champ = champions.find(c => c.id.toLowerCase() === selectedPlayer.championName.toLowerCase());
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
    
    const everyBuildOrder: Record<number, any[]> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        for (const e of frame.events) {
            if ((e.type === "ITEM_PURCHASED" || e.type === "ITEM_SOLD")) {
                const playerId = e.participantId;

                if (!everyBuildOrder[playerId]) {
                    everyBuildOrder[playerId] = [];
                }

                everyBuildOrder[playerId].push(e);
            }
        }
    }
    const buildOrder = everyBuildOrder[selectedPlayer.participantId];

    const buildOrderByMinute: Record<number, typeof buildOrder> = buildOrder.reduce((acc, e) => {
            const minute = Math.floor(e.timestamp / 60_000);
            if (!acc[minute]) acc[minute] = [];
            acc[minute].push(e);
            return acc;
    }, {} as Record<number, typeof buildOrder>);
    const minutes = Object.keys(buildOrderByMinute).map((m) => parseInt(m, 10)).sort((a, b) => a - b);

    const everySkillOrder: Record<number, any[]> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        for (const e of frame.events) {
            if (e.type === "SKILL_LEVEL_UP") {
                const playerId = e.participantId;

                if (!everySkillOrder[playerId]) {
                    everySkillOrder[playerId] = [];
                }

                everySkillOrder[playerId].push(e);
            }
        }
    }
    const skillOrder = everySkillOrder[selectedPlayer.participantId] ?? [];
    skillOrder.forEach((evt, idx) => {evt.championLevel = idx + 1;});

    const levelsBySlot: Record<number, number[]> = {};
    skillOrder.forEach(evt => {
        const slot = evt.skillSlot;
        levelsBySlot[slot] ||= [];
        levelsBySlot[slot].push(evt.championLevel);
    });

    const min15 = timeline.info.frames[15];
    const csDiffs   = [] as number[];
    const goldDiffs = [] as number[];
    const xpDiffs   = [] as number[];
    for (let i = 1; i <= 5; i++) {
        const blueFrame = min15.participantFrames[i];
        const redFrame  = min15.participantFrames[i + 5];
        csDiffs.push((blueFrame.minionsKilled + blueFrame.jungleMinionsKilled) - (redFrame.minionsKilled + redFrame.jungleMinionsKilled));
        goldDiffs.push(blueFrame.totalGold - redFrame.totalGold);
        xpDiffs.push(blueFrame.xp - redFrame.xp);
    }
    
    const firstTime: Record<number, number> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        for (const e of frame.events) {
            if (e.type === "LEVEL_UP" && e.level === 2) {
                const playerId = e.participantId;
                if (firstTime[playerId] === undefined || e.timestamp < firstTime[playerId]) {
                    firstTime[playerId] = e.timestamp;
                }
            }
        }
    }
    const firstLv2s = Array.from({ length: 5 }, (_, i) => {
        const blueTime = firstTime[i + 1];
        const redTime  = firstTime[i + 6];
        return blueTime < redTime ? "Yes" : "No";
    });

    const rawIndex = (selectedPlayer.participantId - 1) % 5;
    const sign = selectedPlayer.teamId === 100 ? 1 : -1;
    const cs = csDiffs[rawIndex] * sign;
    const gold = goldDiffs[rawIndex] * sign;
    const xp = xpDiffs[rawIndex] * sign;
    const firstLv2 = selectedPlayer.teamId === 100 ? firstLv2s[rawIndex] : (firstLv2s[rawIndex] === "Yes" ? "No" : "Yes");

    return (
        <>
            <div>
                <div className="flex justify-between gap-2 my-2">
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">LANING PHASE (AT 15)</h1>
                        <div className="flex justify-between">
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{cs > 0 ? "+" : ""}{cs}</p>
                                <p className="text-neutral-400">cs diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{gold > 0 ? "+" : ""}{gold}</p>
                                <p className="text-neutral-400">gold diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{xp > 0 ? "+" : ""}{xp}</p>
                                <p className="text-neutral-400">xp diff</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{firstLv2}</p>
                                <p className="text-neutral-400">first lvl 2</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">WARDS</h1>
                        <div className="flex justify-between">
                            <div className="w-[33%] text-center">
                                <p className="font-semibold text-lg">{selectedPlayer.wardsPlaced-selectedPlayer.detectorWardsPlaced}</p>
                                <p className="text-neutral-400">placed</p>
                            </div>
                            <div className="w-[33%] text-center">
                                <p className="font-semibold text-lg">{selectedPlayer.wardsKilled}</p>
                                <p className="text-neutral-400">killed</p>
                            </div>
                            <div className="w-[33%] text-center">
                                <p className="font-semibold text-lg">{selectedPlayer.detectorWardsPlaced}</p>
                                <p className="text-neutral-400">control</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[33%] bg-neutral-700 p-2">
                        <h1 className="text-xl text-neutral-300 mb-2">GLOBAL STATS</h1>
                        <div className="flex justify-between">
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{((selectedPlayer.totalMinionsKilled+selectedPlayer.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">CS/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{(selectedPlayer.visionScore/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">VS/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{(selectedPlayer.totalDamageDealtToChampions/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">DMG/min</p>
                            </div>
                            <div className="w-[25%] text-center">
                                <p className="font-semibold text-lg">{(selectedPlayer.goldEarned/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">gold/min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-neutral-700 my-2 p-2">
                <h1 className="text-xl text-neutral-300 mb-2">BUILD ORDER</h1>
                <div className="m-auto w-[90%] flex justify-center flex-wrap">
                    {minutes.map((minute, index) => (
                        <div className="flex gap-2">
                            <div key={minute} className="flex flex-col items-center p-2 ml-2">
                                <div className="flex items-center">
                                    {buildOrderByMinute[minute].map(item => (
                                        <div key={item.eventId} className="relative">
                                            <ItemImage itemId={item.itemId} classes={item.type === 'ITEM_SOLD' ? 'h-10 filter grayscale brightness-70' : 'h-10'} />
                                            {item.type === 'ITEM_SOLD' && (
                                                <svg className="absolute bottom-0 left-0 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <line x1="4" y1="4" x2="20" y2="20" stroke="red" strokeWidth="3" />
                                                    <line x1="20" y1="4" x2="4" y2="20" stroke="red" strokeWidth="3" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <h3 className="font-semibold mb-1 text-neutral-300">{minute}m</h3>
                            </div>
                            {index < minutes.length - 1 && (
                                <svg className="h-14 w-6 text-neutral-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <polyline points="8 4 16 12 8 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-neutral-700 my-2 p-2 pb-4">
                <h1 className="text-xl text-neutral-300 mb-2">SKILL ORDER</h1>
                <div className="w-full flex flex-col gap-2">
                    {spells.map((spell: any, i: number) => {
                        const slot = i + 1;
                        const takenAtLevels = levelsBySlot[slot] || [];

                        return (
                            <div className="flex gap-2 justify-center">
                                <div className="relative w-fit">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spell.image.full}`} alt={spell.image.full} className="h-12"/>
                                    <p className="absolute bottom-0 right-0 transform px-1 text-md bg-black rounded-full">{['Q','W','E','R'][i]}</p>
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: 18 }, (_, idx) => {
                                        const level = idx + 1;
                                        const isTakenHere = takenAtLevels.includes(level);

                                        return (
                                            <div key={idx} className={`h-12 w-12 ${isTakenHere ? 'bg-purple-600 text-white flex items-center justify-center' : 'bg-neutral-800'}`}>
                                                {isTakenHere ? level : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex my-1 gap-2 items-stretch">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="bg-neutral-700 p-2 pb-7">
                        <h1 className="text-xl text-neutral-300 mb-4">SPELLS CASTED</h1>
                        <div className="flex justify-around">
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[0].image.full}`} alt={spells[0].image.full} />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">Q</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell1Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[1].image.full}`} alt={spells[1].image.full} />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">W</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell2Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[2].image.full}`} alt={spells[2].image.full} />
                                    <p className="w-fit px-1 text-lg bg-black rounded-full absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/3">E</p>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="font-bold">{selectedPlayer.spell3Casts}</p>
                                    <p className="text-neutral-400">times</p>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spells[3].image.full}`} alt={spells[3].image.full} />
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

const MatchTimeline: React.FC<{timeline: any; info: MatchInfo; selectedPlayer: MatchParticipant; items: any;}> = ({timeline, info, selectedPlayer, items}) => {
    const CHECKBOXES = [
        { id: 'kills', label: 'Kills' },
        { id: 'objectives', label: 'Objectives' },
        { id: 'all-players', label: 'All Players' },
        { id: 'vision', label: 'Vision' },
        { id: 'items', label: 'Items' },
    ];

    const getPlayerId = (event: any) => event.participantId ?? event.killerId ?? event.creatorId;

    const everyTimeline: Record<number, any[]> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;
    
        for (const event of frame.events) {
          if (['ITEM_DESTROYED', 'ITEM_UNDO', 'LEVEL_UP', 'SKILL_LEVEL_UP'].includes(event.type)) continue;
    
          const playerId = getPlayerId(event);
          if (!playerId) continue;
    
          if (!everyTimeline[playerId]) everyTimeline[playerId] = [];
          everyTimeline[playerId].push(event);
        }
    }
    const playerTimeline = everyTimeline[selectedPlayer.participantId];
    console.log(playerTimeline)

    return (
        <>  
            <div className="flex justify-center gap-5 mb-4 mt-2">
                {CHECKBOXES.map(({ id, label }) => (
                    <div key={id} className="checkbox-wrapper-37">
                        <input type="checkbox" id={id} />
                        <label htmlFor={id} className="terms-label">
                            <svg className="checkbox-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask" fill="white">
                                    <rect width="200" height="200" />
                                </mask>
                                <rect width="200" height="200" className="checkbox-box" strokeWidth="40" mask="url(#mask)" />
                                <path className="checkbox-tick" d="M52 111.018L76.9867 136L149 64" strokeWidth="15" />
                            </svg>
                            <span className="ml-1 text-lg">{label}</span>
                        </label>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 p-2">
                <div className="flex-1 h-[500px] overflow-y-auto custom-scrollbar">
                    {playerTimeline.map((event: any, i: number) => {
                        const minutes = Math.round(event.timestamp / 60000);

                        return (
                            <div>
                                {(event.type === "CHAMPION_KILL") && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full p-2 gap-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">killed</p>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={info.participants[event.victimId-1].championId} teamId={info.participants[event.victimId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{info.participants[event.victimId-1].riotIdGameName}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {event.type === "ITEM_PURCHASED" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full p-2 gap-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">purchased</p>
                                            <ItemImage itemId={event.itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                            <p className="text-sm text-gray-200">{items[event.itemId]?.name || "Unknown Item"}</p>
                                        </div>
                                    </div>
                                )}
                                {event.type === "ITEM_SOLD" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full p-2 gap-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">sold</p>
                                            <div className="relative">
                                                <ItemImage itemId={event.itemId} matchWon={selectedPlayer.win} classes="h-10 filter grayscale brightness-70" />
                                                <svg className="absolute bottom-0 left-0 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <line x1="4" y1="4" x2="20" y2="20" stroke="red" strokeWidth="3" />
                                                    <line x1="20" y1="4" x2="4" y2="20" stroke="red" strokeWidth="3" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-200">{items[event.itemId]?.name || "Unknown Item"}</p>
                                        </div>
                                    </div>
                                )}
                                {event.type === "WARD_PLACED" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">placed</p>
                                            {event.wardType === "YELLOW_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Stealth Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "CONTROL_WARD" && (
                                                <>
                                                    <ItemImage itemId={2055} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Control Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "BLUE_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3363} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Farsight Alteration</p>
                                                </>
                                            )}
                                            {/* wtf fix ward trinket support item */}
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">{event.wardType}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "WARD_KILL" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">destroyed</p>
                                            {event.wardType === "YELLOW_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Stealth Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "CONTROL_WARD" && (
                                                <>
                                                    <ItemImage itemId={2055} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Control Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "BLUE_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3363} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Farsight Alteration</p>
                                                </>
                                            )}
                                            {/* wtf fix ward trinket support item */}
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">{event.wardType}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "BUILDING_KILL" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">destroyed</p>
                                            {event.buildingType === "TOWER_BUILDING" && (
                                                <>
                                                    {event.teamId === 200 ? (
                                                        <img src={red_turretimg} alt="red_turretimg" className="h-10" />
                                                    ) : (
                                                        <img src={blue_turretimg} alt="blue_turretimg" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {event.buildingType === "INHIBITOR_BUILDING" && (
                                                <>
                                                    {event.teamId === 200 ? (
                                                        <img src={red_inhibitorimg} alt="red_inhibitorimg" className="h-10" />
                                                    ) : (
                                                        <img src={blue_inhibitorimg} alt="blue_inhibitorimg" className="h-10" />
                                                    )}
                                                    <p className="text-sm text-gray-200">Inhibitor</p>
                                                </>
                                            )}
                                            {event.buildingType === "NEXUS_BUILDING" && (
                                                <>
                                                    {event.teamId === 200 ? (
                                                        <img src={red_nexusimg} alt="red_nexusimg" className="h-10" />
                                                    ) : (
                                                        <img src={blue_nexusimg} alt="blue_nexusimg" className="h-10" />
                                                    )}
                                                    <p className="text-sm text-gray-200">Nexus</p>
                                                </>
                                            )}
                                            {event.towerType === "OUTER_TURRET" && (
                                                <p className="text-sm text-gray-200">Outer Tower</p>
                                            )}
                                            {event.towerType === "INNER_TURRET" && (
                                                <p className="text-sm text-gray-200">Inner Tower</p>
                                            )}
                                            {event.towerType === "BASE_TURRET" && (
                                                <p className="text-sm text-gray-200">Inhibitor Tower</p>
                                            )}
                                            {event.towerType === "NEXUS_TURRET" && (
                                                <p className="text-sm text-gray-200">Nexus Tower</p>
                                            )}
                                            {event.laneType === "TOP_LANE" && (
                                                <>
                                                    <p className="text-sm text-gray-200">on</p>
                                                    <img src={`https://dpm.lol/position/TOP.svg`} alt="TOP" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                            {event.laneType === "MID_LANE" && (
                                                <>
                                                    <p className="text-sm text-gray-200">on</p>
                                                    <img src={`https://dpm.lol/position/MIDDLE.svg`} alt="MIDDLE" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                            {event.laneType === "BOT_LANE" && (
                                                <>
                                                    <p className="text-sm text-gray-200">on</p>
                                                    <img src={`https://dpm.lol/position/BOTTOM.svg`} alt="BOTTOM" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "TURRET_PLATE_DESTROYED" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">destroyed a plate on</p>
                                            {event.laneType === "TOP_LANE" && (
                                                <>
                                                    <img src={`https://dpm.lol/position/TOP.svg`} alt="TOP" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                            {event.laneType === "MID_LANE" && (
                                                <>
                                                    <img src={`https://dpm.lol/position/MIDDLE.svg`} alt="MIDDLE" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                            {event.laneType === "BOT_LANE" && (
                                                <>
                                                    <img src={`https://dpm.lol/position/BOTTOM.svg`} alt="BOTTOM" className="h-10" />
                                                    <p className="text-sm text-gray-200">lane</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "ELITE_MONSTER_KILL" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">killed</p>
                                            {event.monsterType === "HORDE" && (
                                                <>
                                                    <img src={grubsimg} alt="grubsimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Void Grub</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "AIR_DRAGON") && (
                                                <>
                                                    <img src={air_drakeimg} alt="air_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Cloud Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "EARTH_DRAGON") && (
                                                <>
                                                    <img src={earth_drakeimg} alt="earth_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Moutain Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "FIRE_DRAGON") && (
                                                <>
                                                    <img src={fire_drakeimg} alt="fire_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Infernal Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "WATER_DRAGON") && (
                                                <>
                                                    <img src={water_drakeimg} alt="water_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Ocean Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "HEXTECH_DRAGON") && (
                                                <>
                                                    <img src={hextech_drakeimg} alt="hextech_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Hextech Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "CHEMTECH_DRAGON") && (
                                                <>
                                                    <img src={chemtech_drakeimg} alt="chemtech_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Chemtech Drake</p>
                                                </>
                                            )}
                                            {(event.monsterType === "DRAGON" && event.monsterSubType === "ELDER_DRAGON") && (
                                                <>
                                                    <img src={elder_drakeimg} alt="elder_drakeimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Elder Drake</p>
                                                </>
                                            )}
                                            {event.monsterType === "RIFTHERALD" && (
                                                <>
                                                    <img src={heraldimg} alt="heraldimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Rift Herald</p>
                                                </>
                                            )}
                                            {event.monsterType === "BARON_NASHOR" && (
                                                <>
                                                    <img src={baronimg} alt="baronimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Baron Nashor</p>
                                                </>
                                            )}
                                            {event.monsterType === "ATAKHAN" && (
                                                <>
                                                    <img src={atakhanimg} alt="atakhanimg" className="h-10" />
                                                    <p className="text-sm text-gray-200">Atakhan</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "CHAMPION_SPECIAL_KILL" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full gap-2 p-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            {event.killType === "KILL_FIRST_BLOOD" && (
                                                <p className="text-sm text-white">got First Blood</p>
                                            )}
                                            {event.killType === "KILL_ACE" && (
                                                <p className="text-sm text-white">got Kill Ace</p>
                                            )}
                                            {event.multiKillLength === 2 && (
                                                <p className="text-sm text-white">got Double Kill</p>
                                            )}
                                            {event.multiKillLength === 3 && (
                                                <p className="text-sm text-white">got Double Kill</p>
                                            )}
                                            {event.multiKillLength === 4 && (
                                                <p className="text-sm text-white">got Double Kill</p>
                                            )}
                                            {event.multiKillLength === 5 && (
                                                <p className="text-sm text-white">got Double Kill</p>
                                            )}
                                            {event.multiKillLength > 5 && (
                                                <p className="text-sm text-white">killed {event.multiKillLength} Players</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div>
                    <img src={map} alt="summonersrift" className="h-[500px] object-contain" />
                </div>
            </div>
        </>
    );
}

const MatchRow: React.FC<{info: MatchInfo; timelineJson: string; items: any; puuid: string; region: string;}> = ({info, timelineJson, items, puuid, region}) => {
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
      
    const timeline = JSON.parse(timelineJson);

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
                    <div>
                        {(info.queueId > 400 && info.queueId < 500) ? (
                            <div className="mt-2 mb-1">
                                <MatchGeneral info={info} timeline={timeline} puuid={puuid} region={region} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
                    </div>
                )}
                {chooseTab === "Performance" && (
                    <div>
                        {(info.queueId > 400 && info.queueId < 500) ? (
                            <div className="mt-2 mb-1">
                                <MatchPerformance info={info} puuid={puuid} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
                    </div>
                )}
                {chooseTab === "Details" && (
                    <div>
                        {(info.queueId > 400 && info.queueId < 500) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                                <MatchDetails info={info} timeline={timeline} selectedPlayer={selectedPlayer} champions={champions} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
                    </div>
                )}
                {chooseTab === "Runes" && (
                    <div>
                        {(info.queueId > 400 && info.queueId < 500) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                                <MatchRunes statPerks={selectedPlayer.perks.statPerks} styles={selectedPlayer.perks.styles} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
                    </div>
                )}
                {chooseTab === "Timeline" && (
                    <div>
                        {(info.queueId > 400 && info.queueId < 500) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} />
                                <MatchTimeline timeline={timeline} info={info} selectedPlayer={selectedPlayer} items={items} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
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
    const [items, setItems] = useState<any>({});
    const [showSelectChampions, setShowSelectChampions] = useState<boolean>(false);
    const [paginatorPage, setPaginatorPage] = useState<number>(1);
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
        const fetchItems = async () => {
            try {
                const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/item.json`);
                const json = await res.json();
                setItems(json.data);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
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

    console.log("apiData", apiData);

    // const clashData = apiData.clashData;
    const championStatsSoloDuoData = Object.values(apiData.rankedSoloChampionStatsData);
    const championStatsFlexData = Object.values(apiData.rankedFlexChampionStatsData);
    const preferredSoloDuoRoleData = Object.values(apiData.rankedSoloRoleStatsData);
    const preferredFlexRoleData = Object.values(apiData.rankedFlexRoleStatsData);
    // const summonerData: SummonerInfo = apiData.summonerData;
    const entriesData: Entry[] = apiData.entriesData;
    const topMasteriesData: Mastery[] = apiData.topMasteriesData;
    // const allMatchIds: string[] = apiData.allMatchIds;
    const allMatchesData: Match[] = apiData.allMatchesData;
    const spectatorData = apiData.spectatorData;
    
    championStatsSoloDuoData.sort((a: ChampionStats, b: ChampionStats) => b.games - a.games || b.winRate - a.winRate);
    championStatsFlexData.sort((a: ChampionStats, b: ChampionStats) => b.games - a.games || b.winRate - a.winRate);

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
    
    const totalPlayerKills = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.kills ?? 0)
    }, 0);
    const totalPlayerDeaths = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.deaths ?? 0)
    }, 0);
    const totalPlayerAssists = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.assists ?? 0)
    }, 0);
    const avgKDA = totalPlayerDeaths > 0 ? ((totalPlayerKills + totalPlayerAssists) / totalPlayerDeaths).toFixed(2) : "Perfect";

    const totalKills = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        if (player) {
            const playerTeamId = player.teamId;
            const teamKills = match.details.info.participants.filter(p => p.teamId === playerTeamId).reduce((teamSum, teammate) => teamSum + (teammate.kills || 0), 0);  
            
            return sum + teamKills;
        }
        return sum;
    }, 0);
    const avgKP = Math.round((totalPlayerAssists+totalPlayerKills)/totalKills*100);

    const champStats = new Map<number, ChampionStats>();
    for (const match of allMatchesData) {
        const p = match.details.info.participants.find((player) => player.puuid === apiData.puuid);
        if (!p) continue;
        const { championId: id, championName: name, win, kills, deaths, assists } = p;

        if (!champStats.has(id)) {
            champStats.set(id, {
              championId: id,
              championName: name,
              games: 0,
              wins: 0,
              totalKills: 0,
              totalDeaths: 0,
              totalAssists: 0,
              winRate: 0,
              averageKDA: 0,
            });
        }
        const entry = champStats.get(id)!;
        entry.games += 1;
        if (win) entry.wins += 1;
        entry.totalKills   += kills;
        entry.totalDeaths  += deaths;
        entry.totalAssists += assists;
    }

    for (const entry of champStats.values()) { 
        entry.winRate = (entry.wins / entry.games) * 100;
        entry.averageKDA = entry.totalDeaths > 0 ? (entry.totalKills + entry.totalAssists) / entry.totalDeaths : entry.totalKills + entry.totalAssists;
    }

    const top3 = Array.from(champStats.values()).sort((a, b) => {
        if (b.games !== a.games) {
          return b.games - a.games;
        }
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        return b.averageKDA - a.averageKDA;
    }).slice(0, 3);

    const roleCounts = roleLabels.reduce((acc, { role }) => {
        acc[role] = 0;
        return acc;
    }, {} as Record<Role, number>);

    allMatchesData.forEach(match => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        if (player) {
            roleCounts[player.teamPosition as Role]++;
        }
    });
    const totalGames = allMatchesData.length;  

    const rolePercents: Record<Role, number> = {} as any;
    (roleLabels as typeof roleLabels).forEach(({ role }) => {rolePercents[role] = totalGames > 0 ? Math.round((roleCounts[role] / totalGames) * 100) : 0;});

    const totalPages = Math.round(apiData.totalMatches / apiData.pageSize);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const allWins = allMatchesData.reduce((sum, match) => {
        const player = match.details.info.participants.find(p => p.puuid === apiData.puuid);
        return sum + (player?.win ? 1 : 0)
    }, 0);
    const winratePercent = Math.round(allWins / totalGames * 100);
    const winAngle = winratePercent * 1.8;

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
                            <div className="flex justify-between p-2 items-center">
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
                                <div className="grid grid-cols-[28%_26%_26%_20%] mb-1 pr-5 text-neutral-400 text-lg">
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
                                {championsStatsData.slice(0, 5).map((championStat: ChampionStats, index: number) => {
                                    return (
                                        <div key={championStat.championId}>
                                            { index !== 0 && <hr /> }
                                            <div className="grid grid-cols-[28%_26%_26%_20%] pr-5 mb-1 mt-1 items-center text-center">
                                                <div className="flex justify-center">
                                                    <ChampionImage championId={championStat.championId} isTeamIdSame={true} classes="h-15" />
                                                </div>
                                                <div>
                                                    <p className={`${getKDAColor(Math.round(championStat.averageKDA*100)/100)}`}>
                                                        {Math.round(championStat.averageKDA*100)/100}:1
                                                    </p>
                                                    <div className="flex justify-center gap-1 items-center">
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalKills/championStat.games*10)/10}</p>
                                                        <p className="text-neutral-400 text-sm">/</p>
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalDeaths/championStat.games*10)/10}</p>
                                                        <p className="text-neutral-400 text-sm">/</p>
                                                        <p className="text-neutral-200 text-md">{Math.round(championStat.totalAssists/championStat.games*10)/10}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {championStat.games}
                                                </div>
                                                <div className={`${getWinrateColor(Math.round(championStat.winRate), championStat.games)}`}>
                                                    <p>{Math.round(championStat.winRate)}%</p> 
                                                    {/* <p>({championStat.Wins}W-{championStat.Games-championStat.Wins}L)</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="flex w-full text-xl justify-center p-2 bg-neutral-700 transition-all duration-150 ease-in hover:bg-neutral-600">
                                    See More Champions
                                </Link>
                            </div>
                        </div>
                        <div className="bg-neutral-800 pb-2">
                            <div className="flex justify-between mb-1 p-2 items-center">
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
                            <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 text-center text-neutral-400 text-lg">
                                <p></p>
                                <p>Role</p>
                                <p>Games</p>
                                <p>Winrate</p>
                                <p></p>
                            </div>
                            <div>
                                {preferredRoleData.sort((a: PreferredRole, b: PreferredRole) => b.games - a.games).map((role: PreferredRole) => (
                                    <div className="grid grid-cols-[20%_23%_23%_23%_10%] mb-1 items-center text-center">
                                        <div className="flex justify-end">
                                            <img src={`https://dpm.lol/position/${role.roleName}.svg`} alt={role.roleName} className="h-[35px]" />
                                        </div>
                                        <div>
                                            <p className="capitalize">{role.roleName === "UTILITY" ? "support" : role.roleName.toLowerCase()}</p>
                                        </div>
                                        <div>
                                            <p>{role.games}</p>
                                        </div>
                                        <div className={getWinrateColor(Math.round(role.winRate), role.games)}>
                                            <p>{Math.round(role.winRate)}%</p>
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
                                            <div className="relative">
                                                <img src={`https://opgg-static.akamaized.net/images/champion_mastery/renew_v2/mastery-${mastery.championLevel > 10 ? 10 : mastery.championLevel}.png`} alt={`${mastery.championLevel}`} className="h-15" />
                                                {mastery.championLevel > 10 && (
                                                    <p className="text-sm bg-neutral-900 pl-2 pr-2 absolute transform bottom-0 left-1/2 -translate-x-1/2">{mastery.championLevel}</p>
                                                )}
                                                {/* <p className="text-center text-sm">{mastery.championPoints}</p> */}
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
                        <div className="bg-neutral-800 text-center p-2 pb-4 mb-2 border-b-6 border-purple-600 rounded-b-lg shadow-xl">
                            <div className="flex justify-center items-center gap-2 p-2">
                                <img src={arrow_going_up} alt="arrow_going_up" className="h-8" />
                                <h1 className="text-lg">Last 20 Games Pefrormance</h1>
                            </div>
                            <div className="grid grid-cols-[25%_25%_25%_25%]">
                                <div className="flex flex-col items-center justify-center space-y-10 relative">
                                    <div className="relative w-52 h-52 rounded-full" style={{ background: `conic-gradient( #ef4444 0deg ${winAngle}deg, #3b82f6 ${winAngle}deg 360deg)`}}>
                                        <div className="absolute inset-0 m-auto w-40 h-40 bg-neutral-800 rounded-full flex items-center justify-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className={`text-xl font-semibold m-0 ${getWinrateColor(winratePercent, totalGames)}`}>
                                                    {winratePercent}%
                                                </p>
                                                <p className="text-neutral-400 text-lg mb-2">Winrate</p>
                                                <p className="text-xl text-neutral-300 font-semibold">
                                                    {allWins}W - {totalGames - allWins}L
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-full justify-center gap-4">
                                    {top3.map(champStats => (
                                        <div className="flex items-center justify-center gap-4">
                                            <ChampionImage championId={champStats.championId} teamId={200} isTeamIdSame={true} classes="h-13" />
                                            <div className="flex flex-col text-lg">
                                                <div className="flex gap-2">
                                                    <p className={`${getWinrateColor(champStats.winRate, champStats.games)}`}>{Math.round(champStats.winRate)}%</p>
                                                    <p className="text-neutral-400">{champStats.wins}W-{champStats.games-champStats.wins}L</p>
                                                </div>
                                                <div>
                                                    <p className={`text-left ${getKDAColor(champStats.averageKDA)}`}>{champStats.averageKDA.toFixed(1)} KDA</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-lg">KDA</p>
                                    <p className="text-6xl text-purple-400 font-semibold mt-12 mb-5">{avgKDA}</p>
                                    <div className="flex items-center justify-center">
                                        <p className="text-xl">{(totalPlayerKills/apiData.pageSize).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl text-purple-300">{(totalPlayerDeaths/apiData.pageSize).toFixed(1)}</p>
                                        <p className="text-md text-neutral-600 px-2">/</p>
                                        <p className="text-xl">{(totalPlayerAssists/apiData.pageSize).toFixed(1)}</p>
                                    </div>
                                    <p className="text-neutral-400 mt-4">Average Kill Participation {avgKP}%</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-lg">Preferred Roles</p>
                                    <div className="space-y-2 p-2">
                                        {roleLabels.map(({ role, }) => {
                                            const percent = rolePercents[role];
                                            return (
                                                <div key={role}>
                                                    <div className="flex justify-between mb-1 text-sm text-neutral-300 items-center">
                                                        <img src={`https://dpm.lol/position/${role}.svg`} alt="" />
                                                        <span>{percent}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                                    <MatchRow info={match.details.info} timelineJson={match.timelineJson} items={items} puuid={apiData.puuid} region={regionCode} />
                                ))}
                            </div>
                            <div className="flex justify-center">
                                <ul className="flex items-center h-10 text-base">
                                    <li>
                                        <span onClick={() => setPaginatorPage((prev) => Math.max(prev - 1, 1))} className="flex items-center justify-center px-4 h-10 leading-tight border cursor-pointer transition-all border-gray-300 rounded-s-lg hover:bg-neutral-900 hover:text-neutral-100">
                                            <span className="sr-only">Previous</span>
                                            <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                                            </svg>
                                        </span>
                                    </li>
                                    {pageNumbers.map((page: number) => (
                                        <li key={page} onClick={() => setPaginatorPage(page)}>
                                            <span className={`flex items-center justify-center px-4 h-10 leading-tight border-y border-r cursor-pointer transition-all ${paginatorPage === page ? "text-purple-600 border-purple-300 bg-purple-100 hover:bg-purple-200 hover:text-purple-700" : "border-gray-300 hover:bg-neutral-900 hover:text-neutral-100"}`}>
                                                {page}
                                            </span>
                                        </li>
                                    ))}
                                    <li>
                                        <span onClick={() => setPaginatorPage((prev) => Math.min(prev + 1, totalPages))} className="flex items-center justify-center px-4 h-10 leading-tight border-y border-r cursor-pointer transition-all border-gray-300 rounded-e-lg hover:bg-neutral-900 hover:text-neutral-100">
                                            <span className="sr-only">Next</span>
                                            <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                                            </svg>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summoner;
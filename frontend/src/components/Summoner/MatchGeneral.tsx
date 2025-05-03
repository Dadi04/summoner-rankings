import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";
import {ChampionImage} from "../ChampionData";
import {RuneImage, RuneName, RuneTooltip} from "../RuneData";
import {SummonerSpellImage, SummonerSpellName, SummonerSpellTooltip} from "../SummonerSpellData";
import {ItemImage, ItemName, ItemPlaintext, ItemDescription, ItemPrice} from "../ItemData";

import grubsicon from "../../assets/monsters/icons/grubs.png";
import drakeicon from "../../assets/monsters/icons/dragon.png";
import air_drakeicon from "../../assets/monsters/icons/dragon_cloud.png";
import earth_drakeicon from "../../assets/monsters/icons/dragon_mountain.png";
import fire_drakeicon from "../../assets/monsters/icons/dragon_infernal.png";
import water_drakeicon from "../../assets/monsters/icons/dragon_ocean.png";
import chemtech_drakeicon from "../../assets/monsters/icons/dragon_chemtech.png";
import hextech_drakeicon from "../../assets/monsters/icons/dragon_hextech.png";
import elder_drakeicon from "../../assets/monsters/icons/dragon_elder.png";
import heraldicon from "../../assets/monsters/icons/riftherald.png";
import baronicon from "../../assets/monsters/icons/baron.png";
import atakhanicon from "../../assets/monsters/icons/atakhan.png";
import turreticon from "../../assets/monsters/icons/tower.png";
import inhibitoricon from "../../assets/monsters/icons/inhibitor.png";
import blueKaynIcon from "../../assets/blue-kayn-icon.png"
import redKaynIcon from "../../assets/red-kayn-icon.png"

const MatchGeneral: React.FC<{info: MatchDetailsInfo, timeline: any; puuid: string, region: string, kaynTransformation: any;}> = ({info, timeline, puuid, region, kaynTransformation}) => {
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
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.grubs} Voidgrub{blueTeamKills.grubs ? (blueTeamKills.grubs === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={grubsicon} alt="grubsicon" className="h-10" />
                                <p>{blueTeamKills.grubs}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.dragon} Drake{blueTeamKills.dragon ? (blueTeamKills.dragon === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={drakeicon} alt="drakeicon" className="h-10" />
                                <p>{blueTeamKills.dragon}</p>
                            </div>
                        </Tippy>
                        {blueTeamKills.air_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.air_dragon} Cloud Drake{blueTeamKills.air_dragon ? (blueTeamKills.air_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={air_drakeicon} alt="air_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.air_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {blueTeamKills.earth_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.earth_dragon} Mountain Drake{blueTeamKills.earth_dragon ? (blueTeamKills.earth_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={earth_drakeicon} alt="earth_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.earth_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {blueTeamKills.fire_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.fire_dragon} Infernal Drake{blueTeamKills.fire_dragon ? (blueTeamKills.fire_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={fire_drakeicon} alt="fire_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.fire_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {blueTeamKills.water_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.water_dragon} Ocean Drake{blueTeamKills.water_dragon ? (blueTeamKills.water_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={water_drakeicon} alt="water_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.water_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {blueTeamKills.chemtech_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.chemtech_dragon} Chemtech Drake{blueTeamKills.chemtech_dragon ? (blueTeamKills.chemtech_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={chemtech_drakeicon} alt="chemtech_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.chemtech_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {blueTeamKills.hextech_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.hextech_dragon} Hextech Drake{blueTeamKills.hextech_dragon ? (blueTeamKills.hextech_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={hextech_drakeicon} alt="hextech_drakeicon" className="h-6" />
                                    <p className="text-xl">{blueTeamKills.hextech_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {((blueTeamKills.dragon ?? 0) + (blueTeamKills.dragon ?? 0) > 3) && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{blueTeamKills.elder_dragon} Elder Drake{blueTeamKills.elder_dragon ? (blueTeamKills.elder_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={elder_drakeicon} alt="elder_drakeicon" className="h-10" />
                                    <p>{blueTeamKills.elder_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.herald} Rift Herald{blueTeamKills.herald ? "" : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={heraldicon} alt="heraldicon" className="h-10" />
                                <p>{blueTeamKills.herald}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.baron} Baron Nashor{blueTeamKills.baron ? (blueTeamKills.baron === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={baronicon} alt="baronicon" className="h-10" />
                                <p>{blueTeamKills.baron}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.atakhan} Atakhan{blueTeamKills.atakhan ? "" : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={atakhanicon} alt="atakhanicon" className="h-10" />
                                <p>{blueTeamKills.atakhan}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.turret} Turret{blueTeamKills.turret ? (blueTeamKills.turret === 1 ? "" : "s") : "s"} destroyed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={turreticon} alt="turreticon" className="h-10" />
                                <p>{blueTeamKills.turret}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{blueTeamKills.inhibitor} Inhibitor{blueTeamKills.inhibitor ? (blueTeamKills.inhibitor === 1 ? "" : "s") : "s"} destroyed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={inhibitoricon} alt="inhibitoricon" className="h-10" />
                                <p>{blueTeamKills.inhibitor}</p>
                            </div>
                        </Tippy>
                    </div>
                </div>
                <div className={`${blueSideWon ? "bg-[#28344E]" : "bg-[#59343B]"} flex flex-col gap-2 text-sm p-2`}>
                    {info.participants.filter(participant => participant.teamId === 100).map(participant => (
                        <div key={participant.puuid} className="grid grid-cols-[40%_10%_10%_10%_30%] items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    {(kaynTransformation && participant.championName === "Kayn") ? (
                                        <>
                                            {kaynTransformation.transformType === "SLAYER" && (
                                                <img src={redKaynIcon} alt="redKaynIcon" className="h-12" />
                                            )}
                                            {kaynTransformation.transformType === "ASSASSIN" && (
                                                <img src={blueKaynIcon} alt="blueKaynIcon" className="h-12" />
                                            )}
                                        </>
                                    ) : (
                                        <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-12" />
                                    )}
                                    <p className="absolute text-sm right-0 bottom-0 transform translate-x-[2px] translate-y-[2px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Tippy
                                        content={
                                            <div>
                                                <SummonerSpellName spellId={participant.summoner1Id} classes="text-sm font-bold text-purple-500" />
                                                <SummonerSpellTooltip spellId={participant.summoner1Id} classes="text-sm" />
                                            </div>
                                        }
                                        allowHTML={true}
                                        interactive={false}
                                        placement="top"
                                    >
                                        <div>
                                            <SummonerSpellImage spellId={participant.summoner1Id} classes="h-6" />
                                        </div>
                                    </Tippy>
                                    <Tippy
                                        content={
                                            <div>
                                                <SummonerSpellName spellId={participant.summoner2Id} classes="text-md font-bold text-purple-500" />
                                                <SummonerSpellTooltip spellId={participant.summoner2Id} classes="text-sm" />
                                            </div>
                                        }
                                        allowHTML={true}
                                        interactive={false}
                                        placement="top"
                                    >
                                        <div>
                                            <SummonerSpellImage spellId={participant.summoner2Id} classes="h-6" />
                                        </div>
                                    </Tippy>
                                </div>
                                {participant.perks.styles[0].style ? (
                                    <div className="flex flex-col gap-1">
                                        <Tippy
                                            content={
                                                <div>
                                                    <RuneName runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="text-md font-bold text-purple-500" />
                                                    <RuneTooltip runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="text-sm" />
                                                </div>
                                            }
                                            allowHTML={true}
                                            interactive={false}
                                            placement="top"
                                        >
                                            <div>
                                                <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-6" />
                                            </div>
                                        </Tippy>
                                        <Tippy
                                            content={
                                                <div>
                                                    <RuneName runeTypeId={participant.perks.styles[1].style} classes="text-md font-bold text-purple-500" />
                                                </div>
                                            }
                                            allowHTML={true}
                                            interactive={false}
                                            placement="top"
                                        >
                                            <div>
                                                <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-6" />
                                            </div>
                                        </Tippy>
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
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item0} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item0} classes="text-sm" />
                                            <ItemDescription itemId={participant.item0} classes="text-sm" />
                                            <ItemPrice itemId={participant.item0} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item0} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item1} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item1} classes="text-sm" />
                                            <ItemDescription itemId={participant.item1} classes="text-sm" />
                                            <ItemPrice itemId={participant.item1} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item1} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item2} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item2} classes="text-sm" />
                                            <ItemDescription itemId={participant.item2} classes="text-sm" />
                                            <ItemPrice itemId={participant.item2} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item2} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item3} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item3} classes="text-sm" />
                                            <ItemDescription itemId={participant.item3} classes="text-sm" />
                                            <ItemPrice itemId={participant.item3} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item3} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item4} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item4} classes="text-sm" />
                                            <ItemDescription itemId={participant.item4} classes="text-sm" />
                                            <ItemPrice itemId={participant.item4} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item4} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item5} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item5} classes="text-sm" />
                                            <ItemDescription itemId={participant.item5} classes="text-sm" />
                                            <ItemPrice itemId={participant.item5} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item5} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item6} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item6} classes="text-sm" />
                                            <ItemDescription itemId={participant.item6} classes="text-sm" />
                                            <ItemPrice itemId={participant.item6} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item6} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
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
                    <p className="text-neutral-400 text-lg">(Red Side)</p>
                    <div className="flex gap-3 font-normal text-2xl text-neutral-200 py-2">
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.grubs} Voidgrub{redTeamKills.grubs ? (redTeamKills.grubs === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={grubsicon} alt="grubsicon" className="h-10" />
                                <p>{redTeamKills.grubs}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.dragon} Drake{redTeamKills.dragon ? (redTeamKills.dragon === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={drakeicon} alt="drakeicon" className="h-10" />
                                <p>{redTeamKills.dragon}</p>
                            </div>
                        </Tippy>
                        {redTeamKills.air_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.air_dragon} Cloud Drake{redTeamKills.air_dragon ? (redTeamKills.air_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={air_drakeicon} alt="air_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.air_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {redTeamKills.earth_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.earth_dragon} Mountain Drake{redTeamKills.earth_dragon ? (redTeamKills.earth_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={earth_drakeicon} alt="earth_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.earth_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {redTeamKills.fire_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.fire_dragon} Infernal Drake{redTeamKills.fire_dragon ? (redTeamKills.fire_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={fire_drakeicon} alt="fire_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.fire_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {redTeamKills.water_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.water_dragon} Ocean Drake{redTeamKills.water_dragon ? (redTeamKills.water_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={water_drakeicon} alt="water_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.water_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {redTeamKills.chemtech_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.chemtech_dragon} Chemtech Drake{redTeamKills.chemtech_dragon ? (redTeamKills.chemtech_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={chemtech_drakeicon} alt="chemtech_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.chemtech_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {redTeamKills.hextech_dragon > 0 && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.hextech_dragon} Hextech Drake{redTeamKills.hextech_dragon ? (redTeamKills.hextech_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={hextech_drakeicon} alt="hextech_drakeicon" className="h-6" />
                                    <p className="text-xl">{redTeamKills.hextech_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        {((blueTeamKills.dragon ?? 0) + (redTeamKills.dragon ?? 0) > 3) && (
                            <Tippy 
                                content={
                                    <p className="text-purple-500 font-bold">{redTeamKills.elder_dragon} Elder Drake{redTeamKills.elder_dragon ? (redTeamKills.elder_dragon === 1 ? "" : "s") : "s"} killed</p>
                                }
                                allowHTML={true}
                                interactive={false}
                                placement="top"
                            >
                                <div className="flex items-center">
                                    <img src={elder_drakeicon} alt="elder_drakeicon" className="h-10" />
                                    <p>{redTeamKills.elder_dragon}</p>
                                </div>
                            </Tippy>
                        )}
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.herald} Rift Herald{redTeamKills.herald ? "" : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={heraldicon} alt="heraldicon" className="h-10" />
                                <p>{redTeamKills.herald}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.baron} Baron Nashor{redTeamKills.baron ? (redTeamKills.baron === 1 ? "" : "s") : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={baronicon} alt="baronicon" className="h-10" />
                                <p>{redTeamKills.baron}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.atakhan} Atakhan{redTeamKills.atakhan ? "" : "s"} killed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={atakhanicon} alt="atakhanicon" className="h-10" />
                                <p>{redTeamKills.atakhan}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.turret} Turret{redTeamKills.turret ? (redTeamKills.turret === 1 ? "" : "s") : "s"} destroyed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={turreticon} alt="turreticon" className="h-10" />
                                <p>{redTeamKills.turret}</p>
                            </div>
                        </Tippy>
                        <Tippy 
                            content={
                                <p className="text-purple-500 font-bold">{redTeamKills.inhibitor} Inhibitor{redTeamKills.inhibitor ? (redTeamKills.inhibitor === 1 ? "" : "s") : "s"} destroyed</p>
                            }
                            allowHTML={true}
                            interactive={false}
                            placement="top"
                        >
                            <div className="flex items-center">
                                <img src={inhibitoricon} alt="inhibitoricon" className="h-10" />
                                <p>{redTeamKills.inhibitor}</p>
                            </div>
                        </Tippy>
                    </div>
                </div>
                <div className={`${!blueSideWon ? "bg-[#28344E]" : "bg-[#59343B]"} flex flex-col gap-2 text-sm p-2`}>
                    {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                        <div key={participant.puuid} className="grid grid-cols-[40%_10%_10%_10%_30%] items-center gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    {(kaynTransformation && participant.championName === "Kayn") ? (
                                        <>
                                            {kaynTransformation.transformType === "SLAYER" && (
                                                <img src={redKaynIcon} alt="redKaynIcon" className="h-12" />
                                            )}
                                            {kaynTransformation.transformType === "ASSASSIN" && (
                                                <img src={blueKaynIcon} alt="blueKaynIcon" className="h-12" />
                                            )}
                                        </>
                                    ) : (
                                        <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-12" />
                                    )}
                                    <p className="absolute text-sm right-0 bottom-0 transform translate-x-[2px] translate-y-[2px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Tippy
                                        content={
                                            <div>
                                                <SummonerSpellName spellId={participant.summoner1Id} classes="text-sm font-bold text-purple-500" />
                                                <SummonerSpellTooltip spellId={participant.summoner1Id} classes="text-sm" />
                                            </div>
                                        }
                                        allowHTML={true}
                                        interactive={false}
                                        placement="top"
                                    >
                                        <div>
                                            <SummonerSpellImage spellId={participant.summoner1Id} classes="h-6" />
                                        </div>
                                    </Tippy>
                                    <Tippy
                                        content={
                                            <div>
                                                <SummonerSpellName spellId={participant.summoner2Id} classes="text-md font-bold text-purple-500" />
                                                <SummonerSpellTooltip spellId={participant.summoner2Id} classes="text-sm" />
                                            </div>
                                        }
                                        allowHTML={true}
                                        interactive={false}
                                        placement="top"
                                    >
                                        <div>
                                            <SummonerSpellImage spellId={participant.summoner2Id} classes="h-6" />
                                        </div>
                                    </Tippy>
                                </div>
                                {participant.perks.styles[0].style ? (
                                    <div className="flex flex-col gap-1">
                                        <Tippy
                                            content={
                                                <div>
                                                    <RuneName runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="text-md font-bold text-purple-500" />
                                                    <RuneTooltip runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="text-sm" />
                                                </div>
                                            }
                                            allowHTML={true}
                                            interactive={false}
                                            placement="top"
                                        >
                                            <div>
                                                <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-6" />
                                            </div>
                                        </Tippy>
                                        <Tippy
                                            content={
                                                <div>
                                                    <RuneName runeTypeId={participant.perks.styles[1].style} classes="text-md font-bold text-purple-500" />
                                                </div>
                                            }
                                            allowHTML={true}
                                            interactive={false}
                                            placement="top"
                                        >
                                            <div>
                                                <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-6" />
                                            </div>
                                        </Tippy>
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
                                <p className="text-xl font-normal">{redSideTotalKills === 0 ? 100 : Math.round(((participant.kills + participant.assists) / redSideTotalKills) * 100)}%</p>
                                <p className="text-neutral-400">KP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl text-yellow-200">{((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(info.gameDuration/60)).toFixed(1)}</p>
                                <p className="text-neutral-400">CS/min</p>
                            </div>
                            <div className="flex gap-2">
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item0} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item0} classes="text-sm" />
                                            <ItemDescription itemId={participant.item0} classes="text-sm" />
                                            <ItemPrice itemId={participant.item0} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item0} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item1} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item1} classes="text-sm" />
                                            <ItemDescription itemId={participant.item1} classes="text-sm" />
                                            <ItemPrice itemId={participant.item1} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item1} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item2} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item2} classes="text-sm" />
                                            <ItemDescription itemId={participant.item2} classes="text-sm" />
                                            <ItemPrice itemId={participant.item2} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item2} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item3} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item3} classes="text-sm" />
                                            <ItemDescription itemId={participant.item3} classes="text-sm" />
                                            <ItemPrice itemId={participant.item3} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item3} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item4} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item4} classes="text-sm" />
                                            <ItemDescription itemId={participant.item4} classes="text-sm" />
                                            <ItemPrice itemId={participant.item4} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item4} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item5} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item5} classes="text-sm" />
                                            <ItemDescription itemId={participant.item5} classes="text-sm" />
                                            <ItemPrice itemId={participant.item5} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item5} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                                <Tippy
                                    content={
                                        <div>
                                            <ItemName itemId={participant.item6} classes="text-md font-bold text-purple-500" />
                                            <ItemPlaintext itemId={participant.item6} classes="text-sm" />
                                            <ItemDescription itemId={participant.item6} classes="text-sm" />
                                            <ItemPrice itemId={participant.item6} classes="text-sm text-orange-500" />
                                        </div>
                                    }
                                    allowHTML={true}
                                    interactive={false}
                                    placement="top"
                                >
                                    <div>
                                        <ItemImage itemId={participant.item6} matchWon={participant.win} classes="h-8" />
                                    </div>
                                </Tippy>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default MatchGeneral;
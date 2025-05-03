import { useState } from "react";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import {ChampionImage} from "../ChampionData";
import {SummonerSpellImage, SummonerSpellTooltip, SummonerSpellName} from "../SummonerSpellData";
import {RuneImage, RuneTooltip, RuneName} from "../RuneData";
import {ItemImage, ItemName, ItemPlaintext, ItemDescription, ItemPrice} from "../ItemData";
import MatchParticipantList from "./MatchParticipantList";
import MatchGeneral from "./MatchGeneral";
import MatchPerformance from "./MatchPerformance";
import MatchDetails from "./MatchDetails";
import MatchRunes from "./MatchRunes";
import MatchTimeline from "./MatchTimeline";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";

import queueJson from "../../assets/json/queues.json";

import arrowDownLight from "../../assets/arrow-down-light.png";
import blueKaynIcon from "../../assets/blue-kayn-icon.png"
import redKaynIcon from "../../assets/red-kayn-icon.png"

const SUMMONERS_RIFT_WITH_ROLES = [400, 420, 430, 440, 480, 490, 700, 870, 880, 890];

const MatchRow: React.FC<{info: MatchDetailsInfo; timelineJson: string; items: any; champions: any[]; puuid: string; region: string; classes?: string;}> = ({info, timelineJson, items, champions, puuid, region, classes}) => {
    const [showDetailsDiv, setShowDetailsDiv] = useState<boolean>(false);
    const [chooseTab, setChooseTab] = useState<string>("General");

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

    const kaynParticipant = info.participants.find(p => p.championName === "Kayn");
    const kaynId = kaynParticipant ? kaynParticipant.participantId : null;
    let kaynTransformation = null
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        for (const event of frame.events) {
            if (event.type === "CHAMPION_TRANSFORM" && event.participantId === kaynId) kaynTransformation = event;
        }
    }

    return (
        <div className={classes}>
            <div className={`w-full grid grid-cols-[25%_35%_17.5%_17.5%_5%] items-center ${participant.win ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                <div className="p-2">
                    <div className="w-[80%] border-b-2 border-neutral-400 p-2">
                        <p className={`font-bold ${participant.win ? "text-blue-400" : "text-red-400"}`}>{gamemode}</p>
                        <p className="text-sm text-neutral-300">{map}</p>
                        <p>{gameEnded} {timeUnit}</p>
                    </div>
                    <div className="flex flex-col p-2">
                        <p className="font-bold text-neutral-200">{participant.win ? "Victory" : "Defeat"}</p>
                        <p className="text-md text-neutral-400">{Math.floor(info.gameDuration/60)}m {Math.floor(info.gameDuration%60)}s</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-2">
                    <div className="flex gap-2">
                        <div className="relative">
                            {(kaynTransformation && participant.championName === "Kayn") ? (
                                <>
                                    {kaynTransformation.transformType === "SLAYER" && (
                                        <img src={redKaynIcon} alt="redKaynIcon" className="h-15" />
                                    )}
                                    {kaynTransformation.transformType === "ASSASSIN" && (
                                        <img src={blueKaynIcon} alt="blueKaynIcon" className="h-15" />
                                    )}
                                </>
                            ) : (
                                <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-15" />
                            )}
                            <p className="absolute text-sm right-0 bottom-0 transform translate-x-[4px] translate-y-[4px] bg-neutral-800 border border-neutral-400 px-0.5">{participant.champLevel}</p>
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
                                    <SummonerSpellImage spellId={participant.summoner1Id} classes="h-7" />
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
                                    <SummonerSpellImage spellId={participant.summoner2Id} classes="h-7" />
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
                                        <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-7" />
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
                                        <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-7" />
                                    </div>
                                </Tippy>
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
                <div className="flex flex-col gap-0.5 text-sm p-2">
                    {info.participants.filter((participant) => participant.teamId === 100).map(participant => (
                        <div key={participant.puuid}>
                            <Link to={`/lol/profile/${region}/${participant.riotIdGameName}-${participant.riotIdTagline}`} className="w-fit flex gap-0.5 items-center cursor-pointer hover:underline">
                                {(kaynTransformation && participant.championName === "Kayn") ? (
                                    <>
                                        {kaynTransformation.transformType === "SLAYER" && (
                                            <img src={redKaynIcon} alt="redKaynIcon" className="h-6" />
                                        )}
                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                            <img src={blueKaynIcon} alt="blueKaynIcon" className="h-6" />
                                        )}
                                    </>
                                ) : (
                                    <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-6" />
                                )}
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
                                {(kaynTransformation && participant.championName === "Kayn") ? (
                                    <>
                                        {kaynTransformation.transformType === "SLAYER" && (
                                            <img src={redKaynIcon} alt="redKaynIcon" className="h-6" />
                                        )}
                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                            <img src={blueKaynIcon} alt="blueKaynIcon" className="h-6" />
                                        )}
                                    </>
                                ) : (
                                    <ChampionImage championId={participant.championId} teamId={participant.teamId} isTeamIdSame={true} classes="h-6" />
                                )}
                                <p className={`${participant.puuid === puuid ? "text-purple-400" : ""}`}>
                                    {participant.riotIdGameName}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
                <div onClick={() => setShowDetailsDiv(prev => !prev)} className={`h-full flex items-end justify-end cursor-pointer ${participant.win ? "bg-[#2F436E]" : "bg-[#703C47]"} transition-all duration-200 ${participant.win ? "hover:bg-[#28344E]" : "hover:bg-[#59343B]"}`}>
                    <img src={arrowDownLight} alt="arrow-down-light" className={`h-10 transform transition-transform ${showDetailsDiv ? "rotate-180" : ""}`} />
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
                        {(SUMMONERS_RIFT_WITH_ROLES.includes(info.queueId)) ? (
                            <div className="mt-2 mb-1">
                                <MatchGeneral info={info} timeline={timeline} puuid={puuid} region={region} kaynTransformation={kaynTransformation} />
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
                        {(SUMMONERS_RIFT_WITH_ROLES.includes(info.queueId)) ? (
                            <div className="mt-2 mb-1">
                                <MatchPerformance info={info} puuid={puuid} kaynTransformation={kaynTransformation} />
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
                        {(SUMMONERS_RIFT_WITH_ROLES.includes(info.queueId)) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} kaynTransformation={kaynTransformation} />
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
                        {(SUMMONERS_RIFT_WITH_ROLES.includes(info.queueId)) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} kaynTransformation={kaynTransformation} />
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
                        {(SUMMONERS_RIFT_WITH_ROLES.includes(info.queueId)) ? (
                            <div className="mt-2 mb-1">
                                <MatchParticipantList info={info} choosePlayerDetails={choosePlayerDetails} setChoosePlayerDetails={setChoosePlayerDetails} kaynTransformation={kaynTransformation} />
                                <MatchTimeline timeline={timeline} info={info} selectedPlayer={selectedPlayer} items={items} kaynTransformation={kaynTransformation} />
                            </div>
                        ) : (
                            <div className="text-center text-2xl p-3">
                                TODO
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchRow;
import { useState, useMemo } from "react";

import ChampionImage from "../ChampionImage";
import ItemImage from "../ItemImage";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";
import MatchParticipant from "../../interfaces/MatchParticipant";

import map from "../../assets/map11.png";
import blueTeam from "../../assets/blue_team.png";
import redTeam from "../../assets/red_team.png";
import grubsimg from "../../assets/monsters/imgs/grubs.webp";
import air_drakeimg from "../../assets/monsters/imgs/dragon_cloud.webp";
import earth_drakeimg from "../../assets/monsters/imgs/dragon_mountain.webp";
import fire_drakeimg from "../../assets/monsters/imgs/dragon_infernal.webp";
import water_drakeimg from "../../assets/monsters/imgs/dragon_ocean.webp";
import chemtech_drakeimg from "../../assets/monsters/imgs/dragon_chemtech.webp";
import hextech_drakeimg from "../../assets/monsters/imgs/dragon_hextech.webp";
import elder_drakeimg from "../../assets/monsters/imgs/dragon_elder.webp";
import heraldimg from "../../assets/monsters/imgs/riftherald.png";
import baronimg from "../../assets/monsters/imgs/baron.webp";
import atakhanimg from "../../assets/monsters/imgs/atakhan.webp";
import blueTeamMinion from "../../assets/monsters/imgs/blue_minion.webp";
import redTeamMinion from "../../assets/monsters/imgs/red_minion.webp";
import blueKaynIcon from "../../assets/blue-kayn-icon.png"
import redKaynIcon from "../../assets/red-kayn-icon.png"
import soulMountain from "../../assets/monsters/icons/soul_mountain.webp";
import soulOcean from "../../assets/monsters/icons/soul_ocean.webp";
import soulInfernal from "../../assets/monsters/icons/soul_infernal.webp";
import soulCloud from "../../assets/monsters/icons/soul_cloud.webp";
import soulChemtech from "../../assets/monsters/icons/soul_chemtech.webp";
import soulHextech from "../../assets/monsters/icons/soul_hextech.webp";
import blueFirstBlood1 from "../../assets/feats/blue_first_blood_1.png";
import blueFirstBlood2 from "../../assets/feats/blue_first_blood_2.png";
import blueFirstBlood3 from "../../assets/feats/blue_first_blood_3.png";
import redFirstBlood1 from "../../assets/feats/red_first_blood_1.png";
import redFirstBlood2 from "../../assets/feats/red_first_blood_2.png";
import redFirstBlood3 from "../../assets/feats/red_first_blood_3.png";
import blueFirstTower from "../../assets/feats/blue_tower_active.png";
import redFirstTower from "../../assets/feats/red_tower_active.png";
import blueObjective1 from "../../assets/feats/blue_pip_active1.png";
import blueObjective2 from "../../assets/feats/blue_pip_active2.png";
import blueObjective3 from "../../assets/feats/blue_pip_active3.png";
import redObjective1 from "../../assets/feats/red_pip_active1.png";
import redObjective2 from "../../assets/feats/red_pip_active2.png";
import redObjective3 from "../../assets/feats/red_pip_active3.png";

const MAX_X = 14880;
const MAX_Y = 14880;

const CHECKBOXES = [
    { id: "kills", label: "Kills" },
    { id: "objectives", label: "Objectives" },
    { id: "all-players", label: "All Players" },
    { id: "vision", label: "Vision" },
    { id: "items", label: "Items" },
];

const EVENT_TYPE_MAP: Record<number, string[]> = {
    0: ["CHAMPION_KILL", "CHAMPION_SPECIAL_KILL", "CHAMPION_TRANSFORM"],
    1: ["BUILDING_KILL", "TURRET_PLATE_DESTROYED", "ELITE_MONSTER_KILL"],
    2: ["BUILDING_KILL", "TURRET_PLATE_DESTROYED", "FEAT_UPDATE", "DRAGON_SOUL_GIVEN", "GAME_END"],
    3: ["WARD_PLACED", "WARD_KILL"],
    4: ["ITEM_PURCHASED", "ITEM_SOLD", "ITEM_DESTROYED"],
};

const MatchTimeline: React.FC<{timeline: any; info: MatchDetailsInfo; selectedPlayer: MatchParticipant; items: any; kaynTransformation: any;}> = ({timeline, info, selectedPlayer, items, kaynTransformation}) => {
    const [hoveredDotKey, setHoveredDotKey] = useState<string | null>(null);
    const [timelineFilter, setTimelineFilter] = useState<boolean[]>([true, true, false, true, true])
    
    const toggleFilter = (index: number) => {
        setTimelineFilter(prev =>
          prev.map((val, i) => (i === index ? !val : val))
        );
    };

    function useFilteredTimeline(everyTimeline: Record<number, any[]>, allEvents: any[], timelineFilter: boolean[], selectedPlayerId: number) {
        return useMemo(() => {
            const showAll = timelineFilter[2];
      
            const activeTypeIndices = Object.keys(EVENT_TYPE_MAP).map(Number).filter(i => i !== 2 && timelineFilter[i]);
            const allowedTypes = activeTypeIndices.flatMap(i => EVENT_TYPE_MAP[i]);
      
            if (!showAll) {
                const playerEvents = everyTimeline[selectedPlayerId] || [];
                if (allowedTypes.length === 0) {
                    return playerEvents;
                }
                return playerEvents.filter(event => allowedTypes.includes(event.type));
            }
      
            return allEvents.filter(event => {
                if (event.type === "DRAGON_SOUL_GIVEN") {
                    return event.teamId === 100 || event.teamId === 200;
                }

                if (event.type === "FEAT_UPDATE") {
                    return (event.teamId === 100 || event.teamId === 200) && event.featValue !== 1001;
                }

                if (event.type === "GAME_END") {
                    return event.winningTeam === 100 || event.winningTeam === 200;
                }
        
                if (!allowedTypes.includes(event.type)) {
                    return false;
                }
        
                return true;
            });
        }, [everyTimeline, allEvents, selectedPlayerId, timelineFilter]);
    }

    function getSupportItemId(player: MatchParticipant): number {
        const slots = [
            player.item0,
            player.item1,
            player.item2,
            player.item3,
            player.item4,
            player.item5,
        ];
        return slots.find((id) => id > 3864 && id < 3878) || 0;
    }

    function getSupportItemProgression(frames: any[], participantId: number): any[] {
        return frames.flatMap((frame) => frame.events || []).filter((event) =>
            event.type === "ITEM_DESTROYED" &&
            event.itemId > 3864 &&
            event.itemId < 3878 &&
            event.participantId === participantId
        );
    }
    
    const viegoId = info.participants.find(p => p.championName === "Viego")?.participantId;
    const kaynId = info.participants.find(p => p.championName === "Kayn")?.participantId;

    const itemsIds = [3865, 3866, 3867, 3003, 3004, 3121];
    const allEvents = timeline.info.frames.flatMap((frame: any) => {
        if (!frame.events) return [];
        return frame.events.filter((event: any) => {
            if (["ITEM_UNDO", "LEVEL_UP", "SKILL_LEVEL_UP"].includes(event.type)) return false;
            if (event.type === "ITEM_DESTROYED" && !itemsIds.includes(event.itemId)) return false;
            if ((event.type === "WARD_PLACED" || event.type === "WARD_KILL") && event.wardType === "UNDEFINED") return false;
            if (event.type === "ITEM_PURCHASED" && event.itemId > 3868 && event.itemId < 3878) return false;
            if (event.type === "CHAMPION_TRANSFORM" && event.participantId === viegoId) return false;
            return true;
        });
    });
    const everyTimeline: Record<number, any[]> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;

        for (const event of frame.events) {
            if (["ITEM_UNDO", "LEVEL_UP", "SKILL_LEVEL_UP"].includes(event.type)) continue;
            if (event.type === "ITEM_DESTROYED" && !itemsIds.includes(event.itemId)) continue;
            if ((event.type === "WARD_PLACED" || event.type === "WARD_KILL") && event.wardType === "UNDEFINED") continue;
            if (event.type === "ITEM_PURCHASED" && event.itemId > 3868 && event.itemId < 3878) continue;
            if (event.type === "CHAMPION_TRANSFORM" && event.participantId === viegoId) continue;

            const playerId = event.participantId ?? event.killerId ?? event.creatorId;
            if (!playerId) continue;
        
            if (!everyTimeline[playerId]) everyTimeline[playerId] = [];
            everyTimeline[playerId].push(event);
        }
    }
    const filteredEvents = useFilteredTimeline(everyTimeline, allEvents, timelineFilter, selectedPlayer.participantId);

    const sortedFilteredEvents = useMemo(() => {
        return [...filteredEvents].sort((a, b) => a.timestamp - b.timestamp);
    }, [filteredEvents]);

    const blueTeamSupport = info.participants[4].teamId === 100 ? info.participants[4] : info.participants[9];
    const redTeamSupport = info.participants[9].teamId === 200 ? info.participants[9] : info.participants[4];

    const blueTeamSupportItemId = getSupportItemId(blueTeamSupport);
    const redTeamSupportItemId = getSupportItemId(redTeamSupport);

    const frames = timeline.info.frames;
    const blueTeamSupportItemProgression = getSupportItemProgression(frames, blueTeamSupport.participantId);
    const redTeamSupportItemProgression = getSupportItemProgression(frames, redTeamSupport.participantId);

    return (
        <>  
            <div className="flex justify-center gap-5 mb-4 mt-2">
                {CHECKBOXES.map(({ id, label }, index) => {
                    const uniqueId = `${info.gameId}-${id}`;
                    return (
                        <div key={uniqueId} className="checkbox-wrapper-37">
                            <input type="checkbox" id={uniqueId} checked={timelineFilter[index]} onChange={() => toggleFilter(index)} />
                            <label htmlFor={uniqueId} className="terms-label">
                                <svg className="checkbox-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask" fill="white">
                                        <rect width="200" height="200" />
                                    </mask>
                                    <rect width="200" height="200" className="checkbox-box" strokeWidth="40" mask="url(#mask)" />
                                    <path className={`checkbox-tick ${timelineFilter[index] ? "opacity-100" : "opacity-0"}`} d="M52 111.018L76.9867 136L149 64" strokeWidth="15" />
                                </svg>
                                <span className="ml-1 text-lg">{label}</span>
                            </label>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-4 p-2">
                <div className="flex-1 h-[400px] overflow-y-auto custom-scrollbar">
                    {sortedFilteredEvents.map((event: any) => {
                        const minutes = Math.round(event.timestamp / 60000);
                        const playerId = event.participantId ?? event.killerId ?? event.creatorId;
                        const dotKey = `kill-dot-${event.timestamp}-${playerId}-${event.type}`;
                        return (
                            <div>
                                {(event.type === "CHAMPION_KILL") && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition ${(timelineFilter[2] && info.participants[event.killerId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.killerId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-1 items-center">
                                                    {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                        <>
                                                            {kaynTransformation.transformType === "SLAYER" && (
                                                                <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                            )}
                                                            {kaynTransformation.transformType === "ASSASSIN" && (
                                                                <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                            )}
                                                        </>
                                                    ): (
                                                        <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                    )}
                                                    <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
                                                </div>
                                                <p className="text-sm text-white">killed</p>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                {(kaynId === event.victimId  && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.victimId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.victimId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.victimId-1].championId} teamId={info.participants[event.victimId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.victimId-1].riotIdGameName}</p>
                                            </div>
                                            {event.assistingParticipantIds && (
                                                <div className="flex items-end gap-1">
                                                    <p className="text-xs">assists:</p>
                                                    {event.assistingParticipantIds.map((id: number, assistIndex: number) => (
                                                        <div key={`assist-${event.timestamp}-${id}-${assistIndex}`}>
                                                            <ChampionImage championId={info.participants[id-1].championId} teamId={info.participants[id-1].teamId} isTeamIdSame={false} classes="h-5" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "ITEM_PURCHASED" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.participantId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.participantId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.participantId-1].championId} teamId={info.participants[event.participantId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.participantId-1].riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">purchased</p>
                                            <ItemImage itemId={event.itemId} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                            <p className="text-sm text-gray-200">{items[event.itemId]?.name || "Unknown Item"}</p>
                                        </div>
                                    </div>
                                )}
                                {event.type === "ITEM_SOLD" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.participantId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.participantId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.participantId-1].championId} teamId={info.participants[event.participantId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.participantId-1].riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">sold</p>
                                            <div className="relative">
                                                <ItemImage itemId={event.itemId} matchWon={info.participants[event.participantId-1].win} classes="h-10 filter grayscale brightness-70" />
                                                <svg className="absolute bottom-0 left-0 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <line x1="4" y1="4" x2="20" y2="20" stroke="red" strokeWidth="3" />
                                                    <line x1="20" y1="4" x2="4" y2="20" stroke="red" strokeWidth="3" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-200">{items[event.itemId]?.name || "Unknown Item"}</p>
                                        </div>
                                    </div>
                                )}
                                {event.type === "ITEM_DESTROYED" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.participantId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.participantId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.participantId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.participantId-1].championId} teamId={info.participants[event.participantId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.participantId-1].riotIdGameName}</p>
                                            </div>
                                            {event.itemId === 3003 && (
                                                <>  
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={3040} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Seraph's Embrace</p>
                                                </>
                                            )}
                                            {event.itemId === 3004 && (
                                                <>  
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={3042} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Muramana</p>
                                                </>
                                            )}
                                            {event.itemId === 3119 && (
                                                <>  
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={3121} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Fimbulwinter</p>
                                                </>
                                            )}
                                            {event.itemId === 3865 && (
                                                <>  
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={event.itemId+1} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Runic Compass</p>
                                                </>
                                            )}
                                            {event.itemId === 3866 && (
                                                <>
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={event.itemId+1} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Bounty of Worlds</p>
                                                </>
                                            )}
                                            {event.itemId === 3867 && (
                                                <>
                                                    <p className="text-sm text-white">chose</p>
                                                    <ItemImage itemId={info.participants[event.participantId-1].teamId === 100 ? blueTeamSupportItemId : redTeamSupportItemId} matchWon={info.participants[event.participantId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">{items[info.participants[event.participantId-1].teamId === 100 ? blueTeamSupportItemId : redTeamSupportItemId]?.name || "Unknown Item"}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "WARD_PLACED" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.creatorId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.creatorId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.creatorId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.creatorId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.creatorId-1].championId} teamId={info.participants[event.creatorId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.creatorId-1].riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">placed</p>
                                            {event.wardType === "YELLOW_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Stealth Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "CONTROL_WARD" && (
                                                <>
                                                    <ItemImage itemId={2055} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Control Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "BLUE_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3363} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Farsight Alteration</p>
                                                </>
                                            )}
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    {info.participants[event.creatorId-1].teamId === 100 ? (
                                                        <>
                                                            {(blueTeamSupportItemProgression[0].timestamp < event.timestamp && blueTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[1].itemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[1].timestamp < event.timestamp && blueTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[2].itemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {(redTeamSupportItemProgression[0].timestamp < event.timestamp && redTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[1].itemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[1].timestamp < event.timestamp && redTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[2].itemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemId} matchWon={info.participants[event.creatorId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "WARD_KILL" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.killerId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.killerId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">destroyed</p>
                                            {event.wardType === "YELLOW_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3340} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Stealth Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "CONTROL_WARD" && (
                                                <>
                                                    <ItemImage itemId={2055} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Control Ward</p>
                                                </>
                                            )}
                                            {event.wardType === "BLUE_TRINKET" && (
                                                <>
                                                    <ItemImage itemId={3363} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Farsight Alteration</p>
                                                </>
                                            )}
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    {info.participants[event.killerId-1].teamId === 100 ? (
                                                        <>
                                                            {(redTeamSupportItemProgression[0].timestamp < event.timestamp && redTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[1].itemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[1].timestamp < event.timestamp && redTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[2].itemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {(blueTeamSupportItemProgression[0].timestamp < event.timestamp && blueTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[1].itemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[1].timestamp < event.timestamp && blueTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[2].itemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemId} matchWon={info.participants[event.killerId-1].win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemId]?.name || "Unknown Item"} Ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "CHAMPION_TRANSFORM" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.participantId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.participantId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={info.participants[event.participantId-1].championId} teamId={info.participants[event.participantId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{info.participants[event.participantId-1].riotIdGameName}</p>
                                            </div>
                                            <p className="text-sm text-white">finished the transformation and chose</p>
                                            {event.transformType === "ASSASSIN" && (
                                                <>
                                                    <img src={blueKaynIcon} alt="blueKaynIcon" className="h-10" />
                                                    <p className="text-sm text-gray-200">Shadow Assassin</p>
                                                </>
                                            )}
                                            {event.transformType === "SLAYER" && (
                                                <>
                                                    <img src={redKaynIcon} alt="redKaynIcon" className="h-10" />
                                                    <p className="text-sm text-gray-200">Darkin</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "BUILDING_KILL" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition ${(timelineFilter[2] && info.participants[event.killerId-1]?.participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : event.teamId === 100 ? "bg-[#59343B] hover:bg-[#703C47]" : "bg-[#28344E] hover:bg-[#2F436E]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-1 items-center">
                                                    {event.killerId !== 0 ? (
                                                        <>
                                                            {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                                <>
                                                                    {kaynTransformation.transformType === "SLAYER" && (
                                                                        <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                                    )}
                                                                    {kaynTransformation.transformType === "ASSASSIN" && (
                                                                        <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                                    )}
                                                                </>
                                                            ): (
                                                                <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                            )}
                                                            <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {event.teamId === 100 ? (
                                                                <>
                                                                    <img src={redTeamMinion} alt="redTeamMinion" className="h-10 border border-red-500" />
                                                                    <p className="text-sm text-gray-200">Red Team's minions</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <img src={blueTeamMinion} alt="blueTeamMinion" className="h-10 border border-blue-500" />
                                                                    <p className="text-sm text-gray-200">Blue Team's minions</p>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-sm text-white">destroyed</p>
                                                {event.buildingType === "TOWER_BUILDING" && (
                                                    <>
                                                        {event.teamId === 200 ? (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-red-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 20" className="h-7 [&_path]:fill-[#EF4444]"> 
                                                                    <path fill="#3273fa" d="M3.452 3.137l1.156.513.627.277 1.265.561 1.266-.56.627-.279 1.155-.512L6.5 0zm1.424 1.351l1.62 2.551 1.618-2.55-.009-.015-1.61.719-1.61-.719zm1.624 3.8L3.737 3.965 1.62 3.026 0 3.971l1.854 2.085L6.5 11.278l4.646-5.222L13 3.97l-1.619-.945-2.118.94zM1.398 20h10.204L9.95 18.418H3.052zm1.99-2.31h6.234l1.404-10.323-4.52 5.076-4.522-5.076z" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-blue-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 20" className="h-7 [&_path]:fill-[#3B82F6]"> 
                                                                    <path fill="#3273fa" d="M3.452 3.137l1.156.513.627.277 1.265.561 1.266-.56.627-.279 1.155-.512L6.5 0zm1.424 1.351l1.62 2.551 1.618-2.55-.009-.015-1.61.719-1.61-.719zm1.624 3.8L3.737 3.965 1.62 3.026 0 3.971l1.854 2.085L6.5 11.278l4.646-5.222L13 3.97l-1.619-.945-2.118.94zM1.398 20h10.204L9.95 18.418H3.052zm1.99-2.31h6.234l1.404-10.323-4.52 5.076-4.522-5.076z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {event.buildingType === "INHIBITOR_BUILDING" && (
                                                    <>
                                                        {event.teamId === 200 ? (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-red-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-7 [&_path]:fill-[#EF4444]">
                                                                    <path d="M10 0l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H3v-4l-3-3 3-3V3h4zM10 5a5 5 0 100 10 5 5 0 000-10z" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-blue-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-7 [&_path]:fill-[#3B82F6]">
                                                                    <path d="M10 0l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H3v-4l-3-3 3-3V3h4zM10 5a5 5 0 100 10 5 5 0 000-10z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-gray-200">Inhibitor</p>
                                                    </>
                                                )}
                                                {event.buildingType === "NEXUS_BUILDING" && (
                                                    <>
                                                        {event.teamId === 200 ? (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-red-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 [&_path]:fill-[#EF4444]">
                                                                    <path fill="#3B82F6" d="M12 0l3.5 5.5 5 2-2 4.5-6.5 7.5-6.5-7.5-2-4.5 5-2L12 0zm0 3l-2.5 4-4 1.5 1.5 3.5 5 5.5 5-5.5 1.5-3.5-4-1.5L12 3zm-4 14l1.5 3H14.5l1.5-3H8z" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-blue-500">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 [&_path]:fill-[#3B82F6]">
                                                                    <path fill="#3B82F6" d="M12 0l3.5 5.5 5 2-2 4.5-6.5 7.5-6.5-7.5-2-4.5 5-2L12 0zm0 3l-2.5 4-4 1.5 1.5 3.5 5 5.5 5-5.5 1.5-3.5-4-1.5L12 3zm-4 14l1.5 3H14.5l1.5-3H8z" />
                                                                </svg>
                                                            </div>
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
                                            {event.assistingParticipantIds && (
                                                <div className="flex items-end gap-1">
                                                    <p className="text-xs">assists:</p>
                                                    {event.assistingParticipantIds.map((id: number, assistIndex: number) => (
                                                        <div key={`assist-${event.timestamp}-${id}-${assistIndex}`}>
                                                            <ChampionImage championId={info.participants[id-1].championId} teamId={info.participants[id-1].teamId} isTeamIdSame={false} classes="h-5" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "TURRET_PLATE_DESTROYED" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.killerId-1]?.participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : event.teamId === 100 ? "bg-[#59343B]" : "bg-[#28344E]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {event.killerId !== 0 ? (
                                                    <>
                                                        {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                            <>
                                                                {kaynTransformation.transformType === "SLAYER" && (
                                                                    <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                                )}
                                                                {kaynTransformation.transformType === "ASSASSIN" && (
                                                                    <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                                )}
                                                            </>
                                                        ): (
                                                            <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                        )}
                                                        <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        {event.teamId === 100 ? (
                                                            <>
                                                                <img src={redTeamMinion} alt="redTeamMinion" className="h-10 border border-red-500" />
                                                                <p className="text-sm text-gray-200">Red Team's minions</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img src={blueTeamMinion} alt="blueTeamMinion" className="h-10 border border-blue-500" />
                                                                <p className="text-sm text-gray-200">Blue Team's minions</p>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm text-white">destroyed a Turret Plate on</p>
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
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition ${(timelineFilter[2] && info.participants[event.killerId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.killerId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex gap-1 items-center">
                                                    {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                        <>
                                                            {kaynTransformation.transformType === "SLAYER" && (
                                                                <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                            )}
                                                            {kaynTransformation.transformType === "ASSASSIN" && (
                                                                <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                            )}
                                                        </>
                                                    ): (
                                                        <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                    )}
                                                    <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
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
                                            {event.assistingParticipantIds && (
                                                <div className="flex items-end gap-1">
                                                    <p className="text-xs">assists:</p>
                                                    {event.assistingParticipantIds.map((id: number, assistIndex: number) => (
                                                        <div key={`assist-${event.timestamp}-${id}-${assistIndex}`}>
                                                            <ChampionImage championId={info.participants[id-1].championId} teamId={info.participants[id-1].teamId} isTeamIdSame={false} classes="h-5" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "CHAMPION_SPECIAL_KILL" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${(timelineFilter[2] && info.participants[event.killerId-1].participantId === selectedPlayer.participantId) ? "bg-purple-800 hover:bg-purple-700" : info.participants[event.killerId-1].teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {(selectedPlayer.championName === "Kayn" && kaynTransformation && event.timestamp >= kaynTransformation.timestamp) ? (
                                                    <>
                                                        {kaynTransformation.transformType === "SLAYER" && (
                                                            <img src={redKaynIcon} alt="redKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                        {kaynTransformation.transformType === "ASSASSIN" && (
                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className={`h-10 border ${info.participants[event.killerId-1].teamId === 100 ? "border-blue-500" : "border-red-500"}`} />
                                                        )}
                                                    </>
                                                ): (
                                                    <ChampionImage championId={info.participants[event.killerId-1].championId} teamId={info.participants[event.killerId-1].teamId} isTeamIdSame={false} classes="h-10" />
                                                )}
                                                <p className="text-sm text-gray-200">{info.participants[event.killerId-1].riotIdGameName}</p>
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
                                                <p className="text-sm text-white">got Triple Kill</p>
                                            )}
                                            {event.multiKillLength === 4 && (
                                                <p className="text-sm text-white">got Quadra Kill</p>
                                            )}
                                            {event.multiKillLength === 5 && (
                                                <p className="text-sm text-white">got Penta Kill</p>
                                            )}
                                            {event.multiKillLength > 5 && (
                                                <p className="text-sm text-white">killed {event.multiKillLength} Players</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "FEAT_UPDATE" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${event.teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {event.teamId === 100 ? (
                                                    <>
                                                        <img src={blueTeam} alt="blueTeam" className="h-10 border border-blue-500 bg-netural-700" />
                                                        <p className="text-sm text-gray-200">Blue Team has progressed in Feats</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <img src={redTeam} alt="redTeam" className="h-10 border border-red-500 bg-netural-700" />
                                                        <p className="text-sm text-gray-200">Red Team has progressed in Feats</p>
                                                    </>
                                                )}
                                            </div>
                                            {(event.featType === 0 && event.featValue === 1) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueFirstBlood1} alt="blueFirstBlood1" className="h-10" />
                                                    ) : (
                                                        <img src={redFirstBlood1} alt="redFirstBlood1" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 0 && event.featValue === 2) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueFirstBlood2} alt="blueFirstBlood2" className="h-10" />
                                                    ) : (
                                                        <img src={redFirstBlood2} alt="redFirstBlood2" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 0 && event.featValue === 3) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueFirstBlood3} alt="blueFirstBlood3" className="h-10" />
                                                    ) : (
                                                        <img src={redFirstBlood3} alt="redFirstBlood3" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 1 && event.featValue === 1) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueFirstTower} alt="blueFirstTower" className="h-10" />
                                                    ) : (
                                                        <img src={redFirstTower} alt="redFirstTower" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 2 && event.featValue === 1) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueObjective1} alt="blueObjective1" className="h-10" />
                                                    ) : (
                                                        <img src={redObjective1} alt="redObjective1" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 2 && event.featValue === 2) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueObjective2} alt="blueObjective2" className="h-10" />
                                                    ) : (
                                                        <img src={redObjective2} alt="redObjective2" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                            {(event.featType === 2 && event.featValue === 3) && (
                                                <>
                                                    {event.teamId === 100 ? (
                                                        <img src={blueObjective3} alt="blueObjective3" className="h-10" />
                                                    ) : (
                                                        <img src={redObjective3} alt="redObjective3" className="h-10" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {event.type === "DRAGON_SOUL_GIVEN" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${event.teamId === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {event.teamId === 100 ? (
                                                    <>
                                                        <img src={blueTeam} alt="blueTeam" className="h-10 border border-blue-500" />
                                                        <p className="text-sm text-gray-200">Blue Team</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <img src={redTeam} alt="redTeam" className="h-10 border border-red-500" />
                                                        <p className="text-sm text-gray-200">Red Team</p>
                                                    </>
                                                )}
                                                <p className="text-sm text-white">has claimed</p>
                                                {event.name === "Mountain" && (
                                                    <>
                                                        <img src={soulMountain} alt="soulMountain" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                                {event.name === "Ocean" && (
                                                    <>
                                                        <img src={soulOcean} alt="soulOcean" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                                {event.name === "Infernal" && (
                                                    <>
                                                        <img src={soulInfernal} alt="soulInfernal" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                                {event.name === "Cloud" && (
                                                    <>
                                                        <img src={soulCloud} alt="soulCloud" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                                {event.name === "Chemtech" && (
                                                    <>
                                                        <img src={soulChemtech} alt="soulChemtech" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                                {event.name === "Hextech" && (
                                                    <>
                                                        <img src={soulHextech} alt="soulHextech" className="h-10" />
                                                        <p className="text-sm text-gray-200">{event.name} Soul</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {event.type === "GAME_END" && (
                                    <div onMouseEnter={() => setHoveredDotKey(dotKey)} onMouseLeave={() => setHoveredDotKey(null)} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div key={dotKey} className={`flex w-full p-2 gap-2 transition items-center ${event.winningTeam === 100 ? "bg-[#28344E] hover:bg-[#2F436E]" : "bg-[#59343B] hover:bg-[#703C47]"} relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-black/0 before:to-black/40 before:pointer-events-none`}>
                                            <div className="flex gap-1 items-center">
                                                {event.winningTeam === 100 ? (
                                                    <>
                                                        <img src={blueTeam} alt="blueTeam" className="h-10 border border-blue-500" />
                                                        <p className="text-sm text-gray-200">Blue Team</p>
                                                        <p className="text-sm text-white">has destroyed</p>
                                                        <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-red-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 [&_path]:fill-[#EF4444]">
                                                                <path fill="#3B82F6" d="M12 0l3.5 5.5 5 2-2 4.5-6.5 7.5-6.5-7.5-2-4.5 5-2L12 0zm0 3l-2.5 4-4 1.5 1.5 3.5 5 5.5 5-5.5 1.5-3.5-4-1.5L12 3zm-4 14l1.5 3H14.5l1.5-3H8z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm text-gray-200">Red Team's Nexus</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <img src={redTeam} alt="redTeam" className="h-10 border border-red-500" />
                                                        <p className="text-sm text-gray-200">Red Team</p>
                                                        <p className="text-sm text-white">has destroyed</p>
                                                        <div className="flex-none flex items-center justify-center w-10 h-10 bg-neutral-700 border border-blue-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 [&_path]:fill-[#3B82F6]">
                                                                <path fill="#3B82F6" d="M12 0l3.5 5.5 5 2-2 4.5-6.5 7.5-6.5-7.5-2-4.5 5-2L12 0zm0 3l-2.5 4-4 1.5 1.5 3.5 5 5.5 5-5.5 1.5-3.5-4-1.5L12 3zm-4 14l1.5 3H14.5l1.5-3H8z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-sm text-gray-200">Blue Team's Nexus</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="relative w-[400px] h-[400px]">
                    <img src={map} alt="summonersrift" className="absolute inset-0 w-full h-full object-contain" />

                    {sortedFilteredEvents
                        .filter(event => event.position?.x != null && (event.participantId || event.killerId || event.creatorId))
                        .map((event) => {
                            
                            const pctX = (event.position.x / MAX_X) * 100;
                            const pctY = 100 - (event.position.y / MAX_Y) * 100;

                            const playerId = event.participantId ?? event.killerId ?? event.creatorId;
                            const teamId = info.participants[playerId-1].teamId ?? event.teamId;
                            const dotKey = `kill-dot-${event.timestamp}-${playerId}-${event.type}`;

                            const baseColor = teamId === 100 ? "bg-blue-800 ring-blue-300" : "bg-red-800 ring-red-300";
                            const brightColor = teamId === 100 ? "bg-blue-400 ring-blue-200" : "bg-red-400 ring-red-200";

                            return (
                                <div
                                    key={dotKey}
                                    onMouseEnter={() => setHoveredDotKey(dotKey)}
                                    onMouseLeave={() => setHoveredDotKey(null)}
                                    className={`absolute w-3 h-3 ${hoveredDotKey === dotKey ? brightColor : baseColor} rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
                                    style={{ left: `${pctX}%`, top: `${pctY}%` }}
                                />
                            )
                        })
                    }
                </div>
            </div>
        </>
    );
}

export default MatchTimeline;
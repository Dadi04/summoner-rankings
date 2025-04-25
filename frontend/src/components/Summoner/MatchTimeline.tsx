
import ChampionImage from "../ChampionImage";
import ItemImage from "../ItemImage";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";
import MatchParticipant from "../../interfaces/MatchParticipant";

import map from "../../assets/map11.png";
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
import red_turretimg from "../../assets/monsters/imgs/red_tower.webp";
import blue_turretimg from "../../assets/monsters/imgs/blue_tower.webp";
import red_nexusimg from "../../assets/monsters/imgs/red_nexus.webp";
import blue_nexusimg from "../../assets/monsters/imgs/blue_nexus.webp";
import red_inhibitorimg from "../../assets/monsters/imgs/red_inhibitor.png";
import blue_inhibitorimg from "../../assets/monsters/imgs/blue_inhibitor.webp";

const MatchTimeline: React.FC<{timeline: any; info: MatchDetailsInfo; selectedPlayer: MatchParticipant; items: any;}> = ({timeline, info, selectedPlayer, items}) => {
    const CHECKBOXES = [
        { id: 'kills', label: 'Kills' },
        { id: 'objectives', label: 'Objectives' },
        { id: 'all-players', label: 'All Players' },
        { id: 'vision', label: 'Vision' },
        { id: 'items', label: 'Items' },
    ];

    const getPlayerId = (event: any) => event.participantId ?? event.killerId ?? event.creatorId;

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
            event.type === 'ITEM_DESTROYED' &&
            event.itemId! > 3864 &&
            event.itemId! < 3878 &&
            event.participantId === participantId
        );
    }

    const everyTimeline: Record<number, any[]> = {};
    for (const frame of timeline.info.frames) {
        if (!frame.events) continue;
    
        for (const event of frame.events) {
            if (["ITEM_UNDO", "LEVEL_UP", "SKILL_LEVEL_UP"].includes(event.type)) continue;
            if (event.type === "ITEM_DESTROYED" && (event.itemId <= 3864 || event.itemId >= 3868)) continue;
            if ((event.type === "WARD_PLACED" || event.type === "WARD_KILL") && event.wardType === "UNDEFINED") continue;
            if (event.type === "ITEM_PURCHASED" && event.itemId > 3868 && event.itemId < 3878) continue;
        
            const playerId = getPlayerId(event);
            if (!playerId) continue;
        
            if (!everyTimeline[playerId]) everyTimeline[playerId] = [];
            everyTimeline[playerId].push(event);
        }
    }
    const playerTimeline = everyTimeline[selectedPlayer.participantId];

    const blueTeamSupport = info.participants[4].teamId === 100 ? info.participants[4] : info.participants[9];
    const redTeamSupport = info.participants[9].teamId === 200 ? info.participants[9] : info.participants[4];

    const supportItemId = getSupportItemId(selectedPlayer);
    const blueTeamSupportItemId = getSupportItemId(blueTeamSupport);
    const redTeamSupportItemId = getSupportItemId(redTeamSupport);

    const frames = timeline.info.frames;
    const supportItemProgression = getSupportItemProgression(frames, selectedPlayer.participantId);
    const blueTeamSupportItemProgression = getSupportItemProgression(frames, blueTeamSupport.participantId);
    const redTeamSupportItemProgression = getSupportItemProgression(frames, redTeamSupport.participantId);

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
                                {event.type === "ITEM_DESTROYED" && (
                                    <div key={i} className={`flex items-center mb-1 gap-2`}>
                                        <p className="text-sm font-medium text-gray-300 w-10 text-center">{minutes}m</p>
                                        <div className={`flex w-full p-2 gap-2 items-center ${selectedPlayer.teamId === 100 ? "bg-[#28344E]" : "bg-[#59343B]"}`}>
                                            <div className="flex gap-1 items-center">
                                                <ChampionImage championId={selectedPlayer.championId} teamId={selectedPlayer.teamId} isTeamIdSame={false} classes="h-10" />
                                                <p className="text-sm text-gray-200">{selectedPlayer.riotIdGameName}</p>
                                            </div>
                                            {event.itemId === 3865 && (
                                                <>  
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={event.itemId+1} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Runic Compass</p>
                                                </>
                                            )}
                                            {event.itemId === 3866 && (
                                                <>
                                                    <p className="text-sm text-white">completed a quest for</p>
                                                    <ItemImage itemId={event.itemId+1} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">Bounty of Worlds</p>
                                                </>
                                            )}
                                            {event.itemId === 3867 && (
                                                <>
                                                    <p className="text-sm text-white">chose</p>
                                                    <ItemImage itemId={supportItemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                    <p className="text-sm text-gray-200">{items[supportItemId]?.name || "Unknown Item"}</p>
                                                </>
                                            )}
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
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    {(supportItemProgression[0].timestamp < event.timestamp && supportItemProgression[1].timestamp > event.timestamp) && (
                                                        <>
                                                            <ItemImage itemId={supportItemProgression[1].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                            <p className="text-sm text-gray-200">{items[supportItemProgression[1].itemId]?.name || "Unknown Item"} ward</p>
                                                        </>
                                                    )}
                                                    {(supportItemProgression[1].timestamp < event.timestamp && supportItemProgression[2].timestamp > event.timestamp) && (
                                                        <>
                                                            <ItemImage itemId={supportItemProgression[2].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                            <p className="text-sm text-gray-200">{items[supportItemProgression[2].itemId]?.name || "Unknown Item"} ward</p>
                                                        </>
                                                    )}
                                                    {(supportItemProgression[2].timestamp < event.timestamp) && (
                                                        <>
                                                            <ItemImage itemId={supportItemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                            <p className="text-sm text-gray-200">{items[supportItemId]?.name || "Unknown Item"} ward</p>
                                                        </>
                                                    )}
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
                                            {event.wardType === "SIGHT_WARD" && (
                                                <>
                                                    {selectedPlayer.teamId === 100 ? (
                                                        <>
                                                            {(redTeamSupportItemProgression[0].timestamp < event.timestamp && redTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[1].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[1].timestamp < event.timestamp && redTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemProgression[2].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                            {(redTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={redTeamSupportItemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[redTeamSupportItemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {(blueTeamSupportItemProgression[0].timestamp < event.timestamp && blueTeamSupportItemProgression[1].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[1].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[1].itemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[1].timestamp < event.timestamp && blueTeamSupportItemProgression[2].timestamp > event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemProgression[2].itemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemProgression[2].itemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                            {(blueTeamSupportItemProgression[2].timestamp < event.timestamp) && (
                                                                <>
                                                                    <ItemImage itemId={blueTeamSupportItemId} matchWon={selectedPlayer.win} classes="h-10" />
                                                                    <p className="text-sm text-gray-200">{items[blueTeamSupportItemId]?.name || "Unknown Item"} ward</p>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
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

export default MatchTimeline;
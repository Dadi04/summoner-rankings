import { DD_VERSION } from "../../version";

import ItemImage from "../ItemImage";
import SummonerSpellImage from "../SummonerSpellImage";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";
import MatchParticipant from "../../interfaces/MatchParticipant";

import allInPing from "../../assets/pings/allInPing.webp";
import assistMePing from "../../assets/pings/assistMePing.webp";
import enemyMissingPing from "../../assets/pings/enemyMissingPing.webp";
import enemyVisionPing from "../../assets/pings/enemyVisionPing.webp";
import genericPing from "../../assets/pings/genericPing.webp";
import getBackPing from "../../assets/pings/getBackPing.webp";
import needVisionPing from "../../assets/pings/needVisionPing.webp";
import onMyWayPing from "../../assets/pings/onMyWayPing.webp";
import pushPing from "../../assets/pings/pushPing.webp";

const MatchDetails: React.FC<{info: MatchDetailsInfo, timeline: any, selectedPlayer: MatchParticipant, champions: any[]}> = ({info, timeline, selectedPlayer, champions}) => {
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
        if (!min15) {
            csDiffs.push(0);
            goldDiffs.push(0);
            xpDiffs.push(0);
            continue;
        };
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

export default MatchDetails;
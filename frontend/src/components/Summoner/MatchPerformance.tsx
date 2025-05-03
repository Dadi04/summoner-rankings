import { useState, useMemo } from "react";

import MatchDetailsInfo from "../../interfaces/MatchDetailsInfo";
import MatchParticipant from "../../interfaces/MatchParticipant";
import {ChampionImage} from "../ChampionData";

import blueKaynIcon from "../../assets/blue-kayn-icon.png"
import redKaynIcon from "../../assets/red-kayn-icon.png"

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

const MatchPerformance: React.FC<{info: MatchDetailsInfo; puuid: string; kaynTransformation: any}> = ({info, puuid, kaynTransformation}) => {
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
                            <div className={`flex items-center text-center gap-2 p-2 ${participant.puuid === puuid ? "text-purple-600" : ""}`}>
                                <div className="relative inline-block">
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
                                        <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={true} classes="h-12" />
                                    )}
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

export default MatchPerformance
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { ChampionImage } from "../components/ChampionData";
import { SummonerSpellImage } from "../components/SummonerSpellData";
import { RuneImage } from "../components/RuneData";
import { ItemImage } from "../components/ItemData";

import arrowdown from "../assets/arrow-down-dark.png";
import arrowDownLight from "../assets/arrow-down-light.png";
import close from "../assets/close.png";
import blueKaynIcon from "../assets/blue-kayn-icon.png";
import redKaynIcon from "../assets/red-kayn-icon.png";

import queueJson from "../assets/json/queues.json";

interface RegionItem {
    name: string;
    abbr: string;
    code: string;
}

interface Player {
    id: string;
    playerId?: number;
    summonerName: string;
    summonerTag: string;
    region: string;
}

interface ChampionStat {
    championId: number;
    championName: string;
    games: number;
    wins: number;
}

interface MatchDetails {
    details: {
        metadata: {
            matchId: string;
        };
        info: {
            queueId: number;
            gameDuration: number;
            gameEndTimestamp: number;
            participants: Array<{
                puuid: string;
                summonerName: string;
                riotIdGameName: string;
                riotIdTagline: string;
                championId: number;
                championName: string;
                championTransform: number;
                kills: number;
                deaths: number;
                assists: number;
                win: boolean;
                champLevel: number;
                summoner1Id: number;
                summoner2Id: number;
                item0: number;
                item1: number;
                item2: number;
                item3: number;
                item4: number;
                item5: number;
                item6: number;
                totalMinionsKilled: number;
                neutralMinionsKilled: number;
                teamId: number;
                perks: {
                    styles: Array<{
                        style: number;
                        selections: Array<{
                            perk: number;
                        }>;
                    }>;
                };
            }>;
        };
    };
}

interface RacePlayer {
    raceId: number;
    playerId: number;
    player: {
        id: number;
        playerBasicInfo: {
            id: number;
            summonerName: string;
            summonerTag: string;
            region: string;
            profileIcon: number;
            puuid: string;
        };
        mostPlayedRole?: string;
        rank?: string;
        leaguePoints?: number;
        overallWinrate?: number;
        top5Champions?: ChampionStat[];
        last5Matches?: MatchDetails[];
    };
}

interface Race {
    id: number;
    title: string;
    status: number;
    isPublic: boolean;
    createdAt: string;
    endingOn: string | null;
    racePlayers: RacePlayer[];
}

const REGION_ITEMS: RegionItem[] = [
    { name: "North America", abbr: "NA", code: "na1" },
    { name: "Europe West", abbr: "EUW", code: "euw1" },
    { name: "Europe Nordic & East", abbr: "EUN", code: "eun1" },
    { name: "Korea", abbr: "KR", code: "kr" },
    { name: "Oceania", abbr: "OCE", code: "oc1" },
    { name: "Brazil", abbr: "BR", code: "br1" },
    { name: "Latin America North", abbr: "LAN", code: "la1" },
    { name: "Latin America South", abbr: "LAS", code: "la2" },
    { name: "Japan", abbr: "JP", code: "jp1" },
    { name: "Russia", abbr: "RU", code: "ru" },
    { name: "Türkiye", abbr: "TR", code: "tr1" },
    { name: "Southeast Asia", abbr: "SEA", code: "sg2" },
    { name: "Taiwan", abbr: "TW", code: "tw2" },
    { name: "Vietnam", abbr: "VN", code: "vn2" },
    { name: "Middle East", abbr: "ME", code: "me1" },
];

const getRankColor = (rank: string): string => {
    const tier = rank.split(' ')[0].toUpperCase();
    
    const colorMap: { [key: string]: string } = {
        'IRON': 'text-[#3E312C]',
        'BRONZE': 'text-[#785249]',
        'SILVER': 'text-[#515D66]',
        'GOLD': 'text-[#6D4A17]',
        'PLATINUM': 'text-[#0F4B59]',
        'EMERALD': 'text-[#074E2F]',
        'DIAMOND': 'text-[#4A6BB5]',
        'MASTER': 'text-[#701A88]',
        'GRANDMASTER': 'text-[#9C2E27]',
        'CHALLENGER': 'text-[#546B5F]'
    };
    
    return colorMap[tier] || 'text-purple-700';
};

const getTierValue = (tier: string): number => {
    const tierMap: { [key: string]: number } = {
        'CHALLENGER': 9,
        'GRANDMASTER': 8,
        'MASTER': 7,
        'DIAMOND': 6,
        'EMERALD': 5,
        'PLATINUM': 4,
        'GOLD': 3,
        'SILVER': 2,
        'BRONZE': 1,
        'IRON': 0
    };
    return tierMap[tier.toUpperCase()] ?? -1;
};

const getDivisionValue = (division: string): number => {
    const divisionMap: { [key: string]: number } = {
        'I': 4,
        'II': 3,
        'III': 2,
        'IV': 1
    };
    return divisionMap[division.toUpperCase()] ?? 0;
};

const sortPlayersByRank = (players: Player[], race: Race | null): Player[] => {
    return [...players].sort((a, b) => {
        const aRacePlayer = race?.racePlayers?.find(rp => 
            rp.player.playerBasicInfo.summonerName === a.summonerName &&
            rp.player.playerBasicInfo.summonerTag === a.summonerTag &&
            rp.player.playerBasicInfo.region === a.region
        );
        const bRacePlayer = race?.racePlayers?.find(rp => 
            rp.player.playerBasicInfo.summonerName === b.summonerName &&
            rp.player.playerBasicInfo.summonerTag === b.summonerTag &&
            rp.player.playerBasicInfo.region === b.region
        );
        
        const aRank = aRacePlayer?.player.rank;
        const bRank = bRacePlayer?.player.rank;
        
        if (!aRank && !bRank) return 0;
        if (!aRank) return 1;
        if (!bRank) return -1;
        
        const aRankParts = aRank.split(' ');
        const bRankParts = bRank.split(' ');
        
        const aTier = aRankParts[0];
        const bTier = bRankParts[0];
        const aDivision = aRankParts[1] || '';
        const bDivision = bRankParts[1] || '';
        
        const aTierValue = getTierValue(aTier);
        const bTierValue = getTierValue(bTier);
        if (aTierValue !== bTierValue) {
            return bTierValue - aTierValue;
        }
        
        if (aDivision && bDivision) {
            const aDivisionValue = getDivisionValue(aDivision);
            const bDivisionValue = getDivisionValue(bDivision);
            if (aDivisionValue !== bDivisionValue) {
                return bDivisionValue - aDivisionValue;
            }
        }
        
        const aLP = aRacePlayer?.player.leaguePoints ?? 0;
        const bLP = bRacePlayer?.player.leaguePoints ?? 0;
        return bLP - aLP;
    });
};

const RaceDetail: React.FC = () => {
    const { type, raceId } = useParams<{ type: string; raceId: string }>();
    const navigate = useNavigate();
    
    const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
    const [showRegion, setShowRegion] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<RegionItem>(REGION_ITEMS[0]);
    const [summonerInput, setSummonerInput] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
    const [race, setRace] = useState<Race | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEndRaceDialog, setShowEndRaceDialog] = useState(false);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const dropdownToggleRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRace = async () => {
            try {
                const token = localStorage.getItem("jwt");
                const response = await fetch(`/api/races/${raceId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRace(data);
                    
                    if (data.racePlayers && data.racePlayers.length > 0) {
                        const loadedPlayers = data.racePlayers.map((rp: RacePlayer) => ({
                            id: `${rp.player.playerBasicInfo.summonerName}-${rp.player.playerBasicInfo.summonerTag}-${rp.player.playerBasicInfo.region}-${rp.playerId}`,
                            playerId: rp.playerId,
                            summonerName: rp.player.playerBasicInfo.summonerName,
                            summonerTag: rp.player.playerBasicInfo.summonerTag,
                            region: rp.player.playerBasicInfo.region
                        }));
                        
                        const sortedPlayers = sortPlayersByRank(loadedPlayers, data);
                        setPlayers(sortedPlayers);
                    }
                }
            } catch (error) {
                console.error("Error fetching race:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (raceId) {
            fetchRace();
        }
    }, [raceId]);

    const handleBack = () => {
        navigate(`/races/${type}`);
    };

    const handleSelect = (region: RegionItem) => {
        setSelectedRegion(region);
        setShowRegion(false);
    };

    const handleAddPlayer = async () => {
        if (!summonerInput.trim()) {
            alert("Please enter a summoner name");
            return;
        }

        const parts = summonerInput.split("#");
        if (parts.length !== 2 || !parts[1].trim()) {
            alert("Please enter summoner name in format: GameName#TAG");
            return;
        }

        const summonerName = parts[0].trim();
        const summonerTag = parts[1].trim();

        const playerExists = players.some(
            p => p.summonerName === summonerName && 
                 p.summonerTag === summonerTag && 
                 p.region === selectedRegion.code
        );

        if (playerExists) {
            alert("This player has already been added to the race");
            return;
        }

        setIsAddingPlayer(true);

        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                alert("You must be logged in to add players");
                setIsAddingPlayer(false);
                return;
            }

            const response = await fetch(`/api/races/${raceId}/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    summonerName: summonerName,
                    summonerTag: summonerTag,
                    region: selectedRegion.code
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to add player" }));
                alert(`Error: ${errorData.message || "Failed to add player to race"}`);
                setIsAddingPlayer(false);
                return;
            }

            const raceResponse = await fetch(`/api/races/${raceId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (raceResponse.ok) {
                const data = await raceResponse.json();
                setRace(data);
                
                if (data.racePlayers && data.racePlayers.length > 0) {
                    const loadedPlayers = data.racePlayers.map((rp: RacePlayer) => ({
                        id: `${rp.player.playerBasicInfo.summonerName}-${rp.player.playerBasicInfo.summonerTag}-${rp.player.playerBasicInfo.region}-${rp.playerId}`,
                        playerId: rp.playerId,
                        summonerName: rp.player.playerBasicInfo.summonerName,
                        summonerTag: rp.player.playerBasicInfo.summonerTag,
                        region: rp.player.playerBasicInfo.region
                    }));
                    
                    const sortedPlayers = sortPlayersByRank(loadedPlayers, data);
                    setPlayers(sortedPlayers);
                }
            }

            setShowAddPlayerDialog(false);
            setSummonerInput("");
            setSelectedRegion(REGION_ITEMS[0]);
            setIsAddingPlayer(false);
        } catch (error) {
            console.error("Error adding player:", error);
            alert("An error occurred while adding the player. Please try again.");
            setIsAddingPlayer(false);
        }
    };

    const handleCancel = () => {
        if (isAddingPlayer) return;
        setShowAddPlayerDialog(false);
        setSummonerInput("");
        setSelectedRegion(REGION_ITEMS[0]);
        setShowRegion(false);
    };

    const handleRemovePlayer = async (player: Player) => {
        if (!player.playerId) {
            setPlayers(players.filter(p => p.id !== player.id));
            return;
        }

        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                alert("You must be logged in to remove players");
                return;
            }

            const response = await fetch(`/api/races/${raceId}/players/${player.playerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to remove player" }));
                alert(`Error: ${errorData.message || "Failed to remove player from race"}`);
                return;
            }

            setPlayers(players.filter(p => p.id !== player.id));
        } catch (error) {
            console.error("Error removing player:", error);
            alert("An error occurred while removing the player. Please try again.");
        }
    };

    const handleRefresh = async () => {
        if (isRefreshing || players.length === 0) return;
        
        setIsRefreshing(true);
        
        try {
            const updatePromises = players.map(async (player) => {
                try {
                    const response = await fetch(
                        `/api/lol/profile/${player.region}/${player.summonerName}-${player.summonerTag}/update`
                    );
                    
                    if (!response.ok) {
                        console.error(`Failed to update ${player.summonerName}#${player.summonerTag}`);
                        return false;
                    }
                    
                    return true;
                } catch (error) {
                    console.error(`Error updating ${player.summonerName}#${player.summonerTag}:`, error);
                    return false;
                }
            });
            
            await Promise.all(updatePromises);
            
            const token = localStorage.getItem("jwt");
            const response = await fetch(`/api/races/${raceId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRace(data);
                
                if (data.racePlayers && data.racePlayers.length > 0) {
                    const loadedPlayers = data.racePlayers.map((rp: RacePlayer) => ({
                        id: `${rp.player.playerBasicInfo.summonerName}-${rp.player.playerBasicInfo.summonerTag}-${rp.player.playerBasicInfo.region}-${rp.playerId}`,
                        playerId: rp.playerId,
                        summonerName: rp.player.playerBasicInfo.summonerName,
                        summonerTag: rp.player.playerBasicInfo.summonerTag,
                        region: rp.player.playerBasicInfo.region
                    }));
                    
                    const sortedPlayers = sortPlayersByRank(loadedPlayers, data);
                    setPlayers(sortedPlayers);
                }
            }
        } catch (error) {
            console.error("Error refreshing race data:", error);
            alert("An error occurred while refreshing. Please try again.");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownToggleRef.current && !dropdownToggleRef.current.contains(event.target as Node) && dropdownListRef.current && !dropdownListRef.current.contains(event.target as Node)) {
                setShowRegion(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="min-h-screen bg-[#f2f2f2]">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-start mb-6">
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
                        >
                            ← Back to {type === "private" ? "My Races" : "Public Races"}
                        </button>
                        <button
                            onClick={() => setShowAddPlayerDialog(true)}
                            className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
                        >
                            Add a Player
                        </button>
                    </div>
                    <div className="max-w-8xl mx-auto bg-white border-2 border-neutral-300 rounded-lg p-8">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p className="text-xl text-neutral-600">Loading race...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-4xl font-bold">
                                        {race?.title || `Race ${raceId}`}
                                    </h1>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className={`px-4 py-2 bg-neutral-800 text-white rounded transition-colors flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-neutral-700 cursor-pointer'}`}
                                    >
                                        {isRefreshing && (
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                                {race?.endingOn && (
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-lg text-neutral-600">
                                            This race ends on {new Date(race.endingOn).toLocaleString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </p>
                                        <button
                                            onClick={() => setShowEndRaceDialog(true)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm cursor-pointer"
                                        >
                                            End the race early
                                        </button>
                                    </div>
                                )}
                        <div className="mt-6 space-y-2">
                            {players.length > 0 ? (
                                players.map((player, index) => {
                                    const region = REGION_ITEMS.find(r => r.code === player.region);
                                    const profileUrl = `/lol/profile/${player.region}/${player.summonerName}-${player.summonerTag}`;
                                    const isExpanded = expandedPlayerId === player.id;
                                    
                                    const racePlayer = race?.racePlayers?.find(rp => 
                                        rp.player.playerBasicInfo.summonerName === player.summonerName &&
                                        rp.player.playerBasicInfo.summonerTag === player.summonerTag &&
                                        rp.player.playerBasicInfo.region === player.region
                                    );
                                    const playerData = racePlayer?.player;
                                    
                                    let position = index + 1;
                                    if (index > 0) {
                                        const prevPlayer = players[index - 1];
                                        const prevRacePlayer = race?.racePlayers?.find(rp => 
                                            rp.player.playerBasicInfo.summonerName === prevPlayer.summonerName &&
                                            rp.player.playerBasicInfo.summonerTag === prevPlayer.summonerTag &&
                                            rp.player.playerBasicInfo.region === prevPlayer.region
                                        );
                                        
                                        const currentRank = playerData?.rank;
                                        const currentLP = playerData?.leaguePoints ?? 0;
                                        const prevRank = prevRacePlayer?.player.rank;
                                        const prevLP = prevRacePlayer?.player.leaguePoints ?? 0;
                                        
                                        if (currentRank === prevRank && currentLP === prevLP) {
                                            let prevIndex = index - 1;
                                            while (prevIndex > 0) {
                                                const beforePlayer = players[prevIndex - 1];
                                                const beforeRacePlayer = race?.racePlayers?.find(rp => 
                                                    rp.player.playerBasicInfo.summonerName === beforePlayer.summonerName &&
                                                    rp.player.playerBasicInfo.summonerTag === beforePlayer.summonerTag &&
                                                    rp.player.playerBasicInfo.region === beforePlayer.region
                                                );
                                                const beforeRank = beforeRacePlayer?.player.rank;
                                                const beforeLP = beforeRacePlayer?.player.leaguePoints ?? 0;
                                                
                                                if (beforeRank === currentRank && beforeLP === currentLP) {
                                                    prevIndex--;
                                                } else {
                                                    break;
                                                }
                                            }
                                            position = prevIndex + 1;
                                        }
                                    }
                                    
                                    return (
                                        <div key={player.id} className="border border-neutral-300 rounded overflow-hidden">
                                            <div className="flex items-center bg-neutral-100 p-4">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <span className="text-lg font-semibold text-neutral-500">#{position}</span>
                                                    {playerData?.mostPlayedRole && (
                                                        <img 
                                                            src={`https://dpm.lol/position/${playerData.mostPlayedRole.toUpperCase()}.svg`}
                                                            alt={playerData.mostPlayedRole}
                                                            className="w-12"
                                                            title={playerData.mostPlayedRole}
                                                        />
                                                    )}
                                                    <img 
                                                        src={`https://cdn.communitydragon.org/latest/profile-icon/${playerData?.playerBasicInfo.profileIcon || 0}`}
                                                        alt="Profile Icon"
                                                        className="w-16 h-16 rounded-full border-2 border-neutral-300"
                                                    />
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="bg-purple-700 text-neutral-50 rounded-lg px-2 py-1 font-semibold text-sm">
                                                                {region?.abbr || player.region.toUpperCase()}
                                                            </p>
                                                            <Link 
                                                                to={profileUrl}
                                                                className="text-lg font-medium text-neutral-800 hover:text-purple-700 hover:underline transition-colors"
                                                            >
                                                                {player.summonerName}#{player.summonerTag}
                                                            </Link>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                                                            {playerData?.rank && (
                                                                <span className={`font-bold ${getRankColor(playerData.rank)} drop-shadow-sm`}>
                                                                    {playerData.rank} {playerData.leaguePoints !== undefined && `(${playerData.leaguePoints} LP)`}
                                                                </span>
                                                            )}
                                                            {playerData?.overallWinrate !== undefined && (
                                                                <span>Winrate: {playerData.overallWinrate}%</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {playerData?.top5Champions && playerData.top5Champions.length > 0 && (
                                                        <div className="flex items-center gap-0.5 ml-auto">
                                                            {playerData.top5Champions.map((champ) => (
                                                                <div key={champ.championId} className="relative group">
                                                                    <img 
                                                                        src={`https://cdn.communitydragon.org/latest/champion/${champ.championId}/square`}
                                                                        alt={champ.championName}
                                                                        className="w-13 rounded-full"
                                                                    />
                                                                    <div className="w-6 text-center absolute top-0 right-0 text-xs z-10 text-white bg-black py-0.5 cursor-default rounded-tr-full">
                                                                        {champ.games}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 px-2">
                                                    <button
                                                        onClick={() => handleRemovePlayer(player)}
                                                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                        aria-label="Remove player"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                    <div 
                                                        onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                                                        className="cursor-pointer p-2 bg-neutral-200 hover:bg-neutral-300 rounded transition-colors"
                                                    >
                                                        <img 
                                                            src={arrowDownLight} 
                                                            alt="arrow-down" 
                                                            className={`h-6 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="bg-neutral-50 border-t border-neutral-300 p-6">
                                                    <div className="flex gap-6">
                                                        <div className="flex-[70%]">
                                                            <h3 className="text-lg font-semibold mb-4">Last 5 Matches</h3>
                                                            {playerData?.last5Matches && playerData.last5Matches.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {playerData.last5Matches.map((match, idx) => {
                                                                        const participant = match.details.info.participants.find(p => 
                                                                            p.puuid === playerData.playerBasicInfo.puuid
                                                                        );
                                                                        if (!participant) return null;
                                                                        
                                                                        const queueId = match.details.info.queueId;
                                                                        const queueData = queueJson.find((item) => item.queueId === queueId);
                                                                        const gamemode = queueData ? queueData.description : "Unknown game mode";
                                                                        const map = queueData ? queueData.map : "Unknown map";

                                                                        let gameEnded = Math.round((Date.now() - match.details.info.gameEndTimestamp)/60000);
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

                                                                        const matchId = match.details.metadata.matchId;
                                                                        
                                                                        const teamParticipants = match.details.info.participants.filter((p) => p.teamId === participant.teamId);
                                                                        const totalKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
                                                                        let killParticipation;
                                                                        if (totalKills === 0) {
                                                                            killParticipation = 100;
                                                                        } else {
                                                                            killParticipation = Math.round(((participant.kills + participant.assists) / totalKills) * 100);
                                                                        }
                                                                        
                                                                        return (
                                                                            <Link 
                                                                                key={idx}
                                                                                to={`/lol/profile/${player.region}/${player.summonerName}-${player.summonerTag}#${matchId}`}
                                                                                className={`w-full grid grid-cols-[20%_35%_22.5%_22.5%] items-center ${participant.win ? "bg-[#28344E]" : "bg-[#59343B]"} hover:opacity-90 transition-opacity`}
                                                                            >
                                                                                <div className="p-2">
                                                                                    <div className="w-[90%] border-b-2 border-neutral-400 p-2">
                                                                                        <p className={`font-bold text-sm ${participant.win ? "text-blue-400" : "text-red-400"}`}>{gamemode}</p>
                                                                                        <p className="text-xs text-neutral-300">{map}</p>
                                                                                        <p className="text-xs text-neutral-100">{gameEnded} {timeUnit}</p>
                                                                                    </div>
                                                                                    <div className="flex flex-col p-2">
                                                                                        <p className="font-bold text-neutral-200 text-sm">{participant.win ? "Victory" : "Defeat"}</p>
                                                                                        <p className="text-sm text-neutral-400">{Math.floor(match.details.info.gameDuration/60)}m {Math.floor(match.details.info.gameDuration%60)}s</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col gap-3 p-2">
                                                                                    <div className="flex gap-2">
                                                                                        <div className="relative">
                                                                                            {(participant.championName === "Kayn" && participant.championTransform > 0) ? (
                                                                                                <>
                                                                                                    {participant.championTransform === 1 && (
                                                                                                        <img src={redKaynIcon} alt="redKaynIcon" className="h-12" />
                                                                                                    )}
                                                                                                    {participant.championTransform === 2 && (
                                                                                                        <img src={blueKaynIcon} alt="blueKaynIcon" className="h-12" />
                                                                                                    )}
                                                                                                </>
                                                                                            ) : (
                                                                                                <ChampionImage championId={participant.championId} teamId={100} isTeamIdSame={true} classes="h-12" />
                                                                                            )}
                                                                                            <p className="absolute text-xs right-0 bottom-0 transform translate-x-[2px] translate-y-[2px] bg-neutral-800 border border-neutral-400 px-0.5 text-white">{participant.champLevel}</p>
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-0.5">
                                                                                            <SummonerSpellImage spellId={participant.summoner1Id} classes="h-6" />
                                                                                            <SummonerSpellImage spellId={participant.summoner2Id} classes="h-6" />
                                                                                        </div>
                                                                                        {participant.perks.styles[0] ? (
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                <RuneImage runeTypeId={participant.perks.styles[0].style} runeId={participant.perks.styles[0].selections[0].perk} classes="h-6" />
                                                                                                <RuneImage runeTypeId={participant.perks.styles[1].style} classes="h-6" />
                                                                                            </div>
                                                                                        ) : <></>}
                                                                                        <div className="flex gap-1 items-center">
                                                                                            <div className="text-center pr-1">
                                                                                                <div className="flex items-center">
                                                                                                    <p className="font-bold text-base text-white">{participant.kills}</p>
                                                                                                    <p className="text-base text-neutral-400 px-1">/</p> 
                                                                                                    <p className="text-red-500 font-bold text-base">{participant.deaths}</p> 
                                                                                                    <p className="text-base text-neutral-400 px-1">/</p> 
                                                                                                    <p className="font-bold text-base text-white">{participant.assists}</p>
                                                                                                </div>
                                                                                                {participant.deaths === 0 ? (
                                                                                                    <p className="text-xs text-neutral-400">Perfect</p>
                                                                                                ) : (
                                                                                                    <p className="text-xs text-neutral-400">{((participant.kills + participant.assists) / participant.deaths).toFixed(2)}:1 KDA</p>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="border-l-1 border-neutral-600 pl-1 text-xs text-neutral-300">
                                                                                                <p>CS {participant.totalMinionsKilled + participant.neutralMinionsKilled} ({((participant.totalMinionsKilled + participant.neutralMinionsKilled)/(match.details.info.gameDuration/60)).toFixed(1)})</p>
                                                                                                <p>KP {killParticipation}%</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex gap-1">
                                                                                        <ItemImage itemId={participant.item0} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item1} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item2} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item3} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item4} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item5} matchWon={participant.win} classes="w-6 h-6" />
                                                                                        <ItemImage itemId={participant.item6} matchWon={participant.win} classes="w-6 h-6" />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col gap-0.5 text-xs p-2">
                                                                                    {match.details.info.participants.filter((p) => p.teamId === 100).map(p => (
                                                                                        <div key={p.puuid}>
                                                                                            <Link to={`/lol/profile/${player.region}/${p.riotIdGameName}-${p.riotIdTagline}`} className="w-fit flex gap-0.5 items-center cursor-pointer hover:underline decoration-white">
                                                                                                {(p.championName === "Kayn" && p.championTransform > 0) ? (
                                                                                                    <>
                                                                                                        {p.championTransform === 1 && (
                                                                                                            <img src={redKaynIcon} alt="redKaynIcon" className="h-4" />
                                                                                                        )}
                                                                                                        {p.championTransform === 2 && (
                                                                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className="h-4" />
                                                                                                        )}
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <ChampionImage championId={p.championId} teamId={p.teamId} isTeamIdSame={true} classes="h-4" />
                                                                                                )}
                                                                                                <p className={`${p.puuid === playerData.playerBasicInfo.puuid ? "text-purple-400" : "text-neutral-100"}`}>
                                                                                                    {p.riotIdGameName}
                                                                                                </p>
                                                                                            </Link>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="flex flex-col gap-0.5 text-xs p-2">
                                                                                    {match.details.info.participants.filter(p => p.teamId === 200).map(p => (
                                                                                        <div key={p.puuid}>
                                                                                            <Link to={`/lol/profile/${player.region}/${p.riotIdGameName}-${p.riotIdTagline}`} className="w-fit flex gap-0.5 items-center cursor-pointer hover:underline decoration-white">
                                                                                                {(p.championName === "Kayn" && p.championTransform > 0) ? (
                                                                                                    <>
                                                                                                        {p.championTransform === 1 && (
                                                                                                            <img src={redKaynIcon} alt="redKaynIcon" className="h-4" />
                                                                                                        )}
                                                                                                        {p.championTransform === 2 && (
                                                                                                            <img src={blueKaynIcon} alt="blueKaynIcon" className="h-4" />
                                                                                                        )}
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <ChampionImage championId={p.championId} teamId={p.teamId} isTeamIdSame={true} classes="h-4" />
                                                                                                )}
                                                                                                <p className={`${p.puuid === playerData.playerBasicInfo.puuid ? "text-purple-400" : "text-neutral-100"}`}>
                                                                                                    {p.riotIdGameName}
                                                                                                </p>
                                                                                            </Link>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-neutral-500">No match data available</p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex-[40%]">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold">LP Progress</h3>
                                                                <Link
                                                                    to={`/compare/${player.region}-${player.summonerName}-${player.summonerTag}/`}
                                                                    className="px-3 py-1 bg-purple-700 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                                                                >
                                                                    Compare With
                                                                </Link>
                                                            </div>
                                                            <div className="bg-neutral-100 rounded p-8 text-center border-2 border-dashed border-neutral-300">
                                                                <svg className="mx-auto h-16 w-16 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                                <p className="text-neutral-600 font-medium">LP Graph Coming Soon</p>
                                                                <p className="text-sm text-neutral-500 mt-2">
                                                                    Track LP changes since race start
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-neutral-500 text-center py-4">
                                    No participants yet. Click "Add a Player" to get started.
                                </p>
                            )}
                        </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showAddPlayerDialog && (
                <div onClick={isAddingPlayer ? undefined : handleCancel} className="fixed inset-0 flex items-center justify-center bg-black/90 z-150">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative w-100">
                        {!isAddingPlayer && (
                            <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                                <img onClick={handleCancel} src={close} alt="close.png" className="h-4" />
                            </div>
                        )}
                        <h2 className="text-2xl font-bold mt-6 text-center">Add a Player</h2>
                        <p className="text-center mt-0 mb-4">
                            {isAddingPlayer ? "Fetching player data..." : "Select region and enter summoner name"}
                        </p>
                        <div className="flex flex-col">
                            <div className="mb-4 relative">
                                <label className="font-medium mb-1 block">Region</label>
                                <div 
                                    ref={dropdownToggleRef} 
                                    onClick={isAddingPlayer ? undefined : () => setShowRegion((prev) => !prev)} 
                                    className={`flex justify-between items-center border rounded p-2 transition-all duration-300 ${isAddingPlayer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'}`}
                                >
                                    <span>{selectedRegion.name}</span>
                                    <img 
                                        src={arrowdown} 
                                        alt="arrow-down" 
                                        className={`h-5 transform transition-transform duration-150 ${showRegion ? "rotate-180" : ""}`} 
                                    />
                                </div>
                                <div 
                                    ref={dropdownListRef} 
                                    className={`absolute top-full left-0 w-full bg-neutral-700 shadow-md z-150 transition-all duration-200 transform mt-1 ${showRegion ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                                >
                                    <ul className="grid grid-cols-1 text-white max-h-60 overflow-y-auto">
                                        {REGION_ITEMS.map((region) => (
                                            <li 
                                                key={region.code} 
                                                onClick={() => handleSelect(region)} 
                                                className="flex justify-between border-b-1 border-white items-center px-3 py-2 hover:bg-neutral-600 cursor-pointer"
                                            >
                                                {region.name}
                                                <span className="text-xl font-bold">{region.abbr}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="font-medium mb-1 block">Game Name + Tag</label>
                                <input 
                                    type="text" 
                                    value={summonerInput} 
                                    onChange={(e) => setSummonerInput(e.target.value)} 
                                    placeholder="Game Name + #TAG" 
                                    disabled={isAddingPlayer}
                                    className={`w-full p-2 border rounded transition-all duration-300 ease-in-out outline-none ${isAddingPlayer ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400'}`}
                                />
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button 
                                    onClick={handleCancel} 
                                    disabled={isAddingPlayer}
                                    className={`flex-1 p-2 rounded transition duration-300 ${isAddingPlayer ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-800' : 'cursor-pointer bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddPlayer} 
                                    disabled={isAddingPlayer}
                                    className={`flex-1 p-2 rounded transition duration-300 flex items-center justify-center ${isAddingPlayer ? 'opacity-75 cursor-not-allowed bg-neutral-900 text-white' : 'cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800'}`}
                                >
                                    {isAddingPlayer ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading...
                                        </>
                                    ) : (
                                        'OK'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEndRaceDialog && (
                <div onClick={() => setShowEndRaceDialog(false)} className="fixed inset-0 flex items-center justify-center bg-black/90 z-150">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative w-100">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                            <img onClick={() => setShowEndRaceDialog(false)} src={close} alt="close.png" className="h-4" />e
                        </div>
                        
                        <div className="flex justify-center mt-6 mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center">Are you sure?</h2>
                        <p className="text-center mt-2 mb-4 text-neutral-600">
                            Do you want to end this race early? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowEndRaceDialog(false)}
                                className="flex-1 cursor-pointer bg-gray-300 text-gray-800 p-2 rounded transition duration-300 hover:bg-gray-400"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    // TODO: Implement end race early
                                    console.log("Ending race early");
                                    setShowEndRaceDialog(false);
                                }}
                                className="flex-1 cursor-pointer bg-red-600 text-white p-2 rounded transition duration-300 hover:bg-red-700"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RaceDetail;


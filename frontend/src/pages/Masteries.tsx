import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { DD_VERSION } from "../version";
import { playerCache } from "../utils/playerCache";

import SummonerProfileHeader from "../components/ProfileHeader";
import {ChampionImage} from "../components/ChampionData";
import SelectMenu from "../components/SelectMenu";

import Player from "../interfaces/Player";
import Mastery from "../interfaces/Mastery";

import hextechChest from "../assets/hextech_chest.webp";
import noneicon from "../assets/none.jpg";

const masteryOptions = [
    { label: "Mastery points", value: "points" },
    { label: "Mastery level", value: "level" },
    { label: "Recently played", value: "recent" },
    { label: "Alphabetical", value: "alpha" },
];
  
const championsOptions = [
    { label: "All champions", value: "" },
    { label: "Mastery champion", value: "mastery" },
    { label: "Non-mastery champ", value: "non-mastery" },
    { label: "Chest available", value: "available" },
    { label: "Chest received", value: "received" },
];

const Masteries: React.FC = () => {
    const location = useLocation();
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    
    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const [champions, setChampions] = useState<any[]>([]);
    const [loadingChampions, setLoadingChampions] = useState<boolean>(true);
    const [masteryFilter, setMasteryFilter] = useState<string>("points");
    const [championsFilter, setChampionsFilter] = useState<string>("");
    const [searchChampionsFilter, setSearchChampionsFilter] = useState<string>("");
    const [selectedChampion, setSelectedChampion]   = useState<string>("All Champions");
    const [showSelectChampions, setShowSelectChampions] = useState<boolean>(false);

    const inputChampionsRef  = useRef<HTMLDivElement>(null);
    const dropdownChampionsRef = useRef<HTMLDivElement>(null);

    const summoner = decodeURIComponent(encodedSummoner);
    const cacheKey = `summoner_${regionCode}_${summoner}`;
    
    const [apiData, setApiData] = useState<Player | null>(() => {
        if (location.state?.apiData) {
            return location.state.apiData;
        }
        return null;
    });
    const [loading, setLoading] = useState(!apiData);

    const masterySum = apiData?.masteriesData?.reduce((sum, mastery) => {
        return sum + mastery.championPoints;
    }, 0) || 0;

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (dropdownChampionsRef.current && !dropdownChampionsRef.current.contains(e.target as Node) && inputChampionsRef.current && !inputChampionsRef.current.contains(e.target as Node)) {
                setShowSelectChampions(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
        const fetchChampions = async () => {
            setLoadingChampions(true);
            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/championFull.json`);
                const data = await response.json();
                const championsArray = Object.values(data.data);
                setChampions(championsArray);
            } catch (error) {
                console.error("Error fetching champions", error);
            } finally {
                setLoadingChampions(false);
            }
        };
        fetchChampions();
    }, [DD_VERSION]);
    
    useEffect(() => {
        const cacheData = async () => {
            if (apiData) {
                try {
                    await playerCache.setItem(cacheKey, apiData);
                } catch (error) {
                    console.error("Error caching data:", error);
                }
            }
        };
        cacheData();
    }, [apiData, cacheKey]);
    
    useEffect(() => {
        const fetchData = async () => {
            if (apiData) {
                return;
            }
            
            try {
                const cachedData = await playerCache.getItem(cacheKey);
                if (cachedData) {
                    setApiData(cachedData);
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/lol/profile/${regionCode}/${summoner}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApiData(data);
            } catch (error) {
                console.error("Error fetching API data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [regionCode, summoner, apiData, cacheKey]);

    const allMasteries = useMemo(() => {
        const masteryMap = new Map<number, Mastery>();
        (apiData?.masteriesData ?? []).forEach(m => {
            masteryMap.set(m.championId, m);
        });

        const list = champions.map(champ => {
            const champId = parseInt(champ.key, 10);
            const m = masteryMap.get(champId);

            return {
                puuid: apiData?.puuid ?? "",
                championId: champId,
                championLevel: m?.championLevel ?? 0,
                championPoints: m?.championPoints ?? 0,
                championPointsSinceLastLevel: m?.championPointsSinceLastLevel ?? 0,
                championPointsUntilNextLevel: m?.championPointsUntilNextLevel ?? 0,
                markRequiredForNextLevel: m?.markRequiredForNextLevel ?? 0,
                championSeasonMilestone: m?.championSeasonMilestone ?? 0,
                nextSeasonMilestone: m?.nextSeasonMilestone ?? {
                    requireGradeCounts: {},
                    rewardMarks: 0,
                    bonus: false,
                    rewardConfig: {
                        rewardValue: "",
                        rewardType: "",
                        maximumReward: 0,
                    }
                },
                tokensEarned: m?.tokensEarned ?? 0,
                milestoneGrades: m?.milestoneGrades ?? [],
                chestGranted: m?.chestGranted ?? false,
                lastPlayTime: m?.lastPlayTime ?? null,
            }
        })

        let filtered = [...list];

        if (selectedChampion !== "All Champions") {
            filtered = filtered.filter(m => {
                const champData = champions.find(c => c.key === m.championId.toString());
                return champData?.name === selectedChampion;
            });
        }

        if (championsFilter === "mastery") filtered = filtered.filter(m => m.championLevel > 0);
        else if (championsFilter === "non-mastery") filtered = filtered.filter(m => m.championLevel === 0);
        else if (championsFilter === "available") filtered = filtered.filter(m => !m.chestGranted && m.championLevel > 0);
        else if (championsFilter === "received") filtered = filtered.filter(m => m.chestGranted);

        filtered.sort((a, b) => {
            switch (masteryFilter) {
                case "level":
                    return b.championLevel - a.championLevel;
                case "recent":
                    return (b.lastPlayTime ?? 0) - (a.lastPlayTime ?? 0);
                case "alpha": {
                    const nameA = champions.find(c => c.key === a.championId.toString())?.name ?? "";
                    const nameB = champions.find(c => c.key === b.championId.toString())?.name ?? "";
                    return nameA.localeCompare(nameB);
                }
                case "":
                case "points":
                default:
                    return b.championPoints - a.championPoints;
            }
        });

        return filtered;
    }, [apiData?.masteriesData, masteryFilter, championsFilter, champions, selectedChampion]) 
    
    if (loading || !apiData) {
        return <div className="flex justify-center mt-10">Loading...</div>;
    }

    return (
        <div className="container m-auto">
            <SummonerProfileHeader data={apiData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setApiData} />
            <div className="flex justify-around bg-neutral-800 text-neutral-50 p-2 my-2">
                <div className="flex flex-col items-center justify-center text-center p-2 gap-1">
                    {/* copyright opgg */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                        <path fill="#EB9C00" d="M6.716 6.475q-.034.033-.052.057a7.389 7.389 0 1 0 12.008 0q-.018-.024-.052-.057c-.087-.087-.222-.224-.119-.431.519-.95 2.178-3.085 4.667-4.019-.377.98-1.16 3.463-1.63 6.35a9.2 9.2 0 0 1 .334 2.465c0 4.378-3.057 8.043-7.153 8.975-.629 1.202-1.575 2.23-2.051 2.692-.476-.463-1.422-1.49-2.05-2.692-4.097-.933-7.154-4.597-7.154-8.975 0-.853.117-1.68.334-2.464-.47-2.888-1.253-5.371-1.63-6.35 2.489.933 4.148 3.067 4.667 4.018.103.207-.032.344-.12.431" />
                        <path fill="#EB9C00" fillRule="evenodd" clipRule="evenodd" d="M12.668 3.062c.486.486 1.547 1.683 2.026 3.004a5.187 5.187 0 0 1-2.026 9.96 5.185 5.185 0 0 1-2.026-9.96c.48-1.321 1.54-2.518 2.026-3.004m0 10.63a2.852 2.852 0 1 0 0-5.704 2.852 2.852 0 0 0 0 5.704" />
                    </svg>
                    <p className="text-xl font-semibold">{apiData.totalMasteryScoreData}</p>
                    <p className="text-lg text-neutral-400">Total mastery score</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 gap-1">
                    {/* copyright opgg */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                        <path fill="#7B7A8E" fillRule="evenodd" clipRule="evenodd" d="M4.496 6.532q.018-.024.052-.057c.087-.087.222-.224.119-.431C4.148 5.094 2.489 2.959 0 2.025c.377.98 1.16 3.463 1.63 6.35a9.2 9.2 0 0 0-.334 2.465c0 4.378 3.057 8.043 7.153 8.975.629 1.202 1.575 2.23 2.051 2.692.22-.214.542-.55.886-.968a7.46 7.46 0 0 1-.883-3.31H10.5A7.389 7.389 0 0 1 4.496 6.532m11.19 4.332a7.52 7.52 0 0 0-4.921 5.155 5.185 5.185 0 0 1-2.29-9.953c.478-1.321 1.54-2.518 2.025-3.004.486.486 1.547 1.683 2.026 3.004a5.19 5.19 0 0 1 3.16 4.774zm2.195-.363H18q.88.001 1.703.193a9.2 9.2 0 0 0-.333-2.318c.47-2.888 1.253-5.371 1.63-6.35-2.489.933-4.148 3.067-4.667 4.018-.103.207.032.344.12.431q.033.033.051.057a7.35 7.35 0 0 1 1.377 3.97m-4.53.34a2.852 2.852 0 1 1-5.703 0 2.852 2.852 0 0 1 5.704 0" />
                        <path fill="#7D59EA" fillRule="evenodd" clipRule="evenodd" d="M18 24a6 6 0 1 0 0-12 6 6 0 0 0 0 12m-.5-2.5H16V15h3.5l1.5 1.5V18l-1.5 1.5h-2zm2-3.5h-2v-1.5h2z" />
                    </svg>
                    <p className="text-xl font-semibold">{masterySum}</p>
                    <p className="text-lg text-neutral-400">Total champion points</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 gap-1">
                    {/* copyright opgg */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                        <path fill="#7B7A8E" fillRule="evenodd" clipRule="evenodd" d="M15.413 9.652q-.005.202-.005.346c0 .4-.017.797-.033 1.174-.039.907-.072 1.699.145 2.13a5 5 0 0 0-.116.225q-.255.143-.485.32l-.039-.079c-.355-.651-1.39-1.998-2.993-2.674.349-.122.689-.333.98-.632.836-.863.95-2.11.254-2.786-.694-.677-1.886-.475-2.772.335-.352.322-.598.813-.707 1.193-.154.48-.172.994-.172 1.62 0 1.055-.013 2.543-.013 2.543 0 .958-1.577.958-1.577 0 0 0-.012-1.488-.012-2.543 0-.626-.019-1.14-.172-1.62-.11-.38-.355-.871-.707-1.193-.886-.81-2.08-1.012-2.773-.335-.696.677-.582 1.923.254 2.786.303.31.658.526 1.021.646v7.003s-1.994-.785-3.104-2.16c-1.11-1.373-1.306-1.994-.751-2.42.414-.317.374-1.252.327-2.359a28 28 0 0 1-.033-1.174q0-.143-.005-.346C1.885 7.564 1.758 1.044 8.636 1l.065.002c6.879.042 6.752 6.563 6.712 8.65m-3.567 3.946V12.18c.287.15.55.327.787.513.703.553 1.176 1.199 1.37 1.554.059.118-.019.196-.068.246l-.03.033a4.2 4.2 0 0 0-.766 2.928c-.385.232-.733.406-.97.516a5.3 5.3 0 0 1 .098-2.39c-.117-.723-.269-1.4-.42-1.982m4.111.766c-.112.383-.44.888-1.006 1.588a5 5 0 0 1-.542.57 2.97 2.97 0 0 1 1.548-2.158" />
                        <path fill="#EB9C00" d="m13.935 14.493-.03.033a4.222 4.222 0 1 0 6.862 0l-.03-.033c-.05-.05-.127-.128-.068-.247.297-.543 1.245-1.763 2.667-2.296-.215.56-.663 1.979-.932 3.629a5.265 5.265 0 0 1-3.896 6.536c-.36.688-.9 1.275-1.172 1.539-.272-.264-.813-.851-1.172-1.539a5.26 5.26 0 0 1-3.897-6.536c-.268-1.65-.716-3.07-.931-3.629 1.422.534 2.37 1.753 2.667 2.297.059.118-.019.196-.068.246" />
                        <path fill="#EB9C00" fillRule="evenodd" clipRule="evenodd" d="M14.373 16.987c0-1.225.744-2.277 1.805-2.728.274-.755.88-1.439 1.158-1.716.277.277.884.961 1.158 1.716a2.964 2.964 0 1 1-4.121 2.728m2.963 1.63a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26" />
                    </svg>
                    <div className="flex justify-center items-center gap-1">
                        <p className="text-xl font-bold">{apiData.masteriesData.length}</p> 
                        <p className="text-neutral-400">/</p> 
                        <p className="text-xl">{champions.length}</p>
                    </div>
                    <p className="text-lg text-neutral-400">Mastery champions</p>
                </div>
            </div>
            <div className="flex justify-between w-full items-center bg-neutral-800 text-neutral-50 my-2 p-2 gap-2">
                <div className="flex gap-2">
                    <SelectMenu options={masteryOptions} value={masteryFilter} onChange={setMasteryFilter} placeholder="Mastery points" classes="w-[250px] text-white" />
                    <SelectMenu options={championsOptions} value={championsFilter} onChange={setChampionsFilter} placeholder="All champions" classes="w-[250px] text-white" />
                </div>
                <div className="relative w-[250px]">
                    <div ref={inputChampionsRef} onClick={() => setShowSelectChampions(true)} className="text-xl">
                        <input type="text" placeholder="Select Champion" value={searchChampionsFilter} onChange={e => setSearchChampionsFilter(e.target.value)} className="w-full border-none outline-none bg-neutral-900 px-2 py-1" />
                    </div>
                    <div ref={dropdownChampionsRef} className={`z-100 absolute top-full left-0 w-full bg-neutral-800 transition-all duration-300 border border-purple-500 overflow-y-auto shadow-lg max-h-[400px]
                            ${showSelectChampions ? "opacity-100 visible" : "opacity-0 invisible"} custom-scrollbar`}>
                        <div onClick={() => {setSelectedChampion("All Champions"); setSearchChampionsFilter("All Champions"); setShowSelectChampions(false)}} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === "All Champions" ? "bg-neutral-700" : ""}`}>
                            <img src={noneicon} alt="none-icon" className="h-12" />
                            <span>All Champions</span>
                        </div>
                        <div>
                            {champions.filter(champ =>champ.name.toLowerCase().startsWith(searchChampionsFilter.toLowerCase())).map((champion) => (
                                <div key={champion.id} onClick={() => {setSelectedChampion(champion.name); setSearchChampionsFilter(champion.name); setShowSelectChampions(false);}} className={`flex items-center text-lg justify-between pl-4 pr-4 pt-0.5 pb-0.5 cursor-pointer transition-all duration-100 hover:text-neutral-300 ${selectedChampion === champion.name ? "bg-neutral-700" : ""} `}>
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${champion.id}.png`} alt={champion.name} className="h-12" />
                                    <span>{champion.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {loadingChampions ? (
                <div className="h-[200px] bg-neutral-800 text-neutral-50 mb-2 p-4 flex flex-col items-center justify-center">
                    <svg className="animate-spin h-12 w-12 text-neutral-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-2xl text-neutral-300">Loading masteries...</p>
                </div>
            ) : allMasteries.length > 0 ? (
                <div className="w-full grid grid-cols-8 bg-neutral-800 text-neutral-50 p-4 mb-2">
                    {allMasteries.map(mastery => {
                        const champ = champions.find(c => c.key === mastery.championId.toString());
                        return (
                            <Tippy
                                key={mastery.championId}
                                content={
                                    <div className="p-2">
                                        <div className="flex justify-between items-center border-b-2 border-neutral-400">
                                            <p className="font-bold">{champ?.name}</p>
                                            {mastery.chestGranted ? (
                                                <div className="relative">
                                                    <img src={hextechChest} alt="hextechChest" className="h-8" title="Chest available" />
                                                    <svg className="absolute bottom-0 right-0 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <line x1="4" y1="4" x2="20" y2="20" stroke="red" strokeWidth="3" />
                                                        <line x1="20" y1="4" x2="4" y2="20" stroke="red" strokeWidth="3" />
                                                    </svg>
                                                </div> 
                                            ) : (
                                                <div className="relative">
                                                    <img src={hextechChest} alt="hextechChest" className="h-8" title="Chest received" />
                                                    <svg className="absolute bottom-0 right-0 h-4 w-4 text-green-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20.285 6.707a1 1 0 00-1.414-1.414L9 15.164l-3.871-3.871a1 1 0 00-1.414 1.414l4.578 4.578a1 1 0 001.414 0l10.578-10.578z" fill="currentColor" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center my-1">
                                                <div className="text-neutral-400">
                                                    {mastery.tokensEarned === 0 && (
                                                        <ol className="flex gap-1">
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full border border-neutral-900 bg-neutral-800" />
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full border border-neutral-900 bg-neutral-800" />
                                                        </ol>
                                                    )} 
                                                    {mastery.tokensEarned === 1 && (
                                                        <ol className="flex gap-1">
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full bg-gradient-to-b from-[#5383e8] to-[#7d59ea]">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="none" viewBox="0 0 8 8">
                                                                    <path fill="#FFF9DB" d="M3.766.634a.25.25 0 0 1 .468 0l.527 1.423A2 2 0 0 0 5.943 3.24l1.423.527a.25.25 0 0 1 0 .468l-1.423.527A2 2 0 0 0 4.76 5.943l-.527 1.423a.25.25 0 0 1-.468 0l-.527-1.423A2 2 0 0 0 2.057 4.76L.634 4.234a.25.25 0 0 1 0-.468l1.423-.527A2 2 0 0 0 3.24 2.057z" />
                                                                </svg>
                                                            </li>
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full border border-neutral-900 bg-neutral-800" />
                                                        </ol>
                                                    )} 
                                                    {mastery.tokensEarned >= 2 && (
                                                        <ol className="flex gap-1">
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full bg-gradient-to-b from-[#5383e8] to-[#7d59ea]">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="none" viewBox="0 0 8 8">
                                                                    <path fill="#FFF9DB" d="M3.766.634a.25.25 0 0 1 .468 0l.527 1.423A2 2 0 0 0 5.943 3.24l1.423.527a.25.25 0 0 1 0 .468l-1.423.527A2 2 0 0 0 4.76 5.943l-.527 1.423a.25.25 0 0 1-.468 0l-.527-1.423A2 2 0 0 0 2.057 4.76L.634 4.234a.25.25 0 0 1 0-.468l1.423-.527A2 2 0 0 0 3.24 2.057z" />
                                                                </svg>
                                                            </li>
                                                            <li className="flex h-[10px] w-[10px] items-center justify-center rounded-full bg-gradient-to-b from-[#5383e8] to-[#7d59ea]">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="none" viewBox="0 0 8 8">
                                                                    <path fill="#FFF9DB" d="M3.766.634a.25.25 0 0 1 .468 0l.527 1.423A2 2 0 0 0 5.943 3.24l1.423.527a.25.25 0 0 1 0 .468l-1.423.527A2 2 0 0 0 4.76 5.943l-.527 1.423a.25.25 0 0 1-.468 0l-.527-1.423A2 2 0 0 0 2.057 4.76L.634 4.234a.25.25 0 0 1 0-.468l1.423-.527A2 2 0 0 0 3.24 2.057z" />
                                                                </svg>
                                                            </li>
                                                        </ol>
                                                        
                                                    )} 
                                                </div>
                                                <p className="text-neutral-400">Milestone <strong>{mastery.championSeasonMilestone}</strong></p>
                                            </div>
                                            <div className="flex items-center gap-1 my-1">
                                                <p>{mastery.championPointsSinceLastLevel}</p>
                                                <div className="h-2 w-full bg-neutral-700">
                                                    {Math.round(mastery.championPointsSinceLastLevel/(mastery.championPointsSinceLastLevel+mastery.championPointsUntilNextLevel) * 100) > 100 ? (
                                                        <div className="h-full bg-purple-400"></div>
                                                    ) : (
                                                        <div className="h-full bg-purple-400" style={{width: `${Math.round(mastery.championPointsSinceLastLevel / (mastery.championPointsSinceLastLevel+mastery.championPointsUntilNextLevel) * 100)}%` }}></div>
                                                    )}
                                                </div>
                                                <p>{mastery.championPointsSinceLastLevel+mastery.championPointsUntilNextLevel}</p>
                                            </div>
                                            <p>Last time played: {mastery.lastPlayTime != null ? new Date(mastery.lastPlayTime).toLocaleDateString("en-US", {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false}): "Never played"}</p>
                                        </div>
                                    </div>
                                }
                                allowHTML={true}
                                interactive={true}
                                placement="top"
                            >
                                <div className="justify-center transition-all hover:bg-neutral-700 rounded py-4 mb-3 ">
                                    <ChampionImage championId={mastery.championId} isTeamIdSame={true} classes="h-20 mx-auto" />
                                    <div className="relative">
                                        <svg className="absolute left-1/2 -translate-x-1/2" width="49" height="35" viewBox="0 0 49 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path opacity="0.5" d="M0.5 0H48.5V35L24.5 25L0.5 35V0Z" fill="#1C1C1F" />
                                        </svg>
                                        <img src={`https://opgg-static.akamaized.net/images/champion_mastery/renew_v2/mastery-${mastery.championLevel > 10 ? 10 : mastery.championLevel}.png`} alt={`${mastery.championLevel}`} className="relative h-14 mx-auto" />
                                        {mastery.championLevel > 10 && (
                                            <p className="text-sm bg-neutral-900 pl-2 pr-2 absolute transform bottom-0 left-1/2 -translate-x-1/2 mx-auto">{mastery.championLevel}</p>
                                        )}
                                    </div>
                                    <p className="w-fit font-bold mx-auto border-b-1 px-2 border-neutral-900">{champ?.name ?? "…"}</p>
                                    <p className="text-md text-gray-200 text-center">{mastery.championPoints}</p>
                                </div>
                            </Tippy>
                        )
                    })}
                </div>
            ) : (
                <div className="h-[200px] bg-neutral-800 text-neutral-50 text-2xl mb-2 p-4 flex items-center justify-center">No Masteries found</div>
            )}
        </div>
    );
};

export default Masteries;
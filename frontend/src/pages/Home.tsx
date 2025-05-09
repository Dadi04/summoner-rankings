import React, { useState, useRef, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import logodark from "../assets/logo-dark.png";
import arrowdown from "../assets/arrow-down-dark.png"

interface RegionItem {
    name: string;
    abbr: string;
    code: string;
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

const MAX_HISTORY = 5;
const COOKIE_NAME = "recentSearches";

const Home: React.FC = () => {
    const [showRegion, setShowRegion] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<RegionItem>(REGION_ITEMS[0]);
    const [openSearchDiv, setOpenSearchDiv] = useState<boolean>(false);
    const [searchDiv, setSearchDiv] = useState<"search-history" | "favorites">("search-history");
    const [summonerInput, setSummonerInput] = useState("");
    const [history, setHistory] = useState<{ summoner: string; region: string }[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const dropdownToggleRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);
    const searchDivRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const existing = Cookies.get(COOKIE_NAME);
        if (existing) {
            try {
                const arr = JSON.parse(existing) as { summoner: string; region: string }[];
                setHistory(arr);
            } catch {
                Cookies.remove(COOKIE_NAME);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownToggleRef.current && !dropdownToggleRef.current.contains(event.target as Node) && dropdownListRef.current && !dropdownListRef.current.contains(event.target as Node)) {
                setShowRegion(false);
            }

            if (searchDivRef.current && !searchDivRef.current.contains(event.target as Node)) {
                setOpenSearchDiv(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    const handleSelect = (region: RegionItem) => {
        setSelectedRegion(region);
        setShowRegion(false);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const formattedSummoner = summonerInput.replace("#", "-");
        const encodedSummoner = encodeURIComponent(formattedSummoner);

        const newEntry = {
            summoner: summonerInput,
            region: selectedRegion.code
        };
        const existingCookie = Cookies.get(COOKIE_NAME);
        let historyArr = existingCookie ? (JSON.parse(existingCookie) as typeof history) : [];

        historyArr = historyArr.filter(item => !(item.summoner === newEntry.summoner && item.region === newEntry.region));
        historyArr.unshift(newEntry);
        historyArr = historyArr.slice(0, MAX_HISTORY);

        Cookies.set(COOKIE_NAME, JSON.stringify(historyArr), { expires: 7 });
        setHistory(historyArr);

        navigate(`/lol/profile/${selectedRegion.code}/${encodedSummoner}`, {state: {region: selectedRegion, summoner: encodedSummoner}});
    };

    return (
        <div className="flex justify-center flex-col items-center mt-20 mb-[251px]">
            <div className="container m-auto w-90">
                <img src={logodark} alt="logo-dark" />
            </div>
            <div className="container m-auto w-220 mt-5 p-5 bg-neutral-200 rounded-4xl relative">
                <form onSubmit={handleSubmit} className="flex items-center justify-between">
                    <div className="flex flex-col border-r-1 pl-2 pr-2 w-80">
                        <p className="font-medium">Region</p>
                        <div ref={dropdownToggleRef} onClick={() => setShowRegion((prev) => !prev)} className="flex justify-between cursor-pointer w-60">
                            <span>{selectedRegion.name}</span>
                            <img src={arrowdown} alt="arrow-down" className={`h-5 transform transition-transform duration-150 ${showRegion ? "rotate-180" : ""} `} />
                        </div>
                    </div>
                    <div ref={dropdownListRef} className={`absolute top-full left-0 w-full bg-neutral-700 shadow-md z-150 transition-all duration-200 transform ${showRegion ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                        <ul className="grid grid-cols-[33.33%_33.33%_33.33%] text-white">
                            {REGION_ITEMS.map((region) => (
                                <li key={region.code} onClick={() => handleSelect(region)} className="flex justify-between border-b-1 border-white items-center px-3 py-2 hover:bg-neutral-600 cursor-pointer">
                                    {region.name}
                                    <span className="text-xl font-bold">{region.abbr}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col w-full ml-2">
                        <p className="font-medium">Search</p>
                        <input type="text" name="summoner" value={summonerInput} onClick={() => setOpenSearchDiv(prev => !prev)} onChange={(e) => setSummonerInput(e.target.value)} placeholder="Game Name + #TAG" className="w-full outline-none border-none" />
                    </div>
                    <div ref={searchDivRef} className={`absolute mt-1 top-full left-0 overflow-hidden w-full bg-gray-100 shadow-md z-150 transition-all duration-300 ease-in-out transform ${openSearchDiv ? "max-h-[300px]" : "max-h-0 pointer-events-none"}`}>
                        <div className="flex justify-between">
                            <div onClick={() => setSearchDiv("search-history")} className={`flex flex-1/2 text-center cursor-pointer transition-all hover:bg-neutral-200 ${searchDiv === "search-history" ? "bg-neutral-200" : ""}`}>
                                <h1 className="w-full text-lg font-semibold">Search History</h1>
                            </div>
                            <div onClick={() => setSearchDiv("favorites")} className={`flex flex-1/2 text-center cursor-pointer transition-all hover:bg-neutral-200 ${searchDiv === "favorites" ? "bg-neutral-200" : ""}`}>
                                <h1 className="w-full text-lg font-semibold">Favorites</h1>
                            </div>
                        </div>
                        {searchDiv === "search-history" ? (
                            <div>
                                {history.length > 0 ? (
                                    <div className="flex flex-col">
                                        {history.map(entry => {
                                            // trebalo bi da bude link umesto setSummonerInput al ok
                                            const id = `${entry.summoner}-${entry.region}`;
                                            const isFav = favorites.includes(id);

                                            const toggleFav = () => {
                                                setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id] );
                                            };

                                            const region = REGION_ITEMS.find(r => r.code === entry.region);
                                            return (
                                                <div key={id} className="flex p-2 items-center justify-between">
                                                    <div className="flex gap-2 items-center">
                                                        <p className="bg-purple-700 text-neutral-50 rounded-lg p-[3px] font-semibold">{region?.abbr}</p>
                                                        <p onClick={() => setSummonerInput(entry.summoner)} className="text-lg">{entry.summoner}</p>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <button key={`${entry.summoner}-${entry.region}-star`} type="button" onClick={toggleFav} className="cursor-pointer trasition-all transfrom scale-110" aria-label="Favorite">
                                                            <svg className="star-svg" width="24" height="24" viewBox="0 0 24 24" fill={isFav ? "yellow" : "none"} stroke={isFav ? "yellow" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                            </svg>
                                                        </button>
                                                        <button key={`${entry.summoner}-${entry.region}-delete`} type="button" className="cursor-pointer transition-transform transform hover:scale-110" aria-label="Delete History Entry">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p>No Recent Searches</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                {favorites.length > 0 ? (
                                    <div>

                                    </div>
                                ) : (
                                    <div className="flex flex-col py-10">
                                        <div className="w-full flex justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        </div>
                                        <p className="text-lg text-center">Add your favorite summoner for easy updates on the latest stats.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;
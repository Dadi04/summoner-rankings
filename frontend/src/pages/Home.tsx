import React, { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import PlayerBasicInfo from "../interfaces/PlayerBasicInfo";

import logodark from "../assets/logo-dark.png";
import arrowdown from "../assets/arrow-down-dark.png"

interface RegionItem {
    name: string;
    abbr: string;
    code: string;
}

interface FavoritePlayer {
    id: string;
    summonerName: string;
    region: string;
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
    const [favorites, setFavorites] = useState<FavoritePlayer[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [allPlayers, setAllPlayers] = useState<PlayerBasicInfo[]>([]);

    const dropdownToggleRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);
    const searchDivRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const checkAuthStatus = () => {
        const token = localStorage.getItem("jwt");
        setIsAuthenticated(!!token);
    };

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
        
        checkAuthStatus();
        
        window.addEventListener("storage", event => {
            if (event.key === "jwt") {
                checkAuthStatus();
            }
        });
        
        const handleAuthChange = () => checkAuthStatus();
        window.addEventListener("authStateChanged", handleAuthChange);
        
        return () => {
            window.removeEventListener("storage", event => {
                if (event.key === "jwt") {
                    checkAuthStatus();
                }
            });
            window.removeEventListener("authStateChanged", handleAuthChange);
        };
    }, []);

    useEffect(() => {
        fetch("/api/searchaccounts")
            .then((res) => res.ok ? res.json() : Promise.reject(res.statusText))
            .then((data: PlayerBasicInfo[]) => setAllPlayers(data))
            .catch((err) => console.error("Failed to load players:", err))
    }, []);

    const filteredPlayers = useMemo(() => {
        const q = summonerInput.trim().toLowerCase();
        if (q === "") return [];
        return allPlayers.filter(p => p.summonerName.toLowerCase().includes(q));
    }, [allPlayers, summonerInput]);

    const fetchFavorites = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            setIsLoading(true);
            const token = localStorage.getItem("jwt");
            const response = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, setFavorites]);

    useEffect(() => {
        if (searchDiv === "favorites" && openSearchDiv && isAuthenticated) {
            fetchFavorites();
        }
    }, [searchDiv, openSearchDiv, isAuthenticated, fetchFavorites]);

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

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [location.pathname, isAuthenticated, fetchFavorites]);

    useEffect(() => {
        if (!isAuthenticated) {
            setFavorites([]);
        }
    }, [isAuthenticated]);

    const handleSelect = (region: RegionItem) => {
        setSelectedRegion(region);
        setShowRegion(false);
    }

    const handleDelete = (entryToDelete: { summoner: string; region: string }) => {
        const newHistory = history.filter((h) => !(h.summoner === entryToDelete.summoner && h.region === entryToDelete.region));
        setHistory(newHistory);

        Cookies.set(COOKIE_NAME, JSON.stringify(newHistory), { expires: 7 });
    };

    const toggleFavorite = async (entry: { summoner: string; region: string }) => {
        if (!isAuthenticated) {
            alert("You need to be signed in to use Favorites");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                alert("Authentication token not found. Please sign in again.");
                setIsAuthenticated(false);
                return;
            }
            
            const isFavorited = favorites.some(fav => 
                fav.summonerName === entry.summoner && 
                fav.region === entry.region
            );
            
            const method = isFavorited ? 'DELETE' : 'POST';
            
            const response = await fetch('/api/favorites', {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    summonerName: entry.summoner,
                    region: entry.region
                })
            });

            if (response.ok) {
                if (isFavorited) {
                    setFavorites(favorites.filter(fav => 
                        !(fav.summonerName === entry.summoner && fav.region === entry.region)
                    ));
                } else {
                    fetchFavorites();
                }
            } else if (response.status === 401) {
                alert("Your session has expired. Please sign in again.");
                setIsAuthenticated(false);
                localStorage.removeItem("jwt");
            } else {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                console.error("Error toggling favorite:", errorData);
                alert(`Failed to update favorite: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (favorite: FavoritePlayer) => {
        if (!isAuthenticated) return;
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    summonerName: favorite.summonerName,
                    region: favorite.region
                })
            });

            if (response.ok) {
                setFavorites(favorites.filter(fav => fav.id !== favorite.id));
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const pushToHistory = (summoner: string, tag: string, region: string) => {
        const newEntry = { summoner, region };
        let next = history.filter(
            h => !(h.summoner === `${summoner}#${tag}` && h.region === region)
        );
        next.unshift(newEntry);
        next = next.slice(0, MAX_HISTORY);

        setHistory(next);
        Cookies.set(COOKIE_NAME, JSON.stringify(next), { expires: 7 });
    };

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

    const isEntryFavorited = (entry: { summoner: string; region: string }) => {
        if (!isAuthenticated) return false;
        
        return favorites.some(fav => 
            fav.summonerName === entry.summoner && 
            fav.region === entry.region
        );
    };

    const addToSearchHistory = (favorite: FavoritePlayer) => {
        const existingEntry = history.find(h => 
            h.summoner === favorite.summonerName && 
            h.region === favorite.region
        );

        if (!existingEntry) {
            const newEntry = {
                summoner: favorite.summonerName,
                region: favorite.region
            };

            const newHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
            
            setHistory(newHistory);
            Cookies.set(COOKIE_NAME, JSON.stringify(newHistory), { expires: 7 });
        }
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
                            summonerInput.trim() === "" ? (
                                <div>
                                    {history.length > 0 ? (
                                        <div className="flex flex-col">
                                            {history.map(entry => {
                                                const id = `${entry.summoner}-${entry.region}`;
                                                const isFav = isEntryFavorited(entry);

                                                const region = REGION_ITEMS.find(r => r.code === entry.region);
                                                return (
                                                    <div key={id} className="flex p-2 items-center justify-between">
                                                        <div className="flex gap-2 items-center">
                                                            <p className="bg-purple-700 text-neutral-50 rounded-lg p-[3px] font-semibold">{region?.abbr}</p>
                                                            <Link to={`/lol/profile/${region?.code}/${entry.summoner.replace("#", "-")}`} onClick={() => setOpenSearchDiv(false)} className="text-lg cursor-pointer hover:underline">{entry.summoner}</Link>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <button 
                                                                key={`${entry.summoner}-${entry.region}-star`} 
                                                                type="button" 
                                                                onClick={() => toggleFavorite(entry)} 
                                                                className="cursor-pointer transition-all transform scale-110" 
                                                                aria-label="Favorite"
                                                                disabled={isLoading}
                                                            >
                                                                <svg className="star-svg" width="24" height="24" viewBox="0 0 24 24" fill={isAuthenticated && isFav ? "yellow" : "none"} stroke={isAuthenticated && isFav ? "yellow" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                                </svg>
                                                            </button>
                                                            <button key={`${entry.summoner}-${entry.region}-delete`} type="button" onClick={() => handleDelete(entry)} className="cursor-pointer transition-transform transform hover:scale-110" aria-label="Delete History Entry">
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
                                        <p className="p-3 text-lg text-center">No Recent Searches</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredPlayers.length > 0 ? (
                                        filteredPlayers.map(player => {
                                            const id = `${player.summonerName}-${player.region}`;
                                            const region = REGION_ITEMS.find(r => r.code === player.region);
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center justify-between p-2 transition-all hover:bg-neutral-200 cursor-pointer"
                                                    onClick={() => {
                                                        const urlName = encodeURIComponent(`${player.summonerName}-${player.summonerTag}`);
                                                        pushToHistory(player.summonerName, player.summonerTag, player.region);
                                                        navigate(`/lol/profile/${player.region}/${urlName}`);
                                                        setOpenSearchDiv(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={`https://cdn.communitydragon.org/latest/profile-icon/${player.profileIcon}`}
                                                            alt={`${player.profileIcon}`}
                                                            className="w-8"
                                                        />
                                                        <span className="text-lg cursor-pointer hover:underline">{player.summonerName}#{player.summonerTag}</span>
                                                    </div>
                                                    <p className="bg-purple-700 text-neutral-50 rounded-lg p-[3px] font-semibold">
                                                        {region?.abbr}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="p-4 text-center text-gray-500">
                                            No accounts match "{summonerInput}"
                                        </p>
                                    )}
                                </div>
                            )
                        ) : (
                            <div>
                                {!isAuthenticated ? (
                                    <div className="flex flex-col py-10">
                                        <div className="w-full flex justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                                                <path d="M12 16v-4"></path>
                                                <path d="M12 8h.01"></path>
                                            </svg>
                                        </div>
                                        <p className="text-lg text-center mt-2">You need to be signed in to use Favorites</p>
                                    </div>
                                ) : favorites.length > 0 ? (
                                    <div className="flex flex-col">
                                        {isLoading && (
                                            <div className="text-center py-2 bg-purple-100">
                                                <span className="text-purple-700 font-medium">Refreshing favorites...</span>
                                            </div>
                                        )}
                                        {favorites.map(favorite => {
                                            const region = REGION_ITEMS.find(r => r.code === favorite.region);
                                            return (
                                                <div key={favorite.id} className="flex p-2 items-center justify-between">
                                                    <div className="flex gap-2 items-center">
                                                        <p className="bg-purple-700 text-neutral-50 rounded-lg p-[3px] font-semibold">{region?.abbr}</p>
                                                        <Link 
                                                            to={`/lol/profile/${favorite.region}/${favorite.summonerName.replace("#", "-")}`} 
                                                            onClick={() => {
                                                                setOpenSearchDiv(false);
                                                                addToSearchHistory(favorite);
                                                            }} 
                                                            className="text-lg cursor-pointer hover:underline"
                                                        >
                                                            {favorite.summonerName}
                                                        </Link>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeFavorite(favorite)} 
                                                            className="cursor-pointer transition-transform transform hover:scale-110" 
                                                            aria-label="Remove Favorite"
                                                            disabled={isLoading}
                                                        >
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
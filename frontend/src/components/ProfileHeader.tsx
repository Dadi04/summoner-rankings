import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import UpdateButton from "./UpdateButton";

import Player from "../interfaces/Player";

const ProfileHeader: React.FC<{data: Player; regionCode: string; encodedSummoner: string; setData: React.Dispatch<React.SetStateAction<any>>;}> = ({data, regionCode, encodedSummoner, setData}) => {
    const summonerData = data.summonerData;
    const spectatorData = data.spectatorData;

    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem("jwt");
            setIsAuthenticated(!!token);
        };
        
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
        if (!isAuthenticated) {
            setIsFavorite(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const token = localStorage.getItem("jwt");
                if (!token) return;

                const response = await fetch(`/api/favorites/check?region=${regionCode}&summoner=${data.playerBasicInfo.summonerName}${data.playerBasicInfo.summonerTag ? `-${data.playerBasicInfo.summonerTag}` : ''}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setIsFavorite(result.isFavorite);
                }
            } catch (error) {
                console.error("Error checking favorite status:", error);
            }
        };
        
        if (isAuthenticated) {
            checkFavoriteStatus();
        } else {
            setIsFavorite(false);
        }
    }, [regionCode, data.playerBasicInfo.summonerName, data.playerBasicInfo.summonerTag, isAuthenticated]);

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            alert("You need to be signed in to add favorites");
            return;
        }

        const token = localStorage.getItem("jwt");
        if (!token) {
            setIsAuthenticated(false);
            alert("You need to be signed in to add favorites");
            return;
        }

        setIsLoading(true);
        try {
            
            const method = isFavorite ? 'DELETE' : 'POST';
            const summonerIdentifier = `${data.playerBasicInfo.summonerName}${data.playerBasicInfo.summonerTag ? `#${data.playerBasicInfo.summonerTag}` : ''}`;
            
            const response = await fetch('/api/favorites', {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    summonerName: summonerIdentifier,
                    region: regionCode
                })
            });

            if (response.ok) {
                setIsFavorite(!isFavorite);
            } else if (response.status === 401) {
                alert("Your session has expired. Please sign in again.");
                localStorage.removeItem("jwt");
                setIsAuthenticated(false);
                window.dispatchEvent(new Event("authStateChanged"));
            } else {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                console.error("Failed to update favorite status:", errorData);
                alert(`Failed to update favorite: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    let lastUpdated = Math.round((Date.now() - data.addedAt*1000)/60000);
    let timeUnit = lastUpdated === 1 ? "minute ago" : "minutes ago";
    if (lastUpdated > 60) {
        lastUpdated = Math.round(lastUpdated / 60);
        timeUnit = lastUpdated === 1 ? "hour ago" : "hours ago";
        if (lastUpdated > 24) {
            lastUpdated = Math.round(lastUpdated / 24);
            timeUnit = lastUpdated === 1 ? "day ago" : "days ago";
            if (lastUpdated > 7) {
                lastUpdated = Math.round(lastUpdated / 7);
                timeUnit = lastUpdated === 1 ? "week ago" : "weeks ago";
                if (lastUpdated > 4) {
                    lastUpdated = Math.round(lastUpdated / 4);
                    timeUnit = lastUpdated === 1 ? "month ago" : "months ago";
                    if (lastUpdated > 12) {
                        lastUpdated = Math.round(lastUpdated / 12);
                        timeUnit = lastUpdated === 1 ? "year ago" : "years ago";
                    }
                }
            }
        }
    } 

    const getLinkClasses = (isActive: boolean) => 
        isActive 
            ? "cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100"
            : "cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600";

    return (
        <div className="w-full bg-neutral-800 mt-1">
            <div className="flex border-b-1 pt-5 pb-5 pl-5">
                <div className="relative p-3">
                    <img src={`https://cdn.communitydragon.org/latest/profile-icon/${summonerData.profileIconId}`} alt={`${summonerData.profileIconId}`} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-[10px] z-10 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                </div>
                <div className="pt-3 pb-3">
                    <div className="flex">
                        <h1 className="text-white font-bold text-3xl mr-2">{data.playerBasicInfo.summonerName}</h1>
                        <h1 className="text-neutral-400 text-3xl mr-2">#{data.playerBasicInfo.summonerTag}</h1>
                        <button 
                            type="button" 
                            onClick={toggleFavorite} 
                            className={`star-button ${isLoading ? 'opacity-50' : ''}`} 
                            aria-label="Favorite"
                            disabled={isLoading}
                        >
                            <svg className="star-svg" width="24" height="24" viewBox="0 0 24 24" fill={isAuthenticated && isFavorite ? "yellow" : "none"} stroke={isAuthenticated && isFavorite ? "yellow" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </button>
                    </div>
                    <div className="flex text-sm text-neutral-100">
                        <div className="pt-2 pb-2 pl-1">
                            <p className="uppercase border-r-1 pr-2">{data.playerBasicInfo.region}</p>
                        </div>
                        <p className="p-2">Ladder Rank TODO</p>
                    </div>
                    <div className="text-neutral-50">
                        <UpdateButton regionCode={regionCode} encodedSummoner={encodedSummoner} api={`/api/lol/profile/${regionCode}/${encodedSummoner}/update`} buttonText={"Update"} setData={setData} />
                        <p>Last updated: {lastUpdated} {timeUnit}</p>
                    </div>
                </div>
            </div>
            <div className="p-2">
                <ul className="flex gap-10 p-2">
                    <li>
                        <NavLink to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: data}} end className={({isActive}) => getLinkClasses(isActive)}>
                            Summary
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: data}} className={({isActive}) => getLinkClasses(isActive)}>
                            Champions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: data}} className={({isActive}) => getLinkClasses(isActive)}>
                            Mastery
                        </NavLink>
                    </li>
                    {spectatorData ? (
                        <li>
                            <NavLink to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: data}} className={({isActive}) => getLinkClasses(isActive)}>
                                Live Game
                                <span className="animate-pulse text-purple-500 ml-1.5">●</span>
                            </NavLink>
                        </li>
                    ) : (
                        <li>
                            <NavLink to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: data}} className={({isActive}) => getLinkClasses(isActive)}>
                                Live Game
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ProfileHeader;
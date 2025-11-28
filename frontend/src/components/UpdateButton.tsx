import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playerCache, generateCacheKey, dispatchPlayerCacheUpdate } from "../utils/playerCache";

interface UpdateButtonProps {
    regionCode: string;
    encodedSummoner: string;
    api: string;
    buttonText: string;
    setData?: React.Dispatch<React.SetStateAction<any>>;
    onSuccess?: (data: any) => void | Promise<void>;
    shouldNavigate?: boolean;
    classes?: string;
}

const UpdateButton: React.FC<UpdateButtonProps> = ({
    regionCode,
    encodedSummoner,
    api,
    buttonText,
    setData,
    onSuccess,
    shouldNavigate = true,
    classes,
}) => {
    const [cooldown, setCooldown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const navigate = useNavigate();
    const storageKey = `cooldownExpires-${buttonText}-${api}`;
    useEffect(() => {
        const savedTime = localStorage.getItem(storageKey);
        if (savedTime) {
            const expiresAt = parseInt(savedTime, 10);
            const now = Date.now();
            if (expiresAt > now) {
                setCooldown(true);
                setRemainingTime(Math.ceil((expiresAt - now) / 60000));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [buttonText, api, storageKey]);
    
    useEffect(() => {
        if (cooldown && remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCooldown(false);
                        localStorage.removeItem(storageKey);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [cooldown, remainingTime, buttonText, api, storageKey])

    const handleClick = async () => {
        if (cooldown || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(api); 
            if (!response.ok) {
                console.error("API Error:", response.statusText);
            } else {
                const newLiveData = await response.json();
                setData?.(newLiveData);
                
                const decoded = decodeURIComponent(encodedSummoner);
                const cacheKey = generateCacheKey(regionCode, decoded);

                await playerCache.setItem(cacheKey, newLiveData);

                dispatchPlayerCacheUpdate(cacheKey, newLiveData);
                if (onSuccess) {
                    await onSuccess(newLiveData);
                }
                if (shouldNavigate) {
                    navigate(`/lol/profile/${regionCode}/${encodedSummoner}`);
                }
            }
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsLoading(false);
            setCooldown(true);
            setRemainingTime(5);

            const expiresAt = Date.now() + 300000;
            localStorage.setItem(storageKey, expiresAt.toString());
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={cooldown} 
            className={`${classes} focus:outline-none text-white ${cooldown || isLoading ? "bg-gray-500 cursor-not-allowed brightness-70" : "cursor-pointer"}`}>
            {isLoading ? (
                <span className="flex items-center">
                    <svg 
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            ></circle>
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8v8z"
                        ></path>
                    </svg>
                    Loading...
                </span>
            ) : cooldown ? (
                `Wait ${remainingTime} min...`
            ) : (
                buttonText
            )}
        </button>
    );
};

export default UpdateButton;
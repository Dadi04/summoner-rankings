import React, { useState, useEffect } from 'react';
import {  } from 'react-router-dom';

const UpdateButton: React.FC<{updateSpectatorData: boolean; api: string; buttonText: string; setData: React.Dispatch<React.SetStateAction<any>>;}> = ({updateSpectatorData, api, buttonText, setData}) => {
    const [cooldown, setCooldown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
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
    }, [buttonText]);
    
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
    }, [cooldown, remainingTime, buttonText])

    const handleClick = async () => {
        if (cooldown || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(api); 
            if (!response.ok) {
                console.error("API Error:", response.statusText);
            } else {
                const newLiveData = await response.json();
                if (updateSpectatorData) {
                    setData(newLiveData.spectator);
                } else {
                    setData(newLiveData);
                    console.log("button", newLiveData);
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
            className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 
                ${cooldown || isLoading ? "bg-gray-500 cursor-not-allowed brightness-70" : "bg-purple-700 hover:bg-purple-800"} focus:ring-4 focus:ring-purple-300`}>
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

export default UpdateButton
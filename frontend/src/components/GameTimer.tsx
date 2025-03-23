import React, {useState, useEffect} from 'react';

interface GameTimerProps {
    initialTime: number;
    storageKey?: string;
}

const GameTimer: React.FC<GameTimerProps> = ({ initialTime, storageKey = 'gameStartTime' }) => {
    let storedStartTime = localStorage.getItem(storageKey);
    if (!storedStartTime) {
        localStorage.setItem(storageKey, Date.now().toString());
        storedStartTime = Date.now().toString();
    }
    
    const startTime = parseInt(storedStartTime, 10);
    const getElapsedTime = (): number => {
        return Math.floor((Date.now() - startTime) / 1000) + initialTime;
    };

    const [time, setTime] = useState<number>(getElapsedTime());
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(getElapsedTime());
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [startTime, initialTime]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
};

export default GameTimer;
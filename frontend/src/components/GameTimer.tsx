import React, {useState, useEffect} from 'react';

interface GameTimerProps {
    gameLength: number;
    gameStartTime: number;
    storageKey?: string;
}

const GameTimer: React.FC<GameTimerProps> = ({ gameLength, gameStartTime }) => {
    const getElapsedTime = (): number => {
        return Math.floor((Date.now() - gameStartTime) / 1000);
    };

    const [time, setTime] = useState<number>(getElapsedTime());
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(getElapsedTime());
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [gameLength]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
};

export default GameTimer;
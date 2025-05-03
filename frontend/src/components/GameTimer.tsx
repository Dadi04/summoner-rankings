import { useEffect, useState } from "react";

const GameTimer: React.FC<{gameLength: number; gameStartTime: number; classes: string;}> = ({ gameLength, gameStartTime, classes }) => {
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
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return (
        <h1 className={classes}>{formattedTime}</h1>
    );
};

export default GameTimer
import React from "react";
import queueJson from "../assets/json/queues.json";
import GameTimer from "./GameTimer";

interface LiveGameProps {
    data: any;
}

const LiveGame: React.FC<LiveGameProps> = ({data}) => {

    const setGamemode = () => {
        const queueId = data.spectator.gameQueueConfigId;
        const queueData = queueJson.find(item => item.queueId === queueId);

        return queueData ? queueData.description : "Unknown game mode";
    };

    const setMap = () => {
        const queueId = data.spectator.gameQueueConfigId;
        const queueData = queueJson.find(item => item.queueId === queueId);

        return queueData ? queueData.map : "Unknown map";
    };

    const isGameLive = () => {
        if (data.spectator) {
            return (
                <div>
                    <div className="flex mb-4">
                        <h1 className="mr-2">{setGamemode()}</h1>
                        <h1 className="mr-2 bg-purple-600 pl-2 pr-2 text-neutral-100 rounded font-bold text-sm">Live</h1>
                        <h1 className="mr-2 border-r-1 border-l-1 pl-2 pr-2 border-neutral-600">{setMap()}</h1>
                        <h1 className="mr-2"><GameTimer initialTime={data.spectator.gameLength} /></h1>
                    </div>
                    <div className="flex">
                        <div>

                        </div>
                        <div>

                        </div>
                    </div>
                    <div>
                        <div className="grid grid-cols-8 gap-4 items-center w-full mb-2">
                            <div className="col-span-2 flex items-center">
                                <h1 className="font-bold text-blue-500 mr-2">Blue Team</h1>
                                <h1 className="text-blue-500 mr-1">Tier Average:</h1>
                                <h1 className="font-bold text-blue-500">avg</h1>
                            </div>
                            <p>S15 Rank</p>
                            <p>S15 WR</p>
                            <p>Champion WR</p>
                            <p>Champion Info</p>
                            <p>S14-3</p>
                            <p>Runes</p>
                        </div>
                        <div className="grid grid-cols-8 gap-4 items-center w-full">
                            <div className="col-span-2 flex items-center">
                                <h1 className="font-bold text-red-500 mr-2">Red Team</h1>
                                <h1 className="text-red-500 mr-1">Tier Average:</h1>
                                <h1 className="font-bold text-red-500">avg</h1>
                            </div>
                            <p>S15 Rank</p>
                            <p>S15 WR</p>
                            <p>Champion WR</p>
                            <p>Champion Info</p>
                            <p>S14-3</p>
                            <p>Runes</p>
                        </div>
                    </div>
                </div>
            )
        } 
        return (
            <div className="text-center pt-2 pb-2">
                <h2 className="text-2xl font-semibold text-neutral-800">"{data.player.gameName}#{data.player.tagLine}" is not in an active game.</h2>
                <p className="text-lg text-neutral-700">Please try again later if the summoner is currently in game.</p>
            </div>
        )
    };


    return (
        <div>
            {isGameLive()}
        </div>
    );
};

export default LiveGame;
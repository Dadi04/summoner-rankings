import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import favorite from "../assets/favorite.svg";
import Summary from '../components/Summary';
import Champions from '../components/Champions';
import Mastery from '../components/Mastery';
import LiveGame from '../components/LiveGame';

interface ApiData {
    summoner: {
        profileIconId: string;
        summonerLevel: number;
    };
    player: {
        gameName: string;
        tagLine: string;
    };
    region: string;
}

// on refresh dont call api call again
const Summoner: React.FC = () => {
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    const summoner = decodeURIComponent(encodedSummoner);

    const [apiData, setApiData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Summary");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/lol/profile/${regionCode}/${summoner}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApiData(data);
            } catch (error) {
                console.log('Error fetching API data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [regionCode, summoner]);

    if (loading || !apiData) {
        return <div>Loading...</div>
    }

    const renderTabContent = () => {
        switch(activeTab) {
            case "Summary":
                return <Summary data={apiData}/>;
            case "Champions":
                return <Champions data={apiData}/>;
            case "Mastery":
                return <Mastery data={apiData}/>;
            case "Live Game":
                return <LiveGame data={apiData}/>;
            default:
                return null;
        }
    };

    return (
        <div className="container m-auto">
            <div className="w-full bg-neutral-300">
                <div className="flex border-b-1 pt-5 pb-5 pl-5">
                    <div className="relative p-3">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${apiData.summoner.profileIconId}.png`} alt={apiData.summoner.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{apiData.summoner.summonerLevel}</span>
                    </div>
                    <div className="pt-3 pb-3">
                        <div className="flex">
                            <h1 className="text-white font-bold text-3xl mr-2">{apiData.player.gameName}</h1>
                            <h1 className="text-neutral-400 text-3xl mr-2">#{apiData.player.tagLine}</h1>
                            <button type="button" className="bg-neutral-400 pl-1.5 pr-1.5 rounded-lg">
                                <img src={favorite} alt="favorite.svg" className="h-6 border-1 border-neutral-300 rounded" />
                            </button>
                        </div>
                        <div className="flex text-sm text-neutral-700">
                            <div className="pt-2 pb-2 pl-1">
                                <p className="uppercase border-r-1 pr-2">{apiData.region}</p>
                            </div>
                            <p className="p-2">Ladder Rank num </p>
                        </div>
                        <div>
                            <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Update</button>
                        </div>
                    </div>  
                </div>
                <div className="p-2">
                    <ul className="flex gap-10">
                        <li onClick={() => setActiveTab("Summary")} className={`cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition duration-150 ease-in hover:bg-neutral-400 ${activeTab === "Summary" ? "bg-neutral-200 border" : ""}`}>Summary</li>
                        <li onClick={() => setActiveTab("Champions")} className={`cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition duration-150 ease-in hover:bg-neutral-400 ${activeTab === "Champions" ? "bg-neutral-200 border" : ""}`}>Champions</li>
                        <li onClick={() => setActiveTab("Mastery")} className={`cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition duration-150 ease-in hover:bg-neutral-400 ${activeTab === "Mastery" ? "bg-neutral-200 border" : ""}`}>Mastery</li>
                        <li onClick={() => setActiveTab("Live Game")} className={`cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition duration-150 ease-in hover:bg-neutral-400 ${activeTab === "Live Game" ? "bg-neutral-200 border" : ""}`}>Live Game</li>
                    </ul>
                </div>
            </div>
            <div className="container mt-2 bg-neutral-300 rounded pt-3 pb-5 pr-5 pl-5">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Summoner;
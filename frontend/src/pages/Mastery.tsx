import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import favorite from "../assets/favorite.svg";

const Mastery: React.FC = () => {
    const location = useLocation();
    const apiData = location.state?.apiData;
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }

    const summonerData = JSON.parse(apiData.summonerData);
    const entriesData = JSON.parse(apiData.entriesData);
    const topMasteriesData = JSON.parse(apiData.topMasteriesData);
    const matchesData = JSON.parse(apiData.matchesData);
    const rankedMatchesData = JSON.parse(apiData.rankedMatchesData);
    const challengesData = JSON.parse(apiData.challengesData);
    const spectatorData = JSON.parse(apiData.spectatorData);
    const clashData = JSON.parse(apiData.clashData);
    const championStatsData = JSON.parse(apiData.championStatsData);
    const preferredRoleData = JSON.parse(apiData.preferredRoleData);

    return (
        <div className="container m-auto">
            <div className="w-full bg-neutral-800 mt-1">
                <div className="flex border-b-1 pt-5 pb-5 pl-5">
                    <div className="relative p-3">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.profileIconId} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                    </div>
                    <div className="pt-3 pb-3">
                        <div className="flex">
                            <h1 className="text-white font-bold text-3xl mr-2">{apiData.summonerName}</h1>
                            <h1 className="text-neutral-400 text-3xl mr-2">#{apiData.summonerTag}</h1>
                            <button type="button" className="bg-neutral-200 pl-1.5 pr-1.5 rounded-lg">
                                <img src={favorite} alt="favorite" className="h-6 border-2 border-neutral-700 rounded" />
                            </button>
                        </div>
                        <div className="flex text-sm text-neutral-100">
                            <div className="pt-2 pb-2 pl-1">
                                <p className="uppercase border-r-1 pr-2">{apiData.region}</p>
                            </div>
                            <p className="p-2">Ladder Rank num </p>
                        </div>
                        <div>
                            <button type="button" className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-semibold rounded-lg text-md px-8 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Update</button>
                        </div>
                    </div>  
                </div>
                <div className="p-2">
                    <ul className="flex gap-10 p-2">
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Summary</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/champions`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Champions</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/mastery`} state={{apiData: apiData}} className="cursor-pointer pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600 bg-neutral-700 border text-purple-400 hover:text-neutral-100">Mastery</Link></li>
                        <li><Link to={`/lol/profile/${regionCode}/${encodedSummoner}/livegame`} state={{apiData: apiData}} className="cursor-pointer text-neutral-200 pt-3 pb-3 pl-5 pr-5 rounded transition-all duration-150 ease-in hover:bg-neutral-600">Live Game</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-2 text-neutral-50 bg-neutral-800">
                <h1 className="text-center">Mastery</h1>
                <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                <pre>{JSON.stringify(entriesData, null, 2)}</pre>
                <pre>{JSON.stringify(championStatsData, null, 2)}</pre>
                <pre>{JSON.stringify(preferredRoleData, null, 2)}</pre>
                <pre>{JSON.stringify(topMasteriesData, null, 2)}</pre>
                <pre>{JSON.stringify(matchesData, null, 2)}</pre>
                <pre>{JSON.stringify(rankedMatchesData, null, 2)}</pre>
                <pre>{JSON.stringify(spectatorData, null, 2)}</pre>
                <pre>{JSON.stringify(clashData, null, 2)}</pre>
                <pre>{JSON.stringify(challengesData, null, 2)}</pre>
            </div>
        </div>
    );
};

export default Mastery;
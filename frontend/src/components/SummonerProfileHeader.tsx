import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DD_VERSION } from '../version';

import UpdateButton from "../components/UpdateButton";

import Player from '../interfaces/Player';

const SummonerProfileHeader: React.FC<{data: Player; regionCode: string; encodedSummoner: string; setData: React.Dispatch<React.SetStateAction<any>>;}> = ({data, regionCode, encodedSummoner, setData}) => {
    const summonerData = data.summonerData;
    const spectatorData = data.spectatorData;

    const [isFavorite, setIsFavorite] = useState(false);

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
                    <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${summonerData.profileIconId}.png`} alt={`{summonerData.profileIconId}`} className="h-30 rounded-xl border-2 border-purple-600 mr-2" />
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-[10px] z-100 text-neutral-100 bg-black pt-0.5 pb-0.5 pl-1 pr-1 border-2 border-purple-600 mb-1">{summonerData.summonerLevel}</span>
                </div>
                <div className="pt-3 pb-3">
                    <div className="flex">
                        <h1 className="text-white font-bold text-3xl mr-2">{data.summonerName}</h1>
                        <h1 className="text-neutral-400 text-3xl mr-2">#{data.summonerTag}</h1>
                        <button type="button" onClick={() => setIsFavorite(prev => !prev)} className="star-button" aria-label="Favorite">
                            <svg className="star-svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "yellow" : "none"} stroke={isFavorite ? "yellow" : "#4b5563"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </button>
                    </div>
                    <div className="flex text-sm text-neutral-100">
                        <div className="pt-2 pb-2 pl-1">
                            <p className="uppercase border-r-1 pr-2">{data.region}</p>
                        </div>
                        <p className="p-2">Ladder Rank num </p>
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

export default SummonerProfileHeader;
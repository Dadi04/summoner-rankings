import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logodark from '../assets/logo-dark.png';
import arrowdown from '../assets/arrow-down-dark.png'

interface RegionItem {
    name: string;
    abbr: string;
    code: string;
}

const REGION_ITEMS: RegionItem[] = [
    { name: 'North America', abbr: 'NA', code: 'na1' },
    { name: 'Europe West', abbr: 'EUW', code: 'euw1' },
    { name: 'Europe Nordic & East', abbr: 'EUN', code: 'eun1' },
    { name: 'Korea', abbr: 'KR', code: 'kr' },
    { name: 'Oceania', abbr: 'OCE', code: 'oc1' },
    { name: 'Brazil', abbr: 'BR', code: 'br1' },
    { name: 'Latin America North', abbr: 'LAN', code: 'la1' },
    { name: 'Latin America South', abbr: 'LAS', code: 'la2' },
    { name: 'Japan', abbr: 'JP', code: 'jp1' },
    { name: 'Russia', abbr: 'RU', code: 'ru' },
    { name: 'Türkiye', abbr: 'TR', code: 'tr1' },
    { name: 'Southeast Asia', abbr: 'SEA', code: 'sg2' },
    { name: 'Taiwan', abbr: 'TW', code: 'tw2' },
    { name: 'Vietnam', abbr: 'VN', code: 'vn2' },
    { name: 'Middle East', abbr: 'ME', code: 'me1' },
];

const Home: React.FC = () => {
    const [showRegion, setShowRegion] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<RegionItem>(REGION_ITEMS[0]);
    const [summonerInput, setSummonerInput] = useState('');
    const dropdownToggleRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownToggleRef.current && !dropdownToggleRef.current.contains(event.target as Node) && dropdownListRef.current && !dropdownListRef.current.contains(event.target as Node)) {
                setShowRegion(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    const handleSelect = (region: RegionItem) => {
        setSelectedRegion(region);
        setShowRegion(false);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formattedSummonerName = summonerInput.replace('#', '-');
        const encodedSummoner = encodeURIComponent(formattedSummonerName);

        navigate(`/lol/profile/${selectedRegion.code}/${encodedSummoner}`, {state: {region: selectedRegion, summoner: encodedSummoner}});
    };

    return (
        <div className="flex justify-center flex-col items-center mt-20 mb-[251px]">
            <div className="container m-auto w-90">
                <img src={logodark} alt="logo-dark" />
            </div>
            <div className="container m-auto w-220 mt-5 p-5 bg-neutral-200 rounded-4xl relative">
                <form onSubmit={handleSubmit} className="flex items-center justify-between">
                    <div className="flex flex-col border-r-1 pl-2 pr-2 w-80">
                        <p className="font-medium">Region</p>
                        <div ref={dropdownToggleRef} onClick={() => setShowRegion((prev) => !prev)} className="flex justify-between cursor-pointer w-60">
                            <span>{selectedRegion.name}</span>
                            <img src={arrowdown} alt="arrow-down" className={`h-5 transform transition-transform duration-150 ${showRegion ? "rotate-180" : ""} `} />
                        </div>
                    </div>
                    <div ref={dropdownListRef} className={`absolute top-full left-0 w-full bg-neutral-700 shadow-md z-150 transition-all duration-200 transform ${showRegion ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                        <ul className="grid grid-cols-[33.33%_33.33%_33.33%] text-white">
                            {REGION_ITEMS.map((region) => (
                                <li key={region.code} onClick={() => handleSelect(region)} className="flex justify-between border-b-1 border-white items-center px-3 py-2 hover:bg-neutral-600 cursor-pointer">
                                    {region.name}
                                    <span className="text-xl font-bold">{region.abbr}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col w-full ml-2">
                        <p className="font-medium">Search</p>
                        <input type="text" name="summoner" value={summonerInput} onChange={(e) => setSummonerInput(e.target.value)} placeholder="Game Name + #TAG" className="w-full outline-none border-none" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;
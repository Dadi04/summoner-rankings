import React, { useState, useRef, useEffect } from "react";
import fill from "../assets/fill.png";
import arrowdown from "../assets/arrow-down-dark.png";

interface RegionItem {
    name: string;
    abbr: string;
    code: string;
}

const roleLabels: { role: string; label: string }[] = [
    { role: "TOP", label: "Top" },
    { role: "JUNGLE", label: "Jungle" },
    { role: "MIDDLE", label: "Middle" },
    { role: "BOTTOM", label: "Bottom" },
    { role: "UTILITY", label: "Support" },
];

const REGION_ITEMS: RegionItem[] = [
    { name: "North America", abbr: "NA", code: "na1" },
    { name: "Europe West", abbr: "EUW", code: "euw1" },
    { name: "Europe Nordic & East", abbr: "EUN", code: "eun1" },
    { name: "Korea", abbr: "KR", code: "kr" },
    { name: "Oceania", abbr: "OCE", code: "oc1" },
    { name: "Brazil", abbr: "BR", code: "br1" },
    { name: "Latin America North", abbr: "LAN", code: "la1" },
    { name: "Latin America South", abbr: "LAS", code: "la2" },
    { name: "Japan", abbr: "JP", code: "jp1" },
    { name: "Russia", abbr: "RU", code: "ru" },
    { name: "Türkiye", abbr: "TR", code: "tr1" },
    { name: "Southeast Asia", abbr: "SEA", code: "sg2" },
    { name: "Taiwan", abbr: "TW", code: "tw2" },
    { name: "Vietnam", abbr: "VN", code: "vn2" },
    { name: "Middle East", abbr: "ME", code: "me1" },
];

const Leaderboard: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<string>("fill");
    const [showRegion, setShowRegion] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<RegionItem>(REGION_ITEMS[0]);
    
    const dropdownToggleRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownToggleRef.current && 
                !dropdownToggleRef.current.contains(event.target as Node) && 
                dropdownListRef.current && 
                !dropdownListRef.current.contains(event.target as Node)
            ) {
                setShowRegion(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (region: RegionItem) => {
        setSelectedRegion(region);
        setShowRegion(false);
    };

    return (
        <div className="flex justify-center items-start mt-2 px-4">
            <div className="w-full max-w-6xl p-4 relative" style={{ backgroundColor: '#262626' }}>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex bg-neutral-700 rounded-xl gap-3 p-2 border border-purple-500">
                            <img 
                                key="fill" 
                                onClick={() => setSelectedRole("fill")}
                                src={fill} 
                                alt="fill"
                                className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === "fill" ? "bg-neutral-800" : ""}`} 
                            />
                            {roleLabels.map(({ role, label }) => (
                                <img
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    src={`https://dpm.lol/position/${role}.svg`}
                                    alt={label}
                                    title={label}
                                    className={`h-[35px] cursor-pointer transition-all duration-200 hover:scale-110 ${selectedRole === role ? 'bg-neutral-800' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="relative">
                            <div 
                                ref={dropdownToggleRef} 
                                onClick={() => setShowRegion((prev) => !prev)} 
                                className="flex justify-between items-center cursor-pointer bg-neutral-700 rounded-xl px-4 py-2 border border-purple-500 min-w-[200px]"
                            >
                                <span className="text-white">{selectedRegion.name}</span>
                                <img 
                                    src={arrowdown} 
                                    alt="arrow-down" 
                                    className={`h-5 transform transition-transform duration-150 ${showRegion ? "rotate-180" : ""}`} 
                                    style={{ filter: 'invert(1)' }}
                                />
                            </div>
                            <div 
                                ref={dropdownListRef} 
                                className={`absolute top-full right-0 mt-1 w-[750px] bg-neutral-700 shadow-md z-150 overflow-hidden transition-all duration-200 transform ${showRegion ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                            >
                                <ul className="grid grid-cols-3 text-white">
                                    {REGION_ITEMS.map((region) => (
                                        <li 
                                            key={region.code} 
                                            onClick={() => handleSelect(region)} 
                                            className="flex justify-between border-b-1 border-neutral-600 items-center px-3 py-2 hover:bg-neutral-600 cursor-pointer"
                                        >
                                            {region.name}
                                            <span className="text-xl font-bold">{region.abbr}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="text-white text-center">
                    <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
                    <p className="text-gray-400">Content coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

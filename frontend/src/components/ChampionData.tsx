import React from "react";
import { useGameData } from "../contexts/GameDataContext";

import noneicon from "../assets/none.jpg";

export const ChampionImage: React.FC<{championId: number; teamId?: number; isTeamIdSame: boolean; classes?: string;}> = ({championId, teamId, isTeamIdSame, classes}) => {
    const { champions } = useGameData();
    const borderClasses = isTeamIdSame ? "" : `border ${teamId === 200 ? "border-red-500" : "border-blue-500"}`;

    if (championId === -1) {
        return <img src={noneicon} alt="none" className={`${classes} ${borderClasses}`} />;
    }

    const championData = champions.get(championId);
    
    return (
        <img 
            src={championData ? `https://cdn.communitydragon.org/latest/champion/${championData.id}/square` : noneicon} 
            alt={championData ? championData.id : "noneicon"} 
            className={`${classes} ${borderClasses}`} 
        />
    );
};

export const ChampionSpellName: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {

    return (
        <p className={classes}>{spell.name}</p>
    );
};

export const ChampionSpellCooldowns: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {
    const cooldown = spell.cooldown;
    let text = "N/A";
    
    if (typeof cooldown === 'object' && cooldown?.modifiers?.[0]?.values) {
        const values = cooldown.modifiers[0].values;
        text = values.map((v: number) => v.toFixed(2).replace(/\.?0+$/, '')).join(" / ");
    } else if (typeof cooldown === 'string') {
        text = cooldown;
    }

    return (
        <p className={classes}>Cooldown: {text}s</p>
    );
};

export const ChampionSpellTooltip: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {
    const effects = spell.effects || [];
    
    if (effects.length === 0) {
        return <p className={classes}>{spell.description || spell.dynamicDescription || 'No description available'}</p>;
    }

    return (
        <>
            {effects.map((effect: any, index: number) => (
                <div key={index}>
                    <p className={classes} dangerouslySetInnerHTML={{ __html: effect.description || '' }} />
                    {index < effects.length - 1 && <br />}
                </div>
            ))}
        </>
    );
};
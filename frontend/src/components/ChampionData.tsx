import { DD_VERSION } from "../version";

import championJson from "../assets/json/champion.json";

import noneicon from "../assets/none.jpg";

export const ChampionImage: React.FC<{championId: number; teamId?: number; isTeamIdSame: boolean; classes?: string;}> = ({championId, teamId, isTeamIdSame, classes}) => {
    const championData = Object.values(championJson.data).find(c => c.key === String(championId));
    const borderClasses = isTeamIdSame ? "" : `border ${teamId === 200 ? "border-red-500" : "border-blue-500"}`;
    return (
        <img 
            src={championData ? `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${championData.id}.png` : noneicon} 
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

    return (
        <p className={classes}>Cooldown: {spell.cooldown.modifiers[0].values.join("/")}</p>
    );
};

export const ChampionSpellTooltip: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {

    return (
        <>
            {spell.effects.map((effect: any, index: number) => (
                <div key={index} >
                    <p className={classes}>{effect.description}</p>
                    {index < spell.effects.length - 1 && <br />}
                </div>
            ))}
        </>
    );
};

export const ChampionSpellNotes: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {

    return (
        <p className={classes}>{spell.notes}</p>
    );
};

import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from 'html-react-parser';
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
        <p className={classes}>Cooldown: {spell.cooldown.join('/')}</p>
    );
};

export const ChampionSpellTooltip: React.FC<{spell: any; classes?: string;}> = ({spell, classes}) => {

    const options: HTMLReactParserOptions = {
        replace(domNode) {
            if (domNode instanceof Element && domNode.tagName === 'lol-uikit-tooltipped-keyword') {
                return (
                    <span className="tooltip-keyword">{domToReact(domNode.children as DOMNode[], options)}</span>
                );
            }
        }
    };

    return (
        <p className={classes}>{parse(spell.tooltip, options)}</p>
    );
};

import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from "html-react-parser";
import { DD_VERSION } from "../version";

import summonerSpellsJson from "../assets/json/summonerSpells.json";

export const SummonerSpellImage: React.FC<{spellId: number; classes?: string;}> = ({spellId, classes}) => {
    const spellData = Object.values(summonerSpellsJson.data).find(
        (spell) => spell.key === spellId.toString()
    );
    if (!spellData) return <span>Summoner Spell Not Found</span>;

    return (
        <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spellData.id}.png`}
            alt={spellData.id}
            className={classes}
        />
    );
};

export const SummonerSpellTooltip: React.FC<{spellId: number; classes?: string;}> = ({spellId, classes}) => {
    const spellData = Object.values(summonerSpellsJson.data).find(
        (spell) => spell.key === spellId.toString()
    );
    if (!spellData) return <span>Summoner Spell Not Found</span>;

    const options: HTMLReactParserOptions = {
        replace(domNode) {
            if (domNode instanceof Element && domNode.tagName === "lol-uikit-tooltipped-keyword") {
                return (
                    <span className="tooltip-keyword">{domToReact(domNode.children as DOMNode[], options)}</span>
                );
            }
        }
    };

    return (
        <p className={classes}>{parse(spellData.description, options)}</p>
    );
};

export const SummonerSpellName: React.FC<{spellId: number; classes?: string;}> = ({spellId, classes}) => {
    const spellData = Object.values(summonerSpellsJson.data).find(
        (spell) => spell.key === spellId.toString()
    );
    if (!spellData) return <span>Summoner Spell Not Found</span>;

    return (
        <p className={classes}>{spellData.name}</p>
    );
};
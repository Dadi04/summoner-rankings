import React from "react";
import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from "html-react-parser";
import { useGameData } from "../contexts/GameDataContext";

export const SummonerSpellImage: React.FC<{spellId: number; classes?: string;}> = ({spellId, classes}) => {
    const { summonerSpells } = useGameData();
    const spellData = summonerSpells.get(spellId);

    if (!spellData) return <span>Summoner Spell Not Found</span>;

    return (
        <img 
            src={spellData.iconPath}
            alt={spellData.name}
            className={classes}
        />
    );
};

export const SummonerSpellTooltip: React.FC<{spellId: number; classes?: string;}> = ({spellId, classes}) => {
    const { summonerSpells } = useGameData();
    const spellData = summonerSpells.get(spellId);

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
    const { summonerSpells } = useGameData();
    const spellData = summonerSpells.get(spellId);

    if (!spellData) return <span>Summoner Spell Not Found</span>;

    return (
        <p className={classes}>{spellData.name}</p>
    );
};
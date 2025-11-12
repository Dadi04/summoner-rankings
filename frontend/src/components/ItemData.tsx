import React from "react";
import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from "html-react-parser";
import { useGameData } from "../contexts/GameDataContext";

export const ItemImage: React.FC<{itemId: number; matchWon?: boolean; classes: string}> = ({itemId, matchWon, classes}) => {
    const { items } = useGameData();

    if (itemId === 0) {
        return (
            <div className={`h-8 w-8 ${itemId ? (matchWon ? "bg-[#2F436E]" : "bg-[#703C47]") : "bg-neutral-800"} `}></div>
        );
    }

    const itemData = items.get(itemId);
    if (!itemData) {
        return <div className={classes}></div>;
    }

    return (
        <img src={itemData.iconPath} alt={itemData.name} className={classes} />
    );
}

export const ItemName: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    const { items } = useGameData();

    if (itemId === 0) {
        return <span>Empty slot</span>;
    }

    const itemData = items.get(itemId);
    if (!itemData) return <p className={classes}>Unknown item</p>;

    return (
        <p className={classes}>{itemData.name}</p>
    );
}

export const ItemDescription: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    const { items } = useGameData();

    if (itemId === 0) {
        return null;
    }

    const itemData = items.get(itemId);
    if (!itemData) return <p className={classes}>Unknown item</p>;

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
        <p className={classes}>{parse(itemData.description, options)}</p>
    );
}

export const ItemPrice: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    const { items } = useGameData();

    if (itemId === 0) {
        return <p></p>;
    }

    const itemData = items.get(itemId);
    if (!itemData) return <p className={classes}>Unknown item</p>;
  
    return (
        <p className={classes}>Cost: {itemData.priceTotal}g</p>
    );
}
import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from "html-react-parser";
import { DD_VERSION } from "../version";

import itemJson from "../assets/json/items.json";

function removeConsecutiveBrTags(html: string): string {
    return html
        .replace(/(<mainText>)?(?:\s*<br\s*\/?>\s*)+/gi, "$1") // fix da skida sve breakove ali da ostavi 1 tamo gde je bilo vise // myb change to meraki
        .replace(/(<br\s*\/?>\s*){2,}/gi, "<br /><br />")
        .replace(/(<br\s*\/?>\s*)+(?=<\/mainText>)/gi, "")
        .trim();
}

export const ItemImage: React.FC<{itemId: number; matchWon?: boolean; classes: string}> = ({itemId, matchWon, classes}) => {
    if (itemId === 0) {
        return (
            <div className={`h-8 w-8 ${itemId ? (matchWon ? "bg-[#2F436E]" : "bg-[#703C47]") : "bg-neutral-800"} `}></div>
        );
    }

    return (
        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`} alt={`${itemId}`} className={classes} />
    );
}

export const ItemName: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    if (itemId === 0) {
        return (
            <p>Empty slot</p>
        );
    }

    const key = itemId.toString();
    const itemData = itemJson.data[key as keyof typeof itemJson.data];
    if (!itemData) return <p className={classes}>Unknown item</p>;

    return (
        <p className={classes}>{itemData.name}</p>
    );
}

export const ItemPlaintext: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    if (itemId === 0) {
        return (
            <p></p>
        );
    }

    const key = itemId.toString();
    const itemData = itemJson.data[key as keyof typeof itemJson.data];
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
    
    const cleaned = removeConsecutiveBrTags(itemData.plaintext)

    return (
        <>
            <p className={classes}>{parse(cleaned, options)}</p>
            <br />
        </>
    );
}

export const ItemDescription: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    if (itemId === 0) {
        return (
            <p></p>
        );
    }

    const key = itemId.toString();
    const itemData = itemJson.data[key as keyof typeof itemJson.data];
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
 
    const cleaned = removeConsecutiveBrTags(itemData.description)

    return (
        <>
            <p className={classes}>{parse(cleaned, options)}</p>
            <br />
        </>
    );
}

export const ItemPrice: React.FC<{itemId: number; classes: string}> = ({itemId, classes}) => {
    if (itemId === 0) {
        return (
            <p></p>
        );
    }

    const key = itemId.toString();
    const itemData = itemJson.data[key as keyof typeof itemJson.data];
    if (!itemData) return <p className={classes}>Unknown item</p>;
 
    return (
        <p className={classes}>Cost: {itemData.gold.total}g ({itemData.gold.sell}g)</p>
    );
}
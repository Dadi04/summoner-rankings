import parse, {domToReact, HTMLReactParserOptions, Element, DOMNode} from "html-react-parser";
import IconImage from "./IconImage";

import runesJson from "../assets/json/runes.json";

export const RuneImage: React.FC<{runeTypeId: number; runeId?: number; classes: string;}> = ({runeTypeId, runeId, classes}) => {
    const runeTypeData = runesJson.find((runeType) => runeType.id === runeTypeId);
    if (!runeTypeData) return <span>Rune Type Not Found</span>;

    if (!runeId) return (
        <IconImage icon={runeTypeData.icon} alt={runeTypeData.key} className={classes} />
    );

    const runes = runeTypeData.slots.flatMap((slot) => slot.runes);
    const runeData = runes.find((rune) => rune.id === runeId);
    if (!runeData) return <span>Rune Not Found</span>;
    return (
        <IconImage icon={runeData.icon} alt={runeData.key} className={classes} />
    );
};

export const RuneName: React.FC<{runeTypeId: number; runeId?: number; classes: string;}> = ({runeTypeId, runeId, classes}) => {
    const runeTypeData = runesJson.find((runeType) => runeType.id === runeTypeId);
    if (!runeTypeData) return <span>Rune Type Not Found</span>;

    if (!runeId) return (
        <p className={classes}>{runeTypeData.name}</p>
    );

    const runes = runeTypeData.slots.flatMap((slot) => slot.runes);
    const runeData = runes.find((rune) => rune.id === runeId);
    if (!runeData) return <span>Rune Not Found</span>;
    return (
        <p className={classes}>{runeData.name}</p>
    );
};

export const RuneTooltip: React.FC<{runeTypeId: number; runeId?: number; classes: string;}> = ({runeTypeId, runeId, classes}) => {
    const runeTypeData = runesJson.find((runeType) => runeType.id === runeTypeId);
    if (!runeTypeData) return <span>Rune Type Not Found</span>;

    const runes = runeTypeData.slots.flatMap((slot) => slot.runes);
    const runeData = runes.find((rune) => rune.id === runeId);
    if (!runeData) return <span>Rune Not Found</span>;

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
        <div className={classes}>{parse(runeData.longDesc, options)}</div>
    );
};

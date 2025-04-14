import IconImage from "./IconImage";

import runesJson from "../assets/json/runes.json";

const RuneImage: React.FC<{runeTypeId: number; runeId?: number; classes: string;}> = ({runeTypeId, runeId, classes}) => {
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

export default RuneImage;
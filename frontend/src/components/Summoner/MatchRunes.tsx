import IconImage from "../IconImage";
import RuneSlot from "../RuneSlot";
import ShardSlot from "../ShardSlot";

import MatchPerks from "../../interfaces/MatchPerks";

import runesJson from "../../assets/json/runes.json";
import statModsJson from "../../assets/json/statMods.json";


const MatchRunes: React.FC<MatchPerks> = ({ statPerks, styles }) => {
    const primaryStyle = styles[0];
    const primaryTypeData = runesJson.find((r) => r.id === primaryStyle.style);
    if (!primaryTypeData) return <span>Primary Rune Type Not Found</span>;
    const [slotP0, slotP1, slotP2, slotP3] = primaryTypeData.slots;
    const primaryPerkIds = primaryStyle.selections.map((s) => s.perk);
  
    const secondaryStyle = styles[1];
    const secondaryTypeData = runesJson.find((r) => r.id === secondaryStyle.style);
    if (!secondaryTypeData) return <span>Secondary Rune Type Not Found</span>;
    const [, slotS1, slotS2, slotS3] = secondaryTypeData.slots;
    const secondaryPerkIds = secondaryStyle.selections.map((s) => s.perk);
  
    const [statMods0, statMods1, statMods2] = statModsJson.slots;
    const selectedShard0 = statPerks.offense;
    const selectedShard1 = statPerks.flex;
    const selectedShard2 = statPerks.defense;
  
    return (
        <div className="flex justify-evenly my-6">
            <div className="w-[30%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-700 p-2 rounded">
                    <IconImage icon={primaryTypeData.icon} alt={primaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{primaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-6 items-center mt-4">
                    <RuneSlot runes={slotP0.runes} perkIds={primaryPerkIds} runeTypeId={primaryTypeData.id} height="h-17" />
                    <hr className="w-full text-neutral-300" />
                    <RuneSlot runes={slotP1.runes} perkIds={primaryPerkIds} runeTypeId={primaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotP2.runes} perkIds={primaryPerkIds} runeTypeId={primaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotP3.runes} perkIds={primaryPerkIds} runeTypeId={primaryTypeData.id} height="h-12" />
                </div>
            </div>
            <div className="w-[30%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-700 p-2 rounded">
                    <IconImage icon={secondaryTypeData.icon} alt={secondaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{secondaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-3 items-center mt-4 mb-4">
                    <RuneSlot runes={slotS1.runes} perkIds={secondaryPerkIds} runeTypeId={secondaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotS2.runes} perkIds={secondaryPerkIds} runeTypeId={secondaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotS3.runes} perkIds={secondaryPerkIds} runeTypeId={secondaryTypeData.id} height="h-12" />
                </div>
                <hr className="text-neutral-300" />
                <div className="flex flex-col items-center mt-3 gap-2">
                    <ShardSlot slot={statMods0} selectedId={selectedShard0} />
                    <ShardSlot slot={statMods1} selectedId={selectedShard1} />
                    <ShardSlot slot={statMods2} selectedId={selectedShard2} />
                </div>
            </div>
        </div>
    );
};

export default MatchRunes;
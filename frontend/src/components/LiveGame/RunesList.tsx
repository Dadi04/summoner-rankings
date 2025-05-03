
import IconImage from "../IconImage";
import RuneSlot from "../RuneSlot";
import ShardSlot from "../ShardSlot";

import Perk from "../../interfaces/Perk";

import runesJson from "../../assets/json/runes.json";
import statModsJson from "../../assets/json/statMods.json";

const RunesList: React.FC<{runes: Perk}> = ({runes}) => {
    const runePrimaryTypeData = runesJson.find((runeType) => runeType.id === runes.perkStyle);
    if (!runePrimaryTypeData) return <span>Primary Rune Type Does Not Exist</span>
    const [slotPrimary0, slotPrimary1, slotPrimary2, slotPrimary3] = runePrimaryTypeData.slots;

    const runeSecondaryTypeData = runesJson.find((runeType) => runeType.id === runes.perkSubStyle);
    if (!runeSecondaryTypeData) return <span>Secondary Rune Type Does Not Exist</span>
    const [, slotSecondary1, slotSecondary2, slotSecondary3] = runeSecondaryTypeData.slots;

    const [statMods0, statMods1, statMods2] = statModsJson.slots;

    const selectedShard0 = statMods0.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;
    const selectedShard1 = statMods1.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;
    const selectedShard2 = statMods2.shards.find((shard) => runes.perkIds.includes(shard.id))?.id;

    return (
        <div className="flex justify-evenly">
            <div className="w-[25%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-800 p-2 rounded">
                    <IconImage icon={runePrimaryTypeData.icon} alt={runePrimaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{runePrimaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-5 items-center mt-4">
                    <RuneSlot runes={slotPrimary0.runes} perkIds={runes.perkIds} runeTypeId={runePrimaryTypeData.id} height="h-17" />
                    <hr className="w-full text-neutral-300" />
                    <RuneSlot runes={slotPrimary1.runes} perkIds={runes.perkIds} runeTypeId={runePrimaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotPrimary2.runes} perkIds={runes.perkIds} runeTypeId={runePrimaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotPrimary3.runes} perkIds={runes.perkIds} runeTypeId={runePrimaryTypeData.id} height="h-12" />
                </div>
            </div>

            <div className="w-[25%]">
                <div className="flex items-center justify-center gap-4 bg-neutral-800 p-2 rounded">
                    <IconImage icon={runeSecondaryTypeData.icon} alt={runeSecondaryTypeData.key} className="h-10" />
                    <p className="font-bold text-lg text-neutral-100">{runeSecondaryTypeData.name}</p>
                </div>
                <div className="flex flex-col gap-2 items-center mt-4 mb-4">
                    <RuneSlot runes={slotSecondary1.runes} perkIds={runes.perkIds} runeTypeId={runeSecondaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotSecondary2.runes} perkIds={runes.perkIds} runeTypeId={runeSecondaryTypeData.id} height="h-12" />
                    <RuneSlot runes={slotSecondary3.runes} perkIds={runes.perkIds} runeTypeId={runeSecondaryTypeData.id} height="h-12" />
                </div>
                <hr className="text-neutral-300" />
                <div className="flex flex-col items-center mt-3 gap-1">
                    <ShardSlot slot={statMods0} selectedId={selectedShard0} />
                    <ShardSlot slot={statMods1} selectedId={selectedShard1} />
                    <ShardSlot slot={statMods2} selectedId={selectedShard2} />
                </div>
            </div>
        </div>
    );
};

export default RunesList;
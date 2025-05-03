import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import IconImage from "./IconImage";
import {RuneName, RuneTooltip} from "./RuneData";

const RuneSlot: React.FC<{runes: { id: number; icon: string; name: string }[]; perkIds: number[]; runeTypeId: number; height: string;}> = ({runes, perkIds, runeTypeId, height}) => {
    console.log(runes, perkIds)
    return(
        <div className="w-[80%] flex justify-evenly">
            {runes.map((rune) => (
                <Tippy
                    content={
                        <div>
                            <RuneName runeTypeId={runeTypeId} runeId={rune.id} classes="text-md font-bold text-purple-500" />
                            <RuneTooltip runeTypeId={runeTypeId} runeId={rune.id} classes="text-sm" />
                        </div>
                    }
                    allowHTML={true}
                    interactive={false}
                    placement="top"
                >
                    <div>
                        <IconImage
                            key={rune.id}
                            icon={rune.icon}
                            alt={rune.name}
                            className={`${height} ${perkIds.includes(rune.id) ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
                        />
                    </div>
                </Tippy>
            ))}
        </div>
    )
}

export default RuneSlot;
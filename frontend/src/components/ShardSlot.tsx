import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import IconImage from "./IconImage";

import LiveGameShard from "../interfaces/LiveGameShard"; 

const ShardSlot: React.FC<{slot: {shards: LiveGameShard[]}; selectedId?: number }> = ({slot, selectedId}) => (
    <div className="w-[60%] flex justify-evenly">
        {slot.shards.map((shard, index) => (
            <Tippy
                key={shard.id}
                content={
                    <div>
                        <p className="text-md font-bold text-purple-500">{shard.name}</p>
                        <p className="text-sm">{shard.shortDesc}</p>
                    </div>
                }
                allowHTML={true}
                interactive={false}
                placement="top"
            >
                <div>
                    <IconImage
                        icon={shard.icon}
                        alt={shard.name}
                        className={`h-9 ${selectedId === shard.id ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
                    />
                </div>
            </Tippy>
        ))}
    </div>
)

export default ShardSlot;
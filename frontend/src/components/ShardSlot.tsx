import IconImage from "./IconImage";

import LiveGameShard from "../interfaces/LiveGameShard"; 

const ShardSlot: React.FC<{slot: {shards: LiveGameShard[]}; selectedId?: number }> = ({slot, selectedId}) => (
    <div className="w-[60%] flex justify-evenly">
        {slot.shards.map((shard, index) => (
            <IconImage
                key={index}
                icon={shard.icon}
                alt={shard.name}
                className={`h-9 ${selectedId === shard.id ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
            />
        ))}
    </div>
)

export default ShardSlot;
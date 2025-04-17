import IconImage from "./IconImage";

const RuneSlot: React.FC<{runes: { id: number; icon: string; name: string }[]; perkIds: number[]; height: string;}> = ({runes, perkIds, height}) => (
    <div className="w-[80%] flex justify-evenly">
        {runes.map((rune) => (
            <IconImage
                key={rune.id}
                icon={rune.icon}
                alt={rune.name}
                className={`${height} ${perkIds.includes(rune.id) ? "border-2 rounded-full border-purple-700" : "filter grayscale brightness-50"}`}
            />
        ))}
    </div>
)

export default RuneSlot;
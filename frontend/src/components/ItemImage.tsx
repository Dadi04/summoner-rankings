import { DD_VERSION } from "../version";

const ItemImage: React.FC<{itemId: number; matchWon?: boolean; classes: string}> = ({itemId, matchWon, classes}) => {
    if (itemId === 0) {
        return (
            <div className={`h-8 w-8 ${matchWon ? "bg-[#2F436E]" : "bg-[#703C47]"} `}></div>
        );
    }

    return (
        <img src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`} alt={`${itemId}`} className={classes} />
    );
}

export default ItemImage;
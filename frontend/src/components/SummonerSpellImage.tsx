import { DD_VERSION } from '../version';

import summonerSpellsJson from "../assets/json/summonerSpells.json";

const SummonerSpellImage: React.FC<{spellId: number; classes: string;}> = ({spellId, classes}) => {
    const spellData = Object.values(summonerSpellsJson.data).find(
        (spell) => spell.key === spellId.toString()
    );
    return (
        <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spellData?.id}.png`}
            alt={spellData?.id}
            className={classes}
        />
    );
};

export default SummonerSpellImage
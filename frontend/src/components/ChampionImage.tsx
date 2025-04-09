import championJson from "../assets/json/champion.json";
import noneicon from "../assets/none.jpg";

const getChampionData = (championId: number) =>
    Object.values(championJson.data).find(
        (champion) => champion.key === championId.toString()
    );

const ChampionImage: React.FC<{championId: number; teamId?: number; isTeamIdSame: boolean; classes?: string;}> = ({championId, teamId, isTeamIdSame, classes}) => {
    const championData = getChampionData(championId);
    const borderClasses = isTeamIdSame ? "" : `border ${teamId === 200 ? "border-red-500" : "border-blue-500"}`;
    return (
        <img 
            src={championData ? `https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${championData.id}.png` : noneicon} 
            alt={championData ? championData.id : "noneicon"} 
            className={`${classes} ${borderClasses}`} 
        />
    );
};

export default ChampionImage
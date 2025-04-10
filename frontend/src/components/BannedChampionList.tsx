import ChampionImage from "./ChampionImage";
import forbiddenlight from "../assets/forbidden-light.png"

interface BannedChampion {
    championId: number; 
    teamId: number;
    pickTurn: number;
}

const BannedChampionsList: React.FC<{bannedChampions: BannedChampion[]; isTeamIdSame: boolean; teamFilter?: number;}> = ({bannedChampions, isTeamIdSame, teamFilter}) => (
    <div className="flex gap-1.5">
        {bannedChampions.filter((bc) => (teamFilter ? bc.teamId === teamFilter : true)).map((bc) => (
            <div key={bc.championId} className="relative pb-2">
                <ChampionImage championId={bc.championId} teamId={bc.teamId} isTeamIdSame={isTeamIdSame} classes="h-13" />
                <img src={forbiddenlight} alt="forbidden" className="absolute h-5 bottom-0 left-1/2 transform -translate-x-1/2" />
            </div>
        ))}
    </div>
);

export default BannedChampionsList;
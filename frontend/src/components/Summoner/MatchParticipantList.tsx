import MatchInfo from "../../interfaces/MatchDetailsInfo";

import ChampionImage from "../ChampionImage";

const MatchParticipantList: React.FC<{info: MatchInfo; choosePlayerDetails: string; setChoosePlayerDetails: React.Dispatch<React.SetStateAction<string>>; }> = ({info, choosePlayerDetails, setChoosePlayerDetails }) => {

    return (
        <div className="flex items-center justify-between">
            <div className="flex gap-3">
                {info.participants.filter(participant => participant.teamId === 100).map(participant => (
                    <div key={participant.championId} onClick={() => setChoosePlayerDetails(participant.championName)} className={`relative p-2 transition hover:bg-neutral-700 ${choosePlayerDetails === participant.championName ? "bg-neutral-700" : ""}`}>
                        <ChampionImage championId={participant.championId} teamId={100} isTeamIdSame={false} classes="h-13" />
                        <img src={`https://dpm.lol/position/${participant.teamPosition}.svg`} alt={participant.teamPosition} className="absolute bottom-0 right-0 h-6 bg-black transform -translate-x-1/3 -translate-y-1/3" />
                    </div>
                ))}
            </div>
            <div>
                <p className="text-neutral-400 text-2xl font-bold gap-1">VS</p>
            </div>
            <div className="flex gap-3">
                {info.participants.filter(participant => participant.teamId === 200).map(participant => (
                    <div key={participant.championId} onClick={() => setChoosePlayerDetails(participant.championName)} className={`relative p-2 transition hover:bg-neutral-700 ${choosePlayerDetails === participant.championName ? "bg-neutral-700" : ""}`}>
                        <ChampionImage championId={participant.championId} teamId={200} isTeamIdSame={false} classes="h-13" />
                        <img src={`https://dpm.lol/position/${participant.teamPosition}.svg`} alt={participant.teamPosition} className="absolute bottom-0 right-0 h-6 bg-black transform -translate-x-1/3 -translate-y-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MatchParticipantList
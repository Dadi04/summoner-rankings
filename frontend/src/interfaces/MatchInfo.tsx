import MatchParticipant from "./MatchParticipant";

interface MatchInfo {
    endOfGameResult: string;
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: MatchParticipant[];
    platformId: string;
    queueId: number;
    teams: {
        bans: {
            championId: number;
            pickTurn: number;
        }[];
        objectives: {
            baron: Objective;
            champion: Objective;
            dragon: Objective;
            horde: Objective;
            inhibitor: Objective;
            riftHerald: Objective;
            tower: Objective;
        };
        teamId: number;
        win: boolean;
    }[];
    tournamentCode: string;
};

interface Objective {
    first: boolean;
    kills: number;
}

export default MatchInfo;
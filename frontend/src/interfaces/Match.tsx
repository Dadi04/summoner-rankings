import MatchInfo from "./MatchInfo";

interface Match {
    metadata: MatchMetadata;
    info: MatchInfo;
}

interface MatchMetadata {
    dataVersion: string;
    matchId: string;
    participants: string[];
};

export default Match;
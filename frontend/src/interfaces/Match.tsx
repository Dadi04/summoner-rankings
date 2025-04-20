import MatchDetailsInfo from "./MatchInfo";

interface Match {
    details: MatchDetails;
    timelineJson: string;
}

interface MatchDetails {
    metadata: MatchDetailsMetadata;
    info: MatchDetailsInfo;
}

interface MatchDetailsMetadata {
    dataVersion: string;
    matchId: string;
    participants: string[];
};
  
export default Match;
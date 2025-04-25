import MatchDetailsInfo from "./MatchDetailsInfo";

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
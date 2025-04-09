
interface Mastery {
    puuid: string;
    championPointsUntilNextLevel: number;
    chestGranted: boolean;
    championId: number;
    lastPlayTime: number;
    championLevel: number;
    championPoints: number;
    championPointsSinceLastLevel: number;
    markRequiredForNextLevel: number;
    championSeasonMilestone: number;
    nextSeasonMilestone: {
        requireGradeCounts: object;
        rewardMarks: number;
        bonus: boolean;
        rewardConfig: {
            rewardValue: string;
            rewardType: string;
            maximumReward: number;
        };
    };
    tokensEarned: number;
    milestoneGrades: string[];
}

export default Mastery;
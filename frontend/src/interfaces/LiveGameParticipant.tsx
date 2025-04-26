import Perk from "./Perk";

interface LiveGameParticipant {
    puuid: string;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    riotId: string;
    bot: boolean;
    summonerId: string;
    gameCustomizationObjects: any[];
    perks: Perk;
    predictedRole: string;
}

export default LiveGameParticipant;
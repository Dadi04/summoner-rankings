interface MatchPerks {
    statPerks: {
        defense: number;
        flex: number;
        offense: number;
    };
    styles: {
        description: string;
        selections: {
            perk: number;
            var1: number;
            var2: number;
            var3: number;
        }[];
        style: number;
    }[];
};

export default MatchPerks;
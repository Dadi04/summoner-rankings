namespace backend.Mappings {
    public static class RegionMappingProvider {
        public static IReadOnlyDictionary<string, string> RegionMapping { get; } = new Dictionary<string, string> {
            {"na1", "americas"},
            {"euw1", "europe"},
            {"eun1", "europe"},
            {"kr", "asia"},
            {"oc1", "sea"},
            {"br1", "americas"},
            {"la1", "americas"},
            {"la2", "americas"},
            {"jp1", "asia"},
            {"ru", "europe"},
            {"tr1", "europe"},
            {"sg2", "sea"},
            {"tw2", "sea"},
            {"vn2", "sea"},
            {"me1", "europe"},
        };
    }
}
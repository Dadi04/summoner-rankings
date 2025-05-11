using System.Text.Json;

using backend.Mappings;

namespace backend.Utils {
    public static class ChampionRoleMapping {
        public static async Task<Dictionary<int, string>> BuildChampionRoleMappingAsync(HttpClient client) {
            string championDataUrl = "https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json";
            string championJson = await client.GetStringAsync(championDataUrl);
            using JsonDocument doc = JsonDocument.Parse(championJson);
            var root = doc.RootElement;
            var championData = root.GetProperty("data");

            var tagRoleMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
                { "Marksman", "BOTTOM" },
                { "Support", "UTILITY" },
                { "Mage", "MIDDLE" },
                { "Assassin", "MIDDLE" },
                { "Fighter", "TOP" },
                { "Tank", "TOP" }
            };
            
            var championRoleMapping = new Dictionary<int, string>();

            foreach (var champProperty in championData.EnumerateObject()) {
                var champ = champProperty.Value;
                string champName = champ.GetProperty("id").GetString() ?? "";
                string keyString = champ.GetProperty("key").GetString() ?? "";

                if (!int.TryParse(keyString, out int champId)) {
                    continue;
                }

                if (ManualMappingProvider.ManualMapping.TryGetValue(champName, out string? role)) {
                    championRoleMapping[champId] = role;
                } else if (AmbiguousMappingProvider.AmbiguousMapping.TryGetValue(champName, out string[]? possibleRoles)) {
                    var championTags = champ.GetProperty("tags").EnumerateArray().Select(t => t.GetString()).Where(s => !string.IsNullOrEmpty(s)).Select(s => s!).ToList();
                    var potentialRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    
                    foreach (var tag in championTags) {
                        if (tagRoleMapping.TryGetValue(tag, out var tagBasedRole)) {
                            potentialRoles.Add(tagBasedRole);
                        }
                    }

                    var selectedRole = possibleRoles.FirstOrDefault(r => potentialRoles.Contains(r)) ?? possibleRoles.First();
                    championRoleMapping[champId] = selectedRole;
                } else {
                    var tags = champ.GetProperty("tags").EnumerateArray().Select(t => t.GetString()).ToList();
                    if (tags.Contains("Marksman")) championRoleMapping[champId] = "BOTTOM";
                    else if (tags.Contains("Support")) championRoleMapping[champId] = "SUPPORT";
                    else if (tags.Contains("Mage") || tags.Contains("Assassin")) championRoleMapping[champId] = "MIDDLE";
                    else if (tags.Contains("Fighter") || tags.Contains("Tank")) championRoleMapping[champId] = "TOP";
                    else championRoleMapping[champId] = "MIDDLE";
                }
            }

            return championRoleMapping;
        }
    }
}


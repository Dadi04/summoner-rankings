using System.Text.Json;

using backend.Mappings;

namespace backend.Utils {
    public static class ChampionRoleMapping {
        private static Dictionary<int, string>? _cachedMapping = null;
        private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public static async Task<Dictionary<int, string>> BuildChampionRoleMappingAsync(HttpClient client) {
            await _semaphore.WaitAsync();
            try {
                if (_cachedMapping != null) {
                    return _cachedMapping;
                }

                var roleMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
                    { "marksman", "BOTTOM" },
                    { "support", "UTILITY" },
                    { "mage", "MIDDLE" },
                    { "assassin", "MIDDLE" },
                    { "fighter", "TOP" },
                    { "tank", "TOP" }
                };
                
                var championRoleMapping = new Dictionary<int, string>();
                
                var url = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
                var response = await client.GetStringAsync(url);
                var champions = JsonSerializer.Deserialize<List<ChampionSummary>>(response, new JsonSerializerOptions {
                    PropertyNameCaseInsensitive = true
                });

                if (champions != null) {
                    foreach (var champ in champions) {
                        if (champ.Id <= 0 || string.IsNullOrEmpty(champ.Alias)) continue;

                        if (ManualMappingProvider.ManualMapping.TryGetValue(champ.Alias, out string? role)) {
                            championRoleMapping[champ.Id] = role;
                        }
                        else if (AmbiguousMappingProvider.AmbiguousMapping.TryGetValue(champ.Alias, out string[]? possibleRoles)) {
                            var potentialRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                            
                            foreach (var championRole in champ.Roles) {
                                if (roleMapping.TryGetValue(championRole, out var mappedRole)) {
                                    potentialRoles.Add(mappedRole);
                                }
                            }

                            var selectedRole = possibleRoles.FirstOrDefault(r => potentialRoles.Contains(r)) ?? possibleRoles.First();
                            championRoleMapping[champ.Id] = selectedRole;
                        }
                        else {
                            var roles = champ.Roles;
                            if (roles.Contains("marksman")) championRoleMapping[champ.Id] = "BOTTOM";
                            else if (roles.Contains("support")) championRoleMapping[champ.Id] = "UTILITY";
                            else if (roles.Contains("mage") || roles.Contains("assassin")) championRoleMapping[champ.Id] = "MIDDLE";
                            else if (roles.Contains("fighter") || roles.Contains("tank")) championRoleMapping[champ.Id] = "TOP";
                            else championRoleMapping[champ.Id] = "MIDDLE";
                        }
                    }
                }

                _cachedMapping = championRoleMapping;
                return championRoleMapping;
            }
            catch (Exception ex) {
                Console.WriteLine($"Error fetching champion role mapping: {ex.Message}");
                return _cachedMapping ?? new Dictionary<int, string>();
            }
            finally {
                _semaphore.Release();
            }
        }

        private class ChampionSummary {
            public int Id { get; set; }
            public string Alias { get; set; } = string.Empty;
            public List<string> Roles { get; set; } = new List<string>();
        }
    }
}


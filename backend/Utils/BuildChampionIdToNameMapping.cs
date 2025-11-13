using System.Text.Json;

namespace backend.Utils {
    public static class ChampionIdToNameMapping {
        private static Dictionary<int, string>? _cachedMapping = null;
        private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public static async Task<Dictionary<int, string>> BuildChampionIdToNameMappingAsync(HttpClient client) {
            await _semaphore.WaitAsync();
            try {
                if (_cachedMapping != null) {
                    return _cachedMapping;
                }

                var championIdToName = new Dictionary<int, string>();
                
                var url = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
                var response = await client.GetStringAsync(url);
                var champions = JsonSerializer.Deserialize<List<ChampionSummary>>(response, new JsonSerializerOptions {
                    PropertyNameCaseInsensitive = true
                });

                if (champions != null) {
                    foreach (var champ in champions) {
                        if (champ.Id > 0 && !string.IsNullOrEmpty(champ.Alias)) {
                            championIdToName[champ.Id] = champ.Alias;
                        }
                    }
                }

                _cachedMapping = championIdToName;
                return championIdToName;
            }
            catch (Exception ex) {
                Console.WriteLine($"Error fetching champion ID to name mapping: {ex.Message}");
                return _cachedMapping ?? new Dictionary<int, string>();
            }
            finally {
                _semaphore.Release();
            }
        }

        private class ChampionSummary {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Alias { get; set; } = string.Empty;
        }
    }
}


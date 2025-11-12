interface ChampionAbility {
    name: string;
    icon: string;
    description?: string;
    dynamicDescription?: string;
    cooldown?: string | {
        modifiers?: Array<{
            values: number[];
        }>;
    };
    cost?: string;
    effects?: Array<{
        description: string;
    }>;
    notes?: string;
}

interface ChampionData {
    id: number;
    name: string;
    key: string;
    abilities: {
        P?: ChampionAbility[];
        Q?: ChampionAbility[];
        W?: ChampionAbility[];
        E?: ChampionAbility[];
        R?: ChampionAbility[];
    };
}

const championCache = new Map<number, ChampionData>();

let championSummaryCache: Map<number, { id: string; key: string; name: string }> | null = null;

let summonerSpellsCache: Map<number, { id: number; name: string; description: string; iconPath: string }> | null = null;

let itemsCache: Map<number, { id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number }> | null = null;

// https://www.communitydragon.org/documentation/assets
function transformAssetPath(path: string): string {
    if (!path) return '';
    
    const cleanPath = path.replace(/^\/?lol-game-data\/assets\//, '').toLowerCase();
    
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${cleanPath}`;
}

function transformChampionData(apiData: any): ChampionData {
    const abilities: ChampionData['abilities'] = {};

    if (apiData.passive) {
        abilities.P = [{
            name: apiData.passive.name,
            icon: transformAssetPath(apiData.passive.abilityIconPath),
            description: apiData.passive.description,
            effects: [{
                description: apiData.passive.description
            }],
            notes: apiData.passive.description,
        }];
    }

    if (apiData.spells && Array.isArray(apiData.spells)) {
        apiData.spells.forEach((spell: any) => {
            const key = spell.spellKey.toUpperCase();
        
            const cooldownValues = spell.cooldownCoefficients || [];
            const cooldown = cooldownValues.length > 0 ? {
                modifiers: [{
                    values: cooldownValues.filter((v: number) => v > 0)
                }]
            } : undefined;
        
            const effects = [];
            if (spell.description) {
                effects.push({ description: spell.description });
            }
            if (spell.dynamicDescription) {
                effects.push({ description: spell.dynamicDescription });
            }
        
            abilities[key as 'Q' | 'W' | 'E' | 'R'] = [{
                name: spell.name,
                icon: transformAssetPath(spell.abilityIconPath),
                description: spell.description,
                dynamicDescription: spell.dynamicDescription,
                cooldown: cooldown,
                cost: spell.cost,
                effects: effects.length > 0 ? effects : [{ description: spell.description || 'No description available' }],
                notes: spell.dynamicDescription || spell.description || '',
            }];
        });
    }

    return {
        id: apiData.id,
        name: apiData.name,
        key: apiData.alias || apiData.name,
        abilities,
    };
}

export async function fetchChampionData(championId: number): Promise<ChampionData | null> {
    if (championCache.has(championId)) {
        return championCache.get(championId)!;
    }

    try {
        const response = await fetch(`https://cdn.communitydragon.org/latest/champion/${championId}/data`);
        if (!response.ok) {
            console.error(`Failed to fetch champion data for ID ${championId}`);
            return null;
        }

        const apiData = await response.json();
        const transformedData = transformChampionData(apiData);
        
        championCache.set(championId, transformedData);
        
        return transformedData;
    } catch (error) {
        console.error(`Error fetching champion data for ID ${championId}:`, error);
        return null;
    }
}

export async function fetchMultipleChampions(championIds: number[]): Promise<Map<number, ChampionData>> {
    const results = new Map<number, ChampionData>();
    
    await Promise.all(
        championIds.map(async (id) => {
            const data = await fetchChampionData(id);
                if (data) {
                    results.set(id, data);
                }
            }
        )
    );
  
    return results;
}

export function clearChampionCache(): void {
    championCache.clear();
    championSummaryCache = null;
    summonerSpellsCache = null;
    itemsCache = null;
}

export async function fetchChampionSummary(): Promise<Map<number, { id: string; key: string; name: string }>> {
    if (championSummaryCache) {
        return championSummaryCache;
    }

    try {
        const response = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json');
        if (!response.ok) {
            console.error('Failed to fetch champion summary');
            return new Map();
        }

        const data = await response.json();
        const summaryMap = new Map<number, { id: string; key: string; name: string }>();
        
        data.forEach((champ: any) => {
            summaryMap.set(champ.id, {
                id: champ.alias || champ.name,
                key: champ.alias || champ.name,
                name: champ.name
            });
        });
        
        championSummaryCache = summaryMap;
        return summaryMap;
    } catch (error) {
        console.error('Error fetching champion summary:', error);
        return new Map();
    }
}

export async function getChampionInfo(championId: number): Promise<{ id: string; key: string; name: string } | null> {
    const summary = await fetchChampionSummary();
    return summary.get(championId) || null;
}

export async function fetchSummonerSpells(): Promise<Map<number, { id: number; name: string; description: string; iconPath: string }>> {
    if (summonerSpellsCache) {
        return summonerSpellsCache;
    }

    try {
        const response = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-spells.json');
        if (!response.ok) {
            console.error('Failed to fetch summoner spells');
            return new Map();
        }

        const data = await response.json();
        const spellsMap = new Map<number, { id: number; name: string; description: string; iconPath: string }>();
        
        data.forEach((spell: any) => {
            spellsMap.set(spell.id, {
                id: spell.id,
                name: spell.name,
                description: spell.description,
                iconPath: transformAssetPath(spell.iconPath)
            });
        });
        
        summonerSpellsCache = spellsMap;
        return spellsMap;
    } catch (error) {
        console.error('Error fetching summoner spells:', error);
        return new Map();
    }
}

export async function getSummonerSpell(spellId: number): Promise<{ id: number; name: string; description: string; iconPath: string } | null> {
    const spells = await fetchSummonerSpells();
    return spells.get(spellId) || null;
}

export async function fetchItems(): Promise<Map<number, { id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number }>> {
    if (itemsCache) {
        return itemsCache;
    }

    try {
        const response = await fetch('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json');
        if (!response.ok) {
            console.error('Failed to fetch items');
            return new Map();
        }

        const data = await response.json();
        const itemsMap = new Map<number, { id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number }>();
        
        data.forEach((item: any) => {
            itemsMap.set(item.id, {
                id: item.id,
                name: item.name,
                description: item.description,
                iconPath: transformAssetPath(item.iconPath),
                price: item.price,
                priceTotal: item.priceTotal
            });
        });
        
        itemsCache = itemsMap;
        return itemsMap;
    } catch (error) {
        console.error('Error fetching items:', error);
        return new Map();
    }
}

export async function getItem(itemId: number): Promise<{ id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number } | null> {
    const items = await fetchItems();
    return items.get(itemId) || null;
}


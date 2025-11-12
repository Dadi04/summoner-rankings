import { playerCache } from "./playerCache";

export const cacheManager = {
    async clearAllCache(): Promise<void> {
        try {
            await playerCache.clear();
            console.log("All cache cleared successfully");
        } catch (error) {
            console.error("Error clearing cache:", error);
        }
    },

    async removeSummoner(regionCode: string, summoner: string): Promise<void> {
        const cacheKey = `summoner_${regionCode}_${summoner}`;
        try {
            await playerCache.removeItem(cacheKey);
            console.log(`Removed ${cacheKey} from cache`);
        } catch (error) {
            console.error(`Error removing ${cacheKey} from cache:`, error);
        }
    },

    async getCachedSummoners(): Promise<string[]> {
        try {
            const keys = await playerCache.getAllKeys();
            return keys;
        } catch (error) {
            console.error("Error getting cached summoners:", error);
            return [];
        }
    },

    async getStorageEstimate(): Promise<{ used: number; quota: number; percentage: number } | null> {
        if (!navigator.storage || !navigator.storage.estimate) {
            console.warn("Storage API not supported");
            return null;
        }

        try {
            const estimate = await navigator.storage.estimate();
            const used = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;

            return {
                used: Math.round(used / (1024 * 1024)), // Convert to MB
                quota: Math.round(quota / (1024 * 1024)), // Convert to MB
                percentage
            };
        } catch (error) {
            console.error("Error getting storage estimate:", error);
            return null;
        }
    }
};

if (typeof window !== "undefined") {
    (window as any).cacheManager = cacheManager;
}


import Player from "../interfaces/Player";

const DB_NAME = "SummonerRankingsDB";
const STORE_NAME = "playerCache";
const DB_VERSION = 1;

class PlayerCacheDB {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) {
            return this.dbPromise;
        }

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error("IndexedDB error:", request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
                }
            };
        });

        return this.dbPromise;
    }

    async setItem(key: string, data: Player): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            const cacheEntry = {
                cacheKey: key,
                data: data,
                timestamp: Date.now()
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(cacheEntry);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Error storing data in IndexedDB:", error);
            throw error;
        }
    }

    async getItem(key: string): Promise<Player | null> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                
                request.onsuccess = () => {
                    const result = request.result;
                    if (result && result.data) {
                        resolve(result.data);
                    } else {
                        resolve(null);
                    }
                };
                
                request.onerror = () => {
                    console.error("Error retrieving data from IndexedDB:", request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error("Error retrieving data from IndexedDB:", error);
            return null;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Error removing data from IndexedDB:", error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Error clearing IndexedDB:", error);
            throw error;
        }
    }

    async getAllKeys(): Promise<string[]> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.getAllKeys();
                request.onsuccess = () => resolve(request.result as string[]);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Error getting keys from IndexedDB:", error);
            return [];
        }
    }
}

export const playerCache = new PlayerCacheDB();

export function generateCacheKey(region: string, summonerOrName: string, summonerTag?: string) {
    if (summonerTag) {
        return `summoner_${region}_${summonerOrName}-${summonerTag}`;
    }
    return `summoner_${region}_${summonerOrName}`;
}

export function dispatchPlayerCacheUpdate(cacheKey: string, data: any) {
    try {
        window.dispatchEvent(new CustomEvent("playerCacheUpdated", { detail: { cacheKey, data } }));
    } catch (e) {
        console.log(e)
    }
}
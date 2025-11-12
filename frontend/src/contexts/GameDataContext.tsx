import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchChampionSummary, fetchSummonerSpells, fetchItems } from '../utils/championData';

interface GameDataContextType {
    champions: Map<number, { id: string; key: string; name: string }>;
    summonerSpells: Map<number, { id: number; name: string; description: string; iconPath: string }>;
    items: Map<number, { id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number }>;
    isLoading: boolean;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export const GameDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [champions, setChampions] = useState<Map<number, { id: string; key: string; name: string }>>(new Map());
    const [summonerSpells, setSummonerSpells] = useState<Map<number, { id: number; name: string; description: string; iconPath: string }>>(new Map());
    const [items, setItems] = useState<Map<number, { id: number; name: string; description: string; iconPath: string; price: number; priceTotal: number }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGameData = async () => {
            try {
                const [champData, spellData, itemData] = await Promise.all([
                    fetchChampionSummary(),
                    fetchSummonerSpells(),
                    fetchItems()
                ]);

                setChampions(champData);
                setSummonerSpells(spellData);
                setItems(itemData);
            } catch (error) {
                console.error('Error loading game data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameData();
    }, []);

    return (
        <GameDataContext.Provider value={{ champions, summonerSpells, items, isLoading }}>
            {children}
        </GameDataContext.Provider>
    );
};

export const useGameData = () => {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
};


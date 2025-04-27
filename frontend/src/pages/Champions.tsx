import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import ProfileHeader from '../components/ProfileHeader';

import Player from '../interfaces/Player';

const Champions: React.FC = () => {
    const location = useLocation();
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }

    const summoner = decodeURIComponent(encodedSummoner);
    const cacheKey = `summoner_${regionCode}_${summoner}`;

    const getInitialData = () => {
        if (location.state?.apiData) {
            return location.state.apiData;
        }
        
        try {
            const cachedData = localStorage.getItem(cacheKey);
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (error) {
            console.error('Error retrieving cached data:', error);
            return null;
        }
    };

    const [apiData, setApiData] = useState<Player | null>(getInitialData());
    const [loading, setLoading] = useState(!apiData);

    useEffect(() => {
        const fetchData = async () => {
            if (apiData) {
                return;
            }
            
            try {
                const response = await fetch(`/api/lol/profile/${regionCode}/${summoner}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApiData(data);
                
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (error) {
                    console.error('Error caching data:', error);
                }
            } catch (error) {
                console.error('Error fetching API data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [regionCode, summoner, apiData, cacheKey]);

    if (loading || !apiData) {
        return <div className="flex justify-center mt-10">Loading...</div>;
    }

    return (
        <div className="container m-auto">
            <ProfileHeader data={apiData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setApiData} />
            <div className="mt-2 text-neutral-50 bg-neutral-800">
                <h1 className="text-center">Champions</h1>
            </div>
        </div>
    );
};

export default Champions;
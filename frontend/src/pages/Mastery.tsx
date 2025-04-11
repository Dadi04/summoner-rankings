import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import SummonerProfileHeader from '../components/SummonerProfileHeader';

import Player from '../interfaces/Player';

const Mastery: React.FC = () => {
    const location = useLocation();
    const apiData = location.state?.apiData;
    const {regionCode, encodedSummoner} = useParams<{regionCode: string; encodedSummoner: string }>(); 
    
    const [newData, setNewData] = useState<Player>(apiData);

    if (!encodedSummoner) {
        return <div>Error: Summoner parameter is missing.</div>;
    }
    if (!regionCode) {
        return <div>Error: RegionCode parameter is missing.</div>;
    }
    
    const summonerData = JSON.parse(newData.summonerData);
    const entriesData = JSON.parse(newData.entriesData);
    const topMasteriesData = JSON.parse(newData.topMasteriesData);
    const matchesData = JSON.parse(newData.matchesData);
    const rankedMatchesData = JSON.parse(newData.rankedMatchesData);
    const challengesData = JSON.parse(newData.challengesData);
    const spectatorData = JSON.parse(newData.spectatorData);
    const clashData = JSON.parse(newData.clashData);
    const championStatsData = JSON.parse(newData.championStatsData);
    const preferredRoleData = JSON.parse(newData.preferredRoleData);

    return (
        <div className="container m-auto">
            <SummonerProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
            <div className="mt-2 text-neutral-50 bg-neutral-800">
                <h1 className="text-center">Mastery</h1>
                <pre>{JSON.stringify(summonerData, null, 2)}</pre>
                <pre>{JSON.stringify(entriesData, null, 2)}</pre>
                <pre>{JSON.stringify(championStatsData, null, 2)}</pre>
                <pre>{JSON.stringify(preferredRoleData, null, 2)}</pre>
                <pre>{JSON.stringify(topMasteriesData, null, 2)}</pre>
                <pre>{JSON.stringify(matchesData, null, 2)}</pre>
                <pre>{JSON.stringify(rankedMatchesData, null, 2)}</pre>
                <pre>{JSON.stringify(spectatorData, null, 2)}</pre>
                <pre>{JSON.stringify(clashData, null, 2)}</pre>
                <pre>{JSON.stringify(challengesData, null, 2)}</pre>
            </div>
        </div>
    );
};

export default Mastery;
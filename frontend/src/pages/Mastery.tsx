import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import SummonerProfileHeader from '../components/ProfileHeader';

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

    return (
        <div className="container m-auto">
            <SummonerProfileHeader data={newData} regionCode={regionCode} encodedSummoner={encodedSummoner} setData={setNewData} />
            <div className="mt-2 text-neutral-50 bg-neutral-800">
                <h1 className="text-center">Mastery</h1>
            </div>
        </div>
    );
};

export default Mastery;
import React from 'react';
import { useLocation } from 'react-router-dom';

const Summoner: React.FC = () => {
    const location = useLocation();
    const data = location.state;

    return (
        <div>
            <h1>{data ? data.player.gameName : 'No Summoner Data'}</h1>
        </div>
    );
};

export default Summoner;
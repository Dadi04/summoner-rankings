import React from "react";

interface MasteryProps {
    data: any;
}

const Mastery: React.FC<MasteryProps> = ({data}) => {

    return (
        <div>
            <h1 className="text-center">Mastery</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Mastery;
import React from "react";

interface ChampionsProps {
    data: any;
}

const Champions: React.FC<ChampionsProps> = ({data}) => {

    return (
        <div>
            <h1 className="text-center">Champions</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Champions;
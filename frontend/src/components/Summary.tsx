import React from "react";

interface SummaryProps {
    data: any;
}

const Summary: React.FC<SummaryProps> = ({data}) => {

    return (
        <div>
            <h1 className="text-center">Summary</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Summary;
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const RaceDetail: React.FC = () => {
    const { type, raceId } = useParams<{ type: string; raceId: string }>();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(`/races/${type}`);
    };

    return (
        <div className="min-h-screen bg-[#f2f2f2]">
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={handleBack}
                    className="mb-6 px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
                >
                    ← Back to {type === "private" ? "My Races" : "Public Races"}
                </button>
                <div className="max-w-4xl mx-auto bg-white border-2 border-neutral-300 rounded-lg p-8">
                    <h1 className="text-4xl font-bold mb-4">
                        Race {raceId} - {type === "private" ? "Private" : "Public"}
                    </h1>
                    <div className="mt-6 space-y-4">
                        <div className="p-4 bg-neutral-100 rounded">
                            <h2 className="text-xl font-semibold mb-2">Race Details</h2>
                            <p className="text-neutral-700">
                                This is a mockup race detail page. Here you can display information about the race,
                                participants, standings, and more.
                            </p>
                        </div>
                        <div className="p-4 bg-neutral-100 rounded">
                            <h2 className="text-xl font-semibold mb-2">Participants</h2>
                            <p className="text-neutral-700">List of participants will be shown here.</p>
                        </div>
                        <div className="p-4 bg-neutral-100 rounded">
                            <h2 className="text-xl font-semibold mb-2">Standings</h2>
                            <p className="text-neutral-700">Current standings and rankings will be displayed here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaceDetail;


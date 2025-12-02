import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Race {
    id: number;
    title: string;
    status: number;
    isPublic: boolean;
    createdAt: string;
    endingOn: string | null;
}

const RacesPublic: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);
    const [raceTitle, setRaceTitle] = useState("");
    const [endingOn, setEndingOn] = useState("");
    const [races, setRaces] = useState<Race[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = jwtDecode<any>(token);
                setIsAdmin(payload.isAdmin === true || payload.isAdmin === "True");
            } catch (error) {
                console.error("Failed to decode token:", error);
                setIsAdmin(false);
            }
        }
    }, []);

    const fetchRaces = async () => {
        try {
            const response = await fetch("/api/races/public");

            if (response.ok) {
                const data = await response.json();
                setRaces(data);
            }
        } catch (error) {
            console.error("Error fetching public races:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRaces();
    }, []);

    const handleRaceClick = (raceId: number) => {
        navigate(`/races/public/${raceId}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, race: Race) => {
        e.stopPropagation();
        if (!isAdmin) {
            alert("Only administrators can delete public races");
            return;
        }
        setRaceToDelete(race);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!raceToDelete) return;

        try {
            const token = localStorage.getItem("jwt");
            const response = await fetch(`/api/races/${raceToDelete.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete race");
            }

            setShowDeleteDialog(false);
            setRaceToDelete(null);
            fetchRaces();
        } catch (error) {
            console.error("Error deleting race:", error);
            alert("Failed to delete race. Please try again.");
        }
    };

    const handleCreateRace = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!raceTitle.trim()) {
            alert("Please enter a race title");
            return;
        }

        if (!isAdmin) {
            alert("Only administrators can create public races");
            return;
        }

        try {
            const token = localStorage.getItem("jwt");
            const payload = {
                title: raceTitle,
                isPublic: true,
                endingOn: endingOn ? new Date(endingOn).toISOString() : null,
            };

            const response = await fetch("/api/races", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create race");
            }

            setRaceTitle("");
            setEndingOn("");
            setShowDialog(false);
            
            fetchRaces();
        } catch (error) {
            console.error("Error creating race:", error);
            alert("Failed to create race. Please try again.");
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {isAdmin && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowDialog(true)}
                            className="px-6 py-3 bg-neutral-700 text-white font-semibold rounded hover:bg-neutral-600 transition-colors duration-300 cursor-pointer"
                        >
                            Add New
                        </button>
                    </div>
                )}
                {isLoading ? (
                    <div className="bg-neutral-800 border border-neutral-600 rounded p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </div>
                        <p className="text-xl text-neutral-300">Loading public races...</p>
                    </div>
                ) : races.length === 0 ? (
                <div className="border border-neutral-600 rounded p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-800 mb-4">No Public Races Available</h2>
                    <p className="text-xl text-neutral-600">There are no public races at the moment.</p>
                    <p className="text-lg text-neutral-700 mt-2">Check back later for new races!</p>
                </div>
            ) : (
                    <div className="space-y-4">
                        {races.map((race) => (
                            <div
                                key={race.id}
                                onClick={() => handleRaceClick(race.id)}
                                className="bg-neutral-800 border border-neutral-600 rounded p-6 cursor-pointer transition-all duration-300 hover:bg-neutral-700 relative group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold text-neutral-50">{race.title}</h2>
                                        {race.endingOn && (
                                            <p className="text-sm text-neutral-400 mt-2">
                                                Ends: {new Date(race.endingOn).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, race)}
                                        className={`ml-4 p-2 rounded transition-colors ${
                                            isAdmin
                                                ? "hover:bg-red-600 text-neutral-300 hover:text-white"
                                                : "opacity-30 cursor-not-allowed text-neutral-500"
                                        }`}
                                        title={isAdmin ? "Delete race" : "Only admins can delete public races"}
                                        disabled={!isAdmin}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showDialog && (
                <div onClick={() => setShowDialog(false)} className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-neutral-800 py-6 px-5 rounded shadow-lg relative max-w-md w-full mx-4 border border-neutral-600">
                        <div className="px-2 pt-2 pb-0.5 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-neutral-700">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <h2 className="text-2xl font-bold mt-6 text-center text-neutral-50">Create New Public Race</h2>
                        <p className="text-center mt-0 mb-4 text-neutral-300">Fill in the details for your new public race.</p>
                        
                        <form onSubmit={handleCreateRace} className="flex flex-col">
                            <label htmlFor="raceTitle" className="text-neutral-300">
                                Race Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="raceTitle"
                                value={raceTitle}
                                onChange={(e) => setRaceTitle(e.target.value)}
                                className="w-full p-2 mb-3 border border-neutral-600 bg-neutral-700 text-neutral-50 rounded transition-all duration-300 ease-in-out hover:border-neutral-500 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500 outline-none"
                                placeholder="Enter race title"
                                required
                            />

                            <label htmlFor="endingOn" className="text-neutral-300">End Date (Optional)</label>
                            <input
                                type="datetime-local"
                                id="endingOn"
                                value={endingOn}
                                onChange={(e) => setEndingOn(e.target.value)}
                                className="w-full p-2 mb-3 border border-neutral-600 bg-neutral-700 text-neutral-50 rounded transition-all duration-300 ease-in-out hover:border-neutral-500 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500 outline-none"
                            />

                            <button
                                type="submit"
                                className="w-full cursor-pointer bg-neutral-700 text-white p-2 rounded transition duration-300 hover:bg-neutral-600 mt-2"
                            >
                                Create Race
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDialog(false)}
                                className="w-full cursor-pointer bg-neutral-600 text-neutral-200 p-2 rounded transition duration-300 hover:bg-neutral-500 mt-2"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteDialog && raceToDelete && (
                <div onClick={() => setShowDeleteDialog(false)} className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-neutral-800 py-6 px-5 rounded shadow-lg relative max-w-md w-full mx-4 border border-neutral-600">
                        <div className="px-2 pt-2 pb-0.5 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-neutral-700">
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setRaceToDelete(null);
                                }}
                                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex justify-center mt-6 mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-neutral-50">Delete Public Race?</h2>
                        <p className="text-center mt-2 mb-4 text-neutral-300">
                            Are you sure you want to delete <strong>"{raceToDelete.title}"</strong>? This action cannot be undone.
                        </p>

                        <button
                            type="button"
                            onClick={handleDeleteConfirm}
                            className="w-full cursor-pointer bg-red-600 text-white p-2 rounded transition duration-300 hover:bg-red-700 mb-2"
                        >
                            Yes, Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setRaceToDelete(null);
                            }}
                            className="w-full cursor-pointer bg-neutral-600 text-neutral-200 p-2 rounded transition duration-300 hover:bg-neutral-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RacesPublic;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Race {
    id: number;
    title: string;
    status: number;
    isPublic: boolean;
    createdAt: string;
    endingOn: string | null;
}

const RacesPrivate: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);
    const [raceTitle, setRaceTitle] = useState("");
    const [endingOn, setEndingOn] = useState("");
    const [races, setRaces] = useState<Race[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        setIsAuthenticated(!!token);

        const handleAuthChange = () => {
            const token = localStorage.getItem("jwt");
            setIsAuthenticated(!!token);
        };

        window.addEventListener("authStateChanged", handleAuthChange);
        
        return () => {
            window.removeEventListener("authStateChanged", handleAuthChange);
        };
    }, []);

    const fetchRaces = async () => {
        try {
            const token = localStorage.getItem("jwt");
            if (!token) return;

            const response = await fetch("/api/races", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRaces(data);
            }
        } catch (error) {
            console.error("Error fetching races:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchRaces();
        }
    }, [isAuthenticated]);

    const handleRaceClick = (raceId: number) => {
        navigate(`/races/private/${raceId}`);
    };

    const handleDeleteClick = (e: React.MouseEvent, race: Race) => {
        e.stopPropagation();
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

        try {
            const token = localStorage.getItem("jwt");
            const payload = {
                title: raceTitle,
                isPublic: false,
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

    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white border-2 border-neutral-300 rounded-lg p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#404040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-800 mb-4">Authentication Required</h2>
                    <p className="text-xl text-neutral-600">You must be logged in to view your races.</p>
                    <p className="text-lg text-neutral-500 mt-2">Please sign in to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowDialog(true)}
                        className="px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors duration-300"
                    >
                        Add New
                    </button>
                </div>
                {isLoading ? (
                    <div className="bg-white border-2 border-neutral-300 rounded-lg p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </div>
                        <p className="text-xl text-neutral-600">Loading races...</p>
                    </div>
                ) : races.length === 0 ? (
                <div className="bg-white border-2 border-neutral-300 rounded-lg p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-800 mb-4">No Races Yet</h2>
                    <p className="text-xl text-neutral-600">You haven't created any races yet.</p>
                    <p className="text-lg text-neutral-500 mt-2">Create your first race to get started!</p>
                </div>
            ) : (
                    <div className="space-y-4">
                        {races.map((race) => (
                            <div
                                key={race.id}
                                onClick={() => handleRaceClick(race.id)}
                                className="bg-white border-2 border-neutral-300 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-800 relative group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold">{race.title}</h2>
                                        {race.endingOn && (
                                            <p className="text-sm text-neutral-500 mt-2 group-hover:text-neutral-300">
                                                Ends: {new Date(race.endingOn).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, race)}
                                        className="ml-4 p-2 rounded-lg hover:bg-red-100 transition-colors group-hover:hover:bg-red-500"
                                        title="Delete race"
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
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative max-w-md w-full mx-4">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <h2 className="text-2xl font-bold mt-6 text-center">Create New Race</h2>
                        <p className="text-center mt-0 mb-4">Fill in the details for your new race.</p>
                        
                        <form onSubmit={handleCreateRace} className="flex flex-col">
                            <label htmlFor="raceTitle">
                                Race Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="raceTitle"
                                value={raceTitle}
                                onChange={(e) => setRaceTitle(e.target.value)}
                                className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none"
                                placeholder="Enter race title"
                                required
                            />

                            <label htmlFor="endingOn">End Date (Optional)</label>
                            <input
                                type="datetime-local"
                                id="endingOn"
                                value={endingOn}
                                onChange={(e) => setEndingOn(e.target.value)}
                                className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none"
                            />

                            <button
                                type="submit"
                                className="w-full cursor-pointer bg-neutral-900 text-white p-2 rounded transition duration-300 hover:bg-neutral-800 mt-2"
                            >
                                Create Race
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDialog(false)}
                                className="w-full cursor-pointer bg-neutral-200 text-neutral-800 p-2 rounded transition duration-300 hover:bg-neutral-300 mt-2"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteDialog && raceToDelete && (
                <div onClick={() => setShowDeleteDialog(false)} className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative max-w-md w-full mx-4">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100">
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setRaceToDelete(null);
                                }}
                                className="text-neutral-500 hover:text-neutral-800 transition-colors"
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
                        <h2 className="text-2xl font-bold text-center">Delete Race?</h2>
                        <p className="text-center mt-2 mb-4">
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
                            className="w-full cursor-pointer bg-neutral-200 text-neutral-800 p-2 rounded transition duration-300 hover:bg-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RacesPrivate;


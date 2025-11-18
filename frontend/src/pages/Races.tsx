import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const Races: React.FC = () => {
    const location = useLocation();
    const isOnMainRacesPage = location.pathname === "/races";

    return (
        <div className="bg-[#f2f2f2] py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-center gap-6 mb-8">
                    <NavLink
                        to="/races/private"
                        className={({ isActive }) =>
                            `px-8 py-3 text-xl font-semibold rounded-lg transition-colors duration-300 ${
                                isActive || (isOnMainRacesPage && false)
                                    ? "bg-neutral-800 text-white"
                                    : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
                            }`
                        }
                    >
                        My Races
                    </NavLink>
                    <NavLink
                        to="/races/public"
                        className={({ isActive }) =>
                            `px-8 py-3 text-xl font-semibold rounded-lg transition-colors duration-300 ${
                                isActive || (isOnMainRacesPage && false)
                                    ? "bg-neutral-800 text-white"
                                    : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
                            }`
                        }
                    >
                        Public Races
                    </NavLink>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default Races;
import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import loadingAnimation from "../assets/animations/loading.lottie";

const ProtectedRoute: React.FC<{children: React.ReactNode;}> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const { username: requestedUsername } = useParams<{ username: string }>();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
        try {
            const payload = jwtDecode<any>(token);
            setUsername(payload.username);
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
        }
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    if (isAuthenticated === null) {
        return  (
            <div className="w-full flex justify-center mt-5">
                <DotLottieReact src={loadingAnimation} className="w-[600px] bg-transparent" loop autoplay />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (username !== requestedUsername) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 
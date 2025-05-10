import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
    username: string;
    email?: string;
}

const Account: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = jwtDecode<any>(token);
                setUserInfo({
                    username: payload.username,
                });
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">Account Profile</h1>
                <div className="mb-4">
                    <p className="text-gray-700">
                        <span className="font-semibold">Username:</span> {userInfo?.username}
                    </p>
                    {userInfo?.email && (
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> {userInfo.email}
                        </p>
                    )}
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-3">Account Settings</h2>
                    <p className="text-gray-600">
                        Account settings and preferences will be available here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Account;
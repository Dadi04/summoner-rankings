import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import logolight from "../assets/logo-light.png";
import close from "../assets/close.png";

const NavBar: React.FC = () => {
    const [showSignInForm, setShowSignInForm] = useState(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);

    const [signinUsername, setSigninUsername] = useState("");
    const [signinPassword, setSigninPassword] = useState("");

    const [signupEmail, setSignupEmail] = useState("");
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            setIsAuthenticated(true);
            try {
                const payload = jwtDecode<any>(token);
                setUsername(payload.username);
            } catch {
                console.warn("Failed to decode token");
            }
        }
    }, []);

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: signinUsername,
                    password: signinPassword,
                }),
            });
            if (!res.ok) throw new Error("Login failed");
            const data = await res.json();
            
            if (!data.token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("jwt", data.token);
            setIsAuthenticated(true);

            try {
                const payload = jwtDecode<any>(data.token);
                setUsername(payload.username);
            } catch (decodeError) {
                console.warn("Failed to decode token:", decodeError);
            }

            setShowSignInForm(false);
            window.dispatchEvent(new Event("authStateChanged"));
        } catch (error) {
            console.error(error);
            alert("Invalid credentials");
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const signupResult = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: signupEmail,
                    username: signupUsername,
                    password: signupPassword,
                }),
            });
            
            if (!signupResult.ok) {
                const errorData = await signupResult.json().catch(() => ({ message: "Registration failed" }));
                console.error("Registration failed:", errorData);
                throw new Error(errorData.message || "Registration failed");
            }
            
            const signinResult = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: signupUsername,
                    password: signupPassword,
                }),
            });
            
            if (!signinResult.ok) {
                throw new Error("Registration successful, but auto-login failed. Please log in manually.");
            }
            
            const data = await signinResult.json();
            
            if (!data.token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("jwt", data.token);
            setIsAuthenticated(true);

            try {
                const payload = jwtDecode<any>(data.token);
                setUsername(payload.username);
            } catch (decodeError) {
                console.error("Failed to decode token:", decodeError);
            }

            setShowSignUpForm(false);
            window.dispatchEvent(new Event("authStateChanged"));
            
            alert("Registration successful! You are now logged in.");
        } catch (error) {
            console.error("Registration error:", error);
            alert(error instanceof Error ? error.message : "Registration error");
        }
    };

    const handleSignout = () => {
        localStorage.removeItem("jwt");
        setIsAuthenticated(false);
        setUsername(null);
        window.dispatchEvent(new Event("authStateChanged"));
    }
  
    return (
        <>
            <nav className="bg-neutral-800 text-white p-4">
                <div className="container mx-auto flex items-center">
                    <div className="flex-1 flex justify-start">
                        <Link to="/"><img src={logolight} alt="logo-light.png" className="h-18" /></Link>
                    </div>
                    <div className="flex-1 flex justify-center space-x-6">
                        <ul className="flex space-x-8 text-xl">
                            <li><NavLink to="/" className="p-3 transition-color duration-300 hover:text-gray-400">Home</NavLink></li>
                            <li><NavLink to="/races" className="p-3 transition-color duration-300 hover:text-gray-400">Races</NavLink></li>
                            <li><NavLink to="/leaderboard" className="p-3 transition-color duration-300 hover:text-gray-400">Leaderboard</NavLink></li>
                            <li><NavLink to="/clash" className="p-3 transition-color duration-300 hover:text-gray-400">Clash</NavLink></li>
                        </ul>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <ul className="text-xl">
                            <li>
                                {isAuthenticated ? (
                                    <>
                                        <Link to={`/${username}`} className="p-3 cursor-pointer transition-color duration-300 hover:text-gray-400">
                                            {username || "Account"}
                                        </Link>
                                        <button onClick={handleSignout} className="p-3 cursor-pointer transition-color duration-300 hover:text-gray-400" >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setShowSignInForm(true)} className="p-3 cursor-pointer transition-color duration-300 hover:text-gray-400">
                                        Sign In
                                    </button>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {showSignInForm && (
                <div onClick={() => setShowSignInForm(false)} className="fixed inset-0 flex items-center justify-center bg-black/90 z-150">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative w-100">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                            <img onClick={() => setShowSignInForm(false)} src={close} alt="close.png" className="h-4" />
                        </div>
                        <h2 className="text-2xl font-bold mt-6 text-center">Sign In to Summoner Rankings</h2>
                        <p className="text-center mt-0 mb-4">Welcome Back! Please sign in to continue.</p>
                        <form onSubmit={handleSignin} className="flex flex-col">
                            <label htmlFor="username">Username</label>
                            <input type="text" value={signinUsername} onChange={e => setSigninUsername(e.target.value)} placeholder="Enter your username" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="username" required />
                            <label htmlFor="password">Password</label>
                            <input type="password" value={signinPassword} onChange={e => setSigninPassword(e.target.value)} placeholder="Enter your password" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="current-password" required />
                            <button type="submit" className="w-full cursor-pointer bg-neutral-900 text-white p-2 rounded transition duration-300 hover:bg-neutral-800">Submit</button>
                        </form>
                        <div className="border-t-1 mt-4 w-full p-4 text-center">
                            <span>Don"t have an account? </span>
                            <button onClick={() => {setShowSignInForm(false); setShowSignUpForm(true)}} className="text-neutral-500 underline cursor-pointer hover:text-neutral-700 transition duration-300">Sign up</button>
                        </div>
                    </div>
                </div>
            )}
    
            {showSignUpForm && (
                <div onClick={() => setShowSignUpForm(false)} className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white py-6 px-5 rounded-lg shadow-lg relative w-100">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                            <img onClick={() => setShowSignUpForm(false)} src={close} alt="close.png" className="h-4" />
                        </div>
                        <h2 className="text-2xl font-bold mt-6 text-center">Sign Up to Summoner Rankings</h2>
                        <p className="text-center mt-0 mb-4">Create your account to save favorites and more!</p>
                        <form onSubmit={handleSignup} className="flex flex-col">
                            <label htmlFor="email">Email</label>
                            <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="Enter your email" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="email" required />
                            <label htmlFor="username">Username</label>
                            <input type="text" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} placeholder="Enter your username" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="username" required />
                            <label htmlFor="password">Password</label>
                            <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Enter your password" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="current-password" required />
                            <button type="submit" className="w-full cursor-pointer bg-neutral-900 text-white p-2 rounded transition duration-300 hover:bg-neutral-800">Submit</button>
                        </form>
                        <div className="border-t-1 mt-4 w-full p-4 text-center">
                            <span>Already have an account? </span>
                            <button onClick={() => {setShowSignInForm(true); setShowSignUpForm(false)}} className="text-neutral-500 underline cursor-pointer hover:text-neutral-700 transition duration-300">Sign In</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;
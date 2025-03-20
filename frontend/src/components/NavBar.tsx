import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logolight from '../assets/logo-light.png';
import close from '../assets/close.png';

const NavBar: React.FC = () => {
    const [showSignInForm, setShowSignInForm] = useState(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);
  
    return (
        <>
            <nav className="bg-neutral-800 text-white p-4">
                <div className="container mx-auto flex items-center">
                    <div className="flex-1 flex justify-start">
                    <Link to="/"><img src={logolight} alt="logo-light.png" className="h-18" /></Link>
                    </div>
                    <div className="flex-1 flex justify-center space-x-6">
                    <ul className="flex space-x-8 text-xl">
                        <li><Link to="/" className="p-3 transition-color duration-300 hover:text-gray-400">Home</Link></li>
                        <li><Link to="/races" className="p-3 transition-color duration-300 hover:text-gray-400">Races</Link></li>
                        <li><Link to="/leaderboard" className="p-3 transition-color duration-300 hover:text-gray-400">Leaderboard</Link></li>
                        <li><Link to="/streamers" className="p-3 transition-color duration-300 hover:text-gray-400">Streamers</Link></li>
                    </ul>
                    </div>
                    <div className="flex-1 flex justify-end">
                    <ul className="text-xl">
                        <li><button onClick={() => setShowSignInForm(true)} className="p-3 cursor-pointer transition-color duration-300 hover:text-gray-400">Sign In</button></li>
                    </ul>
                    </div>
                </div>
            </nav>

            {showSignInForm && (
                <div onClick={() => setShowSignInForm(false)} className="fixed inset-0 flex items-center justify-center bg-black opacity-90 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-lg relative w-100">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                            <img onClick={() => setShowSignInForm(false)} src={close} alt="close.png" className="h-4" />
                        </div>
                        <h2 className="text-2xl font-bold mt-6 text-center">Sign In to Summoner Rankings</h2>
                        <p className="text-center mt-0 mb-4">Welcome Back! Please sign in to continue.</p>
                        <form action="" className="flex flex-col">
                            <label htmlFor="username">Username</label>
                            <input type="text" placeholder="Enter your username" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="username" />
                            <label htmlFor="password">Password</label>
                            <input type="password" placeholder="Enter your password" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="current-password" />
                            <button type="submit" className="w-full cursor-pointer bg-neutral-900 text-white p-2 rounded transition duration-300 hover:bg-neutral-800">Submit</button>
                        </form>
                        <div className="border-t-1 mt-4 w-full p-4 text-center">
                            <span>Don't have an account? </span>
                            <button onClick={() => {setShowSignInForm(false); setShowSignUpForm(true)}} className="text-neutral-500 underline cursor-pointer hover:text-neutral-700 transition duration-300">Sign up</button>
                        </div>
                    </div>
                </div>
            )}
    
            {showSignUpForm && (
                <div onClick={() => setShowSignUpForm(false)} className="fixed inset-0 flex items-center justify-center bg-black opacity-90 z-50">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-lg relative w-100">
                        <div className="p-2 absolute top-4 right-4 cursor-pointer rounded transition duration-200 ease-in-out hover:bg-gray-100 active:outline">
                            <img onClick={() => setShowSignUpForm(false)} src={close} alt="close.png" className="h-4" />
                        </div>
                        <h2 className="text-2xl font-bold mt-6 text-center">Sign In to Summoner Rankings</h2>
                        <p className="text-center mt-0 mb-4">Welcome Back! Please sign in to continue.</p>
                        <form action="" className="flex flex-col">
                            <label htmlFor="email">Email</label>
                            <input type="email" placeholder="Enter your email" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="email" />
                            <label htmlFor="username">Username</label>
                            <input type="text" placeholder="Enter your username" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="username" />
                            <label htmlFor="password">Password</label>
                            <input type="password" placeholder="Enter your password" className="w-full p-2 mb-3 border rounded transition-all duration-300 ease-in-out hover:border-gray-500 hover:shadow-md focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none" autoComplete="current-password" />
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
import React from 'react';
import logodark from '../assets/logo-dark.png';

const Home: React.FC = () => (
    <div className="flex justify-center flex-col items-center mt-40">
        <div className="container m-auto w-90">
            <img src={logodark} alt="logo-dark.png" />
        </div>
        <div className="container m-auto w-220 mt-5 p-5 bg-neutral-200 rounded-4xl">
            <form action="" className="flex items-center justify-between">
                <div className="flex flex-col border-r-1 pl-2 pr-2 w-80">
                    <label htmlFor="select">Region</label>
                    <select name="" id="">
                        <option value="">North America</option>
                        <option value="">Europe West</option>
                        <option value="">Europe Nordic & East</option>
                        <option value="">Middle East</option>
                        <option value="">Oceania</option>
                        <option value="">Korea</option>
                        <option value="">Japan</option>
                        <option value="">Brazil</option>
                        <option value="">LAS</option>
                        <option value="">LAN</option>
                        <option value="">Russia</option>
                        <option value="">Türkiye</option>
                        <option value="">Southeast Asia</option>
                        <option value="">Taiwan</option>
                        <option value="">Vietnam</option>
                    </select>
                </div>
                <div className="flex flex-col w-full ml-2">
                    <label htmlFor="game-name">Search</label>
                    <input type="text" name="game-name" placeholder="Game Name + #TAG" className="w-full outline-none border-none" />
                </div>
            </form>
        </div>
    </div>
);

export default Home;
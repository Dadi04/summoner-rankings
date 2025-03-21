import React from "react";
import { Link } from "react-router-dom"
import logolight from "../assets/logo-light.png"

const Footer: React.FC = () => {
    return (
        <div className="w-full flex justify-evenly p-5  bg-neutral-800 text-neutral-300">
            <div>
                <img src={logolight} alt="logo-light.png" className="h-20" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-xl font-bold">Summoner Rankings</h2>
                <Link to="/about" className="transition ease-in-out hover:text-neutral-100">About</Link>
                <Link to="/company" className="transition ease-in-out hover:text-neutral-100">Company</Link>
            </div>
            <div className="flex flex-col">
                <h2 className="text-xl font-bold">Products</h2>
                <Link to="/" className="transition ease-in-out hover:text-neutral-100">League of Legends</Link>
            </div>
            <div className="flex flex-col">
                <h2 className="text-xl font-bold">Resources</h2>
                <Link to="/privacy-policy" className="transition ease-in-out hover:text-neutral-100">Privacy Policy</Link>
                <Link to="/terms-of-use" className="transition ease-in-out hover:text-neutral-100">Terms of Use</Link>
                <Link to="/help" className="transition ease-in-out hover:text-neutral-100">Help</Link>
                <Link to="/email-inquiry" className="transition ease-in-out hover:text-neutral-100">Email Inquiry</Link>
                <Link to="/contact-us" className="transition ease-in-out hover:text-neutral-100">Contact us</Link>
            </div>
        </div>
    );
};

export default Footer;
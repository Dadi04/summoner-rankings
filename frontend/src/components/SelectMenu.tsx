import { useState, useEffect, useRef } from "react";

import arrowDownLight from "../assets/arrow-down-light.png"

const SelectMenu: React.FC<{options: Array<{label: string, value: string}>; value: string; onChange: React.Dispatch<React.SetStateAction<string>>; placeholder: string; classes?: string;}> = ({options, value, onChange, placeholder, classes}) => {
    const [open, setOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClickOutside(e: any) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [])

    const selectedOption = options.find(o => o.value === value);

    return (
        <div ref={ref} className={`relative ${classes}`}>
            <div onClick={() => setOpen(prev => !prev)} className="flex items-center justify-between bg-neutral-900 cursor-pointer rounded p-2">
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <img src={arrowDownLight} alt="toggle dropdown" className={`h-5 transform transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
            </div>
            {open && (
                <div className="absolute left-0 right-0 mt-1 bg-neutral-900 shadow-lg rounded z-20 overflow-hidden">
                    {options.map(opt => (
                        <div key={opt.value} onClick={() => {onChange(opt.value); setOpen(false);}} className={`p-2 hover:bg-neutral-700 cursor-pointer ${opt.value === value ? "bg-neutral-800" : ""}`}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SelectMenu;
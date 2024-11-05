'use client'

import { UserButton } from "@clerk/nextjs";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef } from "react";

const SideBar = () => {
    const [focused, setFocus] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null); 

    const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
            setFocus(false);
        }
    };

    return (
        <div onClick={handleClickOutside} className="relative h-full w-full">
            <div
                ref={sidebarRef}
                className="absolute w-1/4 max-w-80 min-w-20 h-full bg-[#efefef] border-r-6 flex flex-col justify-start items-center shadow-lg"
            >
                <div className="w-full h-[10%] bg-transparent flex justify-evenly items-center">
                    {focused ? (
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="text-black cursor-pointer w-[10%] h-[30%]"
                            onClick={() => setFocus(false)}
                        />
                    ) : null}
                    <div
                        className={`w-[80%] h-1/2 bg-gray-200 flex justify-start items-center rounded-3xl text-black transition-all duration-300 ease-in-out`}
                    >
                        <input
                            type="text"
                            className="bg-transparent w-[80%] p-4 outline-none"
                            onClick={() => setFocus(true)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="text-black w-[20%] h-[50%]" />
                    </div>
                </div>







                <div className="w-full h-[90%] bg-transparent">
                    {//here
                    }
                </div>
            </div>
        </div>
    );
};

export default SideBar;

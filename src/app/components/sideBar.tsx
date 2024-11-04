'use client'

import { UserButton } from "@clerk/nextjs";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const SideBar = () => {

    const [focused, setFocus] = useState(false)


    return (
        <div className="w-1/4 max-w-80 min-w-20 h-full bg-[#efefef] border-r-6 flex flex-col justify-start items-center shadow-lg">
            <div className="w-full h-[10%] bg-gray-200 flex justify-evenly items-center">
                <div className="w-[80%] h-1/2 bg-gray-300 flex justify-start items-center rounded-3xl text-black">
                    <input type="text" className="bg-transparent w-[80%] p-4" onFocus={((pre)=>setFocus(!pre))}/>
                    <FontAwesomeIcon icon={faSearch} className="text-black w-[20%] h-[50%]"/>
                </div>
            </div>
        </div>

     );
}
 
export default SideBar;

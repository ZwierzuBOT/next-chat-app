'use client';

import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useUser } from '@clerk/nextjs'; 

type User = {
    id: string;
    name: string;
    surname: string;
};

const SideBar = () => {
    const { user } = useUser(); 
    const currentUserId = user ? user.id : null; 
    const [focused, setFocus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersRef = collection(firestore, 'users');
            const querySnapshot = await getDocs(usersRef);

            const results: User[] = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<User, 'id'>) 
                }))
                .filter(user => 
                    user.id !== currentUserId && 
                    matchesSearchTerm(user, searchTerm) 
                )
                .sort((a, b) => {
                    const fullNameA = `${a.name} ${a.surname}`.toLowerCase();
                    const fullNameB = `${b.name} ${b.surname}`.toLowerCase();
                    return fullNameA.localeCompare(fullNameB);
                })
                .slice(0, 6); 

            setSearchResults(results);
        };

        const debounceFetch = setTimeout(() => {
            if (searchTerm) {
                fetchUsers(); 
            } else {
                setSearchResults([]); 
            }
        }, 100);

        return () => clearTimeout(debounceFetch);
    }, [searchTerm, currentUserId]); 

    const matchesSearchTerm = (user: User, term: string) => {
        const searchParts = term.trim().toLowerCase().split(' '); 
        return searchParts.every(part => {
            const nameMatches = user.name.toLowerCase().includes(part);
            const surnameMatches = user.surname.toLowerCase().includes(part);
            return nameMatches || surnameMatches; 
        });
    };

    const handleFocus = () => setFocus(true);
    const handleBlur = () => {
        setTimeout(() => {
            if (sidebarRef.current) {
                setFocus(false);
            }
        }, 100);
    };

    return (
        <div
            ref={sidebarRef}
            className="absolute w-1/4 max-w-80 min-w-20 h-full bg-[#efefef] border-r-6 flex flex-col justify-start items-center shadow-lg"
        >
            <div className="w-full h-[10%] bg-transparent flex justify-evenly items-center">
                {focused && (
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        className="text-black cursor-pointer w-[10%] h-[30%]"
                        onClick={() => setFocus(false)}
                    />
                )}
                <div className="w-[80%] h-1/2 bg-gray-200 flex justify-start items-center rounded-3xl text-black transition-all duration-300 ease-in-out">
                    <input
                        type="text"
                        className="bg-transparent w-[80%] p-4 outline-none"
                        onFocus={handleFocus} 
                        onBlur={handleBlur} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                    />
                    <FontAwesomeIcon icon={faSearch} className="text-black w-[20%] h-[50%]" />
                </div>
            </div>

            {focused && (
                <div className="w-full h-[90%] bg-transparent flex flex-col items-center justify-start">
                    {searchResults.length > 0 ? (
                        <ul className="w-full bg-transparent border-2 p-2">
                            {searchResults.map((user) => (
                                <li key={user.id} className="p-2 hover:bg-gray-100 cursor-pointer text-black">
                                    {user.name} {user.surname}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-2">No users found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SideBar;

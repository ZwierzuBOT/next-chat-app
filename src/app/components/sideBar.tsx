'use client'
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

// Define types for the props
type SideBarProps = {
    selectedUser: User | null;  // selectedUser is either a User or null
    setSelectedUser: (user: User | null) => void;  // setSelectedUser function that takes User or null
};

const SideBar = ({ selectedUser, setSelectedUser }: SideBarProps) => {
    const { user } = useUser(); 
    const currentUserId = user ? user.id : null; 
    const [focused, setFocus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [resultsLimit, setResultsLimit] = useState(5); 
    const [totalMatchingUsers, setTotalMatchingUsers] = useState(0); // Track total matching users
    const sidebarRef = useRef<HTMLDivElement>(null);
    const showMoreButtonRef = useRef<HTMLButtonElement>(null);

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
                });

            setTotalMatchingUsers(results.length); // Set total matching users
            setSearchResults(results.slice(0, resultsLimit)); // Limit the displayed results
        };

        const debounceFetch = setTimeout(() => {
            if (searchTerm) {
                fetchUsers(); 
            } else {
                setSearchResults([]); 
                setTotalMatchingUsers(0); // Reset when search term is cleared
            }
        }, 100);

        return () => clearTimeout(debounceFetch);
    }, [searchTerm, resultsLimit, currentUserId]);

    const matchesSearchTerm = (user: User, term: string) => {
        const searchParts = term.trim().toLowerCase().split(' '); 

        const nameMatches = searchParts[0] && user.name.toLowerCase().startsWith(searchParts[0]);
        const surnameMatches = searchParts[1] ? user.surname.toLowerCase().startsWith(searchParts[1]) : true; 
    
        return nameMatches && surnameMatches;
    };
    
    const handleFocus = () => {
        setFocus(true);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.relatedTarget !== showMoreButtonRef.current) {
            setTimeout(() => {
                if (sidebarRef.current) {
                    setFocus(false);
                }
            }, 100);
        }
    };

    const handleShowMore = () => {
        setResultsLimit((prevLimit) => prevLimit + 5); 
    };

    useEffect(() => {
        if (!focused) {
            setResultsLimit(5);
        }
    }, [focused]);

    return (
        <div
            ref={sidebarRef}
            className="w-1/4 max-w-80 min-w-20 h-full bg-[#efefef] border-r-6 flex flex-col justify-start items-center shadow-lg"
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
                        className="bg-transparent w-[80%] p-4 outline-none transition-all"
                        onFocus={handleFocus} 
                        onBlur={handleBlur} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                    />
                    <FontAwesomeIcon icon={faSearch} className="text-black w-[20%] h-[50%] cursor-pointer" />
                </div>
            </div>

            {focused && (
                <div className="w-full h-[90%] bg-transparent flex flex-col items-center justify-start">
                    {searchResults.length > 0 ? (
                        <>
                            <ul className="w-full bg-transparent border-r-2 border-t-2 border-l-2">
                                {searchResults.map((user) => (
                                    <li 
                                        key={user.id} 
                                        className="p-2 hover:bg-gray-300 cursor-pointer text-black flex justify-start items-end mt-2 break-words"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setFocus(false);
                                            setSearchTerm("")
                                          }}
                                          
                                        
                                    >
                                        {user.name} {user.surname}
                                    </li>
                                ))}
                            </ul>
                            {totalMatchingUsers > resultsLimit && ( 
                                <button 
                                    ref={showMoreButtonRef}
                                    className="bg-gray-200 hover:bg-gray-300 transition-all duration-500 w-[80%] h-[5%] rounded-br-xl rounded-bl-xl text-black flex justify-center items-center"
                                    onClick={handleShowMore}
                                >
                                    Show more
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 mt-2">No users found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SideBar;

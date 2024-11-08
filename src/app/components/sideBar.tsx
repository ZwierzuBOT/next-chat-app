'use client';
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useUser } from '@clerk/nextjs';

type User = {
    id: string;
    name: string;
    surname: string;
};

type SideBarProps = {
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    userTypedTo: User | null;
    setUserTypedTo: (user: User | null) => void;
};

const SideBar = ({ selectedUser, setSelectedUser, userTypedTo, setUserTypedTo }: SideBarProps) => {
    const { user } = useUser();
    const currentUserId = user ? user.id : null;
    const [focused, setFocus] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [resultsLimit, setResultsLimit] = useState(5);
    const [totalMatchingUsers, setTotalMatchingUsers] = useState(0);
    const [chatHistory, setChatHistory] = useState<User[]>([]);
    const [typingToUser, setTypingToUser] = useState<User | null>(null);
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

            setTotalMatchingUsers(results.length);
            setSearchResults(results.slice(0, resultsLimit));
        };

        const debounceFetch = setTimeout(() => {
            if (searchTerm) {
                fetchUsers();
            } else {
                setSearchResults([]);
                setTotalMatchingUsers(0);
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

    const handleUserSelect = async (user: User) => {
        setSelectedUser(user);
        setFocus(false);
        setSearchTerm("");
        setTypingToUser(user);
        
        if (!currentUserId) return;
    
        const userDocRef = doc(firestore, 'chatHistory', currentUserId);
    
        const userDoc = await getDoc(userDocRef);
    
        let updatedChatHistory: User[] = [];
    
        if (userDoc.exists()) {
            updatedChatHistory = userDoc.data()?.history || [];
        } else {
            updatedChatHistory = [];
        }
    
        if (!updatedChatHistory.some(existingUser => existingUser.id === user.id)) {
            updatedChatHistory.unshift(user);
    
 
            await setDoc(userDocRef, {
                history: updatedChatHistory
            }, { merge: true });
    
            setChatHistory(updatedChatHistory);
        }
    };
    

    useEffect(() => {
        if (!currentUserId) return;

        const fetchChatHistory = async () => {
            const userDocRef = doc(firestore, 'chatHistory', currentUserId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setChatHistory(userDoc.data()?.history || []);
            }
        };

        fetchChatHistory();
    }, [currentUserId]);

    useEffect(() => {
        if (!focused) {
            setResultsLimit(5);
        }
    }, [focused]);

    useEffect(() => {
        if (userTypedTo) {
            const updatedChatHistory = chatHistory.filter((user) => user.id !== userTypedTo.id);
            updatedChatHistory.unshift(userTypedTo); 
            setChatHistory(updatedChatHistory); 
            console.log(userTypedTo)
        }
    }, [userTypedTo]);

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

            {focused ? (
                <div className="w-full h-[90%] bg-transparent flex flex-col items-center justify-start">
                    {searchResults.length > 0 ? (
                        <>
                            <ul className="w-full bg-transparent border-r-2 border-t-2 border-l-2">
                                {searchResults.map((user) => {
                                    return (
                                        <li
                                            key={user.id}
                                            className={`p-2 cursor-pointer text-black flex justify-between w-full hover:bg-gray-300`}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <span>{user.name} {user.surname}</span>
                                        </li>
                                    );
                                })}
                            </ul>

                            {totalMatchingUsers > resultsLimit && (
                                <button
                                    ref={showMoreButtonRef}
                                    onClick={handleShowMore}
                                    className="text-blue-600 w-full py-2 hover:bg-gray-200"
                                >
                                    Show more
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500">No matching users</p>
                    )}
                </div>
            ) : (
                <div className="w-full h-[90%] overflow-y-auto bg-transparent">
                    <ul>
                        {chatHistory.map((user) => {
                            const isActiveUser = selectedUser && selectedUser.id === user.id;
                            const isTypingTo = typingToUser && typingToUser.id === user.id;

                            return (
                                <li
                                    key={user.id}
                                    className={`p-2 cursor-pointer text-black flex justify-between w-full ${isTypingTo ? 'bg-blue-300' : isActiveUser ? 'bg-blue-300' : 'hover:bg-gray-300'}`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <span>{user.name} {user.surname}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SideBar;

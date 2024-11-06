'use client';
import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

type SelectedUser = {
  id: string;
  name: string;
  surname: string;
};

type ChatProps = {
  selectedUser: SelectedUser | null;
  setSelectedUser: (user: SelectedUser | null) => void;
};

const Chat = ({ selectedUser, setSelectedUser }: ChatProps) => {
  const { user } = useUser();
  const currentUserId = user ? user.id : null;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (currentUserId && selectedUser && selectedUser.id) {
      const fetchMessages = async () => {
        const messagesRef = collection(firestore, "chats");
        const q = query(
          messagesRef,
          where("senderId", "in", [currentUserId, selectedUser.id]),
          where("receiverId", "in", [currentUserId, selectedUser.id]),
          orderBy("timestamp", "asc")
        );
  
        const querySnapshot = await getDocs(q);
        const fetchedMessages = querySnapshot.docs.map((doc) => doc.data());
        setMessages(fetchedMessages);
      };
  
      fetchMessages();
    }
  }, [currentUserId, selectedUser]);

  const handleSendMessage = async () => {
    if (currentUserId && selectedUser && newMessage.trim()) {
      await addDoc(collection(firestore, "chats"), {
        senderId: currentUserId,
        receiverId: selectedUser.id,
        message: newMessage,
        timestamp: Timestamp.now(),
      });

      setMessages([...messages, { senderId: currentUserId, message: newMessage, timestamp: Timestamp.now() }]);
      setNewMessage("");
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim()) {
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between text-black">
      {selectedUser && (
        <div className="chat-header text-xl font-semibold mb-4 text-black w-full h-[10%] " >
          Chatting with {selectedUser.name} {selectedUser.surname}
        </div>
      )}
      <div className="chat-messages flex overflow-y-scroll flex-start flex-col h-[90%] w-full overflow-x-hidden">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.senderId === currentUserId ? "sent bg-blue-500 text-white" : "received bg-gray-200 self-end mr-1 text-black"} break-words text-2xl p-2  rounded-xl mt-1 w-fit`}>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input flex mt-2">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown} 
        />
        <button className="p-2 bg-blue-500 text-white rounded-r" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

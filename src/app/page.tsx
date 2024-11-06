'use client';
import UserSync from "./components/userSync";
import SideBar from "./components/sideBar";
import Chat from "./components/chat";
import { useState } from "react";

type SelectedUser = {
  id: string;
  name: string;
  surname: string;
};

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  return (
    <div className="w-screen h-screen flex">
      <UserSync />

      <SideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

      <div className="w-3/4 h-screen">
        {selectedUser ? (
          <Chat selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full w-3/4 text-gray-500">
            <p>Select a user to start chatting</p>
          </div>
        )}

      </div>
    </div>
  );
}

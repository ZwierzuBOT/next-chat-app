
import UserSync from "./components/userSync";
import SideBar from "./components/sideBar";
export default function Home() {
  return (
    <div className="w-screen h-screen">
      <UserSync />
      <SideBar/>
      <h1 className="text-black">Chat</h1>
    </div>
  );
}

import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";
import { signOutAction } from "../actions/auth";
import { LogOut } from "lucide-react";

const ChatPage = ({ sessionId }: { sessionId: string}) => {
  return (
    <main className="h-screen w-screen flex-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col h-[90%] w-[90%]">
        <div className="flex justify-between p-3">
          <p className="nav-text">
            {sessionId}
          </p>
          <form className="nav-text flex-center gap-2" action={signOutAction}>
            <button type="submit" className="cursor-pointer">
              Sign Out
            </button>

            <LogOut className="w-5 h-5" />
          </form>
        </div>

        <div className="w-full h-full flex ring-white/20 ring-2 rounded-3xl p-2">
          <Sidebar />
          <Chat />
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
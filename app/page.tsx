import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";


export default function Home() {
  return (
    <main className="h-screen w-screen flex-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex h-[90%] w-[90%] ring-white/20 ring-2 rounded-3xl p-2">
        <Sidebar />
        <Chat />
      </div>
    </main>
  );
}

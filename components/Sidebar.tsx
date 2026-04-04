
const Sidebar = () => {
  return (
    <div className="flex-1 bg-white/10 rounded-3xl p-2 flex flex-col gap-4">
      <div className="h-full flex-center">
        <p className="text-white/20 text-center">You have no chats at the moment</p>
      </div>

      <div className="bg-white text-black/80 rounded-2xl p-4 flex-center cursor-pointer
        hover:bg-white/70 transition-all duration-300">
        <p className="text-lg font-bold">Start a new chat</p>
      </div>
    </div>
  );
};

export default Sidebar;
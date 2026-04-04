
const Chat = () => {
  return (
    <div className="flex-2 p-2 flex flex-col gap-4">
      <div className="h-full flex-center">
        <p className="text-white/20 text-center">Chat goes here</p>
      </div>

      <div className="bg-white/10 text-black/80 rounded-3xl pl-6 py-3 pr-3 flex gap-2">
        <input
          className="w-full outline-0 text-white/90"
          placeholder="Write a message..."
          type="text" />
        <div className="bg-white/20 w-10 h-9 rounded-full"></div>
      </div>
    </div>
  );
};

export default Chat;
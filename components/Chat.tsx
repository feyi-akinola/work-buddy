import { Mic, Send } from "lucide-react";
import ChatButton from "./ChatButton";
import { ReactElement } from "react";
import ChatBubble from "./ChatBubble";

const icons: Record<string, ReactElement> = {
  mic: <Mic className="text-white/70 w-5 h-5"/>,
  send: <Send className="text-white/70 w-5 h-5"/>
};

const Chat = () => {
  return (
    <div className="flex-2 p-2 flex flex-col gap-4">
      {/* <div className="h-full flex-center"> */}
      <div className="h-full flex flex-col gap-4 justify-end p-1">
        {/* <p className="text-white/20 text-center">Chat goes here</p> */}
        <ChatBubble
          message="Hi, this is the first message"
          created_at="20 mins ago"
          type="text"
          isSent={true}
        />
        <ChatBubble
          message="Hello, this is the second message"
          created_at="10 mins ago"
          type="text"
          isSent={false}
        />
      </div>

      <div className="bg-white/10 text-black/80 rounded-3xl pl-6 py-2 pr-3 flex gap-2">
        <input
          className="w-full outline-0 text-white/90"
          placeholder="Write a message..."
          type="text" />
        <ChatButton icon={icons.mic} />
        <ChatButton icon={icons.send} />
      </div>
    </div>
  );
};

export default Chat;
type ChatBubbleProps = {
  created_at: string;
  message: string;
  type: "text" | "voice";
  isSent: boolean;
}

const ChatBubble = ({ created_at, message, type, isSent } : ChatBubbleProps) => {
  const alignment: string = isSent ? "end" : "start";
  const bgColor: string = isSent ? "#FFFFFF" : "#bff5ff";

  return (
    <div
      style={{
        alignSelf: alignment,
        alignItems:  alignment,
      }}
      className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-zinc-700">
        {created_at}
      </p>
      <div
        style={{
          backgroundColor: bgColor,
        }}
        className="bg-white/80 text-black/80 rounded-2xl px-6 py-3 flex gap-2">
        <p className="text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
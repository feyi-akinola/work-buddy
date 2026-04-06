import { timeAgo } from "@/lib/time";
import { Message } from "@/types/types";
import { BeatLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";

type ChatBubbleProps = {
  message: Message & { sending?: boolean };
  isSent: boolean;
}

const ChatBubble = ({ message, isSent } : ChatBubbleProps) => {
  const alignment: string = isSent ? "end" : "start";
  const isAiMessage = message.role === 2;
  const bgColor: string = isSent ? "#FFFFFF" : isAiMessage ? "#dff7ff" : "#bff5ff";

  const { created_at, content, sending } = message; 

  return (
    <div
      style={{
        alignSelf: alignment,
        alignItems:  alignment,
      }}
      className="flex flex-col gap-1"
    >
      { 
        sending
          ? <BeatLoader size={8} color="#CFCFCF"/>
          : (
              <p className="text-xs font-semibold text-zinc-700">
                {timeAgo(created_at)}
              </p>
            )
      }

      <div
        style={{
          backgroundColor: bgColor,
        }}
        className="bg-white/80 text-black/80 rounded-2xl px-6 py-3 flex gap-2">
        {isAiMessage ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center bg-black/20 rounded-full p-2 gap-2">
              <Bot />
              <p className="font-semibold">Assistant</p>
            </div>

            <div className="text-sm font-medium w-full max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="my-1 whitespace-pre-wrap leading-6">{children}</p>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
                  li: ({ children }) => <li className="my-1">{children}</li>,
                  code: ({ className, children, ...props }: any) => {
                    const language = className?.replace("language-", "") || "";
                    const codeText = String(children ?? "");
                    const isBlock = Boolean(language) || codeText.includes("\n");

                    if (!isBlock) {
                      return (
                        <code
                          className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-black/10 text-black/90"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="my-2 rounded-lg overflow-hidden bg-zinc-950 text-zinc-100">
                        {language && (
                          <div className="text-[11px] uppercase tracking-wide px-3 py-1 bg-zinc-800/90 text-zinc-300">
                            {language}
                          </div>
                        )}
                        <pre className="overflow-x-auto p-3 text-[13px] leading-5">
                          <code className="font-mono" {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                }}
              >
                {content || "..."}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium w-full whitespace-pre-wrap">
            {content}
          </p>
        )}

      </div>
    </div>
  );
};

export default ChatBubble;
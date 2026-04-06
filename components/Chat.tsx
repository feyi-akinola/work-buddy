"use client";
import { Mic, Send, Square } from "lucide-react";
import ChatButton from "./ChatButton";
import { useMemo, Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import ChatBubble from "./ChatBubble";
import { Message, TempMessage } from "@/types/types";
import { BeatLoader, PuffLoader } from "react-spinners";
import { RealtimeChannel } from "@supabase/supabase-js";

const icons: Record<string, ReactElement> = {
  mic: <Mic className="text-white/70 w-5 h-5"/>,
  micRecording: <Square className="text-red-400 w-5 h-5"/>,
  send: <Send className="text-white/70 w-5 h-5"/>
};

type ChatProps = {
  selectedRoom: string | undefined;
  setSelectedRoom: Dispatch<SetStateAction<string | undefined>>;
  userId: string;
  userName: string;
}

type TypingPresence = {
  user?: string;
  typing?: boolean;
  ts?: number;
};

const useSessionId = () => useMemo(() => crypto.randomUUID(), []);
const AI_COMMAND_REGEX = /^@ai\b/i;

const Chat = ({ selectedRoom, setSelectedRoom, userId, userName } : ChatProps) => {
  const PAGE_SIZE = 20;
  const TYPING_IDLE_MS = 3000;
  const TYPING_STALE_MS = 5000;
  const POST_MESSAGE_TYPING_SUPPRESS_MS = 1200;

  const sessionId = useSessionId();
  const presenceKey = `${userId}:${sessionId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const prevHeightRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastTypingTrackRef = useRef(0);
  const suppressOtherTypingUntilRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- HELPERS ---

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (channelRef.current) {
        channelRef.current.track({
          user: userId,
          sessionId,
          typing: false,
          ts: Date.now(),
        });
      }
    }
  }, [sessionId, userId]);

  const syncOtherTypingFromPresence = useCallback(() => {
    if (!channelRef.current) return;

    const state = channelRef.current.presenceState();
    const now = Date.now();
    if (now < suppressOtherTypingUntilRef.current) {
      setIsOtherTyping(false);
      return;
    }

    const anyoneElseTyping = Object.entries(state).some(([key, presenceList]) => {
      if (key === presenceKey) return false;

      return (presenceList as TypingPresence[]).some((p) => {
        const ts = typeof p.ts === "number" ? p.ts : 0;
        const isFresh = now - ts <= TYPING_STALE_MS;
        return p.user !== userId && p.typing === true && isFresh;
      });
    });

    setIsOtherTyping(anyoneElseTyping);
  }, [presenceKey, userId, TYPING_STALE_MS]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!channelRef.current) return;

    if (value.trim().length > 0) {
      isTypingRef.current = true;

      // Broadcast periodically while typing so remote clients can expire stale states.
      const now = Date.now();
      if (now - lastTypingTrackRef.current > 800) {
        channelRef.current.track({
          user: userId,
          sessionId,
          typing: true,
          ts: now
        });
        lastTypingTrackRef.current = now;
      }

      // Refresh the 5s "Inactivity" timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
    } else {
      // Manual clear (backspace) stops typing immediately
      stopTyping();
    }
  };

  const fetchMessages = useCallback(async (pageNumber: number) => {
    if (!selectedRoom) return;
    setLoading(true);

    try {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data } = await supabase
        .from("message")
        .select("*")
        .eq("room_id", selectedRoom)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (data) {
        const reversed = [...data].reverse();
        setMessages(prev => pageNumber === 0 ? reversed : [...reversed, ...prev]);

        if (pageNumber === 0) {
          setTimeout(() => scrollToBottom("auto"), 50);
        } else {
          requestAnimationFrame(() => {
            const el = containerRef.current;
            if (el) el.scrollTop = el.scrollHeight - prevHeightRef.current;
          });
        }
        if (data.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, scrollToBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop === 0) {
      prevHeightRef.current = el.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const blobToDataUrl = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const sendVoiceMessage = useCallback(async (audioDataUrl: string) => {
    if (!selectedRoom) return;

    const tempId = `voice-temp-${crypto.randomUUID()}`;
    const optimisticVoiceMessage: TempMessage = {
      id: tempId,
      content: audioDataUrl,
      created_at: new Date().toISOString(),
      sender_id: userId,
      role: 1,
      room_id: selectedRoom,
      message_type: 2,
      sending: true,
    };
    setMessages(prev => [...prev, optimisticVoiceMessage]);

    const { data } = await supabase
      .from("message")
      .insert({
        room_id: selectedRoom,
        content: audioDataUrl,
        sender_id: userId,
        role: 1,
        message_type: 2,
      })
      .select()
      .single();

    if (data) {
      setMessages(prev => prev.map(msg => (msg.id === tempId ? data : msg)));
    } else {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  }, [selectedRoom, userId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      stopTyping();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
          if (audioBlob.size === 0) return;
          const audioDataUrl = await blobToDataUrl(audioBlob);
          await sendVoiceMessage(audioDataUrl);
        } catch (error) {
          console.error("Failed to send voice message", error);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access failed", error);
      setIsRecording(false);
    }
  }, [blobToDataUrl, isRecording, sendVoiceMessage, stopRecording, stopTyping]);

  const buildAiHistory = useCallback(
    (latestUserInput: string) => {
      const recent = [...messages, {
        id: "pending-user-message",
        content: latestUserInput,
        created_at: new Date().toISOString(),
        sender_id: userId,
        room_id: selectedRoom ?? "",
        message_type: 1 as const,
        role: 1 as const,
      }]
        .filter((msg) => msg.message_type === 1)
        .filter((msg) => !("sending" in msg && msg.sending))
        .slice(-10);

      return recent.map((msg) => ({
        role: msg.role === 2 ? "assistant" : "user",
        content: msg.content,
      }));
    },
    [messages, selectedRoom, userId]
  );

  const sendMessage = async () => {
    if (!input.trim() || !selectedRoom) return;
    
    const content = input.trim();
    const isAiCommand = AI_COMMAND_REGEX.test(content);
    const aiPrompt = content.replace(AI_COMMAND_REGEX, "").trim();
    if (isAiCommand && !aiPrompt) return;
    setInput("");

    // --- CRITICAL FIX: Tell everyone I stopped typing FIRST ---
    stopTyping(); 

    const tempId = crypto.randomUUID();
    const optimisticMessage: TempMessage = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      sender_id: userId,
      role: 1,
      room_id: selectedRoom,
      message_type: 1,
      sending: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    const { data } = await supabase
      .from("message")
      .insert({
        room_id: selectedRoom,
        content,
        sender_id: userId,
        role: 1,
        message_type: 1
      })
      .select()
      .single();

    if (data) {
      setMessages(prev => prev.map(msg => msg.id === tempId ? data : msg));
    }

    if (isAiCommand) {
      const history = buildAiHistory(content);
      const aiTempId = `ai-temp-${crypto.randomUUID()}`;
      const aiOptimisticMessage: TempMessage = {
        id: aiTempId,
        content: "",
        created_at: new Date().toISOString(),
        sender_id: userId,
        role: 2,
        room_id: selectedRoom,
        message_type: 1,
        sending: true,
      };
      setMessages(prev => [...prev, aiOptimisticMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: aiPrompt,
            roomId: selectedRoom,
            userId,
            history,
          }),
        });

        if (!response.ok || !response.body) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiTempId
                ? {
                    ...msg,
                    content: "AI request failed. Please try again.",
                    sending: false,
                  }
                : msg
            )
          );
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiTempId
                ? { ...msg, content: accumulated, sending: false }
                : msg
            )
          );
        }

        const finalChunk = decoder.decode();
        if (finalChunk) {
          accumulated += finalChunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiTempId
                ? { ...msg, content: accumulated, sending: false }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("Failed to trigger AI response", error);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiTempId
              ? {
                  ...msg,
                  content: "AI request failed. Please try again.",
                  sending: false,
                }
              : msg
          )
        );
      }
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedRoom(undefined); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setSelectedRoom]);

  // Fetch Logic
  useEffect(() => {
    if (!selectedRoom) {
      setIsOtherTyping(false);
      return;
    }
    setMessages([]);
    setPage(0);
    setHasMore(true);
    setIsOtherTyping(false);
    fetchMessages(0);
  }, [selectedRoom, fetchMessages]);

  // Realtime Logic
  useEffect(() => {
    if (!selectedRoom) return;

    const channel = supabase.channel(`room:${selectedRoom}`, {
      config: { presence: { key: presenceKey } } // Bind presence to the specific userId
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'message', filter: `room_id=eq.${selectedRoom}` }, 
        (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage.sender_id !== userId) {
            suppressOtherTypingUntilRef.current = Date.now() + POST_MESSAGE_TYPING_SUPPRESS_MS;
            setIsOtherTyping(false); // 🔥 immediate clear
          }

          setMessages((current) => {
            if (current.some(msg => msg.id === newMessage.id)) return current;

            const aiTempIndex = current.findIndex(
              msg =>
                String(msg.id).startsWith("ai-temp-") &&
                msg.role === 2 &&
                msg.sender_id === newMessage.sender_id &&
                msg.room_id === newMessage.room_id
            );
            if (newMessage.role === 2 && aiTempIndex !== -1) {
              const next = [...current];
              next[aiTempIndex] = newMessage;
              return next;
            }

            if (newMessage.sender_id === userId && newMessage.role !== 2) return current;
            return [...current, newMessage];
          });
        }
      )
      .on('presence', { event: '*' }, () => {
        syncOtherTypingFromPresence();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Ensure we do not leave stale typing=true when joining/rejoining.
          channel.track({
            user: userId,
            sessionId,
            typing: false,
            ts: Date.now(),
          });
        }
      });

    return () => {
      stopTyping();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedRoom, userId, presenceKey, sessionId, stopTyping, syncOtherTypingFromPresence, POST_MESSAGE_TYPING_SUPPRESS_MS]);

  // Sticky Scroll
  useEffect(() => {
    if (!loading && page === 0) {
      scrollToBottom("smooth");
    }
  }, [messages, isOtherTyping, loading, page, scrollToBottom]);

  useEffect(() => {
    const nonAiSenderIds = Array.from(
      new Set(
        messages
          .filter(msg => msg.role !== 2)
          .map(msg => msg.sender_id)
          .filter(Boolean)
      )
    );
    const missingIds = nonAiSenderIds.filter(
      id => id !== userId && !senderNames[id]
    );
    if (missingIds.length === 0) return;

    let cancelled = false;
    const loadNames = async () => {
      const { data } = await supabase
        .from("user")
        .select("id,name")
        .in("id", missingIds);

      if (cancelled || !data) return;
      setSenderNames(prev => {
        const next = { ...prev };
        data.forEach((u: { id: string; name: string }) => {
          next[u.id] = u.name;
        });
        return next;
      });
    };

    loadNames();
    return () => {
      cancelled = true;
    };
  }, [messages, senderNames, userId]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className="flex-2 min-h-0 p-2 flex flex-col gap-4">
      {loading && page === 0 ? (
        <div className="h-full flex-center">
          <PuffLoader color="#CFCFCF" loading={loading}/>
        </div>
      ) : !selectedRoom ? (
        <div className="h-full flex-center">
          <p className="text-white/20 text-center">Chat goes here</p>
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto flex flex-col p-1 scrollbar-hidden"
          >
            <div className="flex-1" /> 
            <div className="flex flex-col gap-6">
              {messages.map((message) => (
                <ChatBubble 
                  key={message.id} 
                  message={message} 
                  isSent={message.sender_id === userId && message.role !== 2}
                  senderName={
                    message.role === 2
                      ? undefined
                      : message.sender_id === userId
                        ? userName
                        : senderNames[message.sender_id] ?? "Teammate"
                  }
                />
              ))}
            </div>
            
            {/* OTHER PERSON IS TYPING BUBBLE */}
            {isOtherTyping && (
              <div className="p-2 self-start bg-white/5 rounded-full px-4 mt-2">
                <BeatLoader size={5} color="#CFCFCF" />
              </div>
            )}
          </div>

          <div className="mt-4 bg-white/10 rounded-3xl pl-6 py-2 pr-3 flex gap-2 shrink-0">
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="w-full outline-0 text-white/90 bg-transparent"
              placeholder="Write a message..."
            />
            <ChatButton icon={isRecording ? icons.micRecording : icons.mic} onClick={handleMicClick} />
            <ChatButton icon={icons.send} onClick={sendMessage}/>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
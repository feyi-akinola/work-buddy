import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { prompt, roomId, history, userId } = await req.json();
    const trimmedPrompt = String(prompt ?? "").trim();
    const trimmedRoomId = String(roomId ?? "").trim();
    const trimmedUserId = String(userId ?? "").trim();

    if (!trimmedPrompt || !trimmedRoomId || !trimmedUserId) {
      return NextResponse.json(
        { error: "prompt, roomId, and userId are required" },
        { status: 400 }
      );
    }

    const safeHistory = Array.isArray(history) ? history.slice(-10) : [];

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "You are an expert team assistant. Use the provided conversation history for context. Be concise and professional.",
      messages: [
        ...safeHistory,
        { role: "user", content: trimmedPrompt },
      ],
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          const reply = fullText.trim();
          if (reply) {
            await supabaseAdmin.from("message").insert({
              room_id: trimmedRoomId,
              content: reply,
              sender_id: trimmedUserId,
              role: 2,
              message_type: 1,
            });
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
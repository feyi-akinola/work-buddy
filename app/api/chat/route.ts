import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are an expert AI assistant in a team workspace. Be concise.',
    messages,
  });

  return result.toTextStreamResponse();
}
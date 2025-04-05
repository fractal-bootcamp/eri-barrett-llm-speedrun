// src/app/api/chat/[chatId]/route.ts
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    const { chatId } = params;
    const { messages } = await req.json();

    console.log(`Processing request for chat: ${chatId}`);

    // You can use chatId to fetch/store context from your database

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}
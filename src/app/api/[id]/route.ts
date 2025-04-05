// src/app/api/[id]/route.ts
import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Anthropic client if API key is available
let anthropic: Anthropic | undefined;
if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const { messages, config } = await req.json();

    console.log(`Processing request for terminal: ${id}`);

    try {
        if (config?.provider === 'anthropic') {
            if (!anthropic) {
                return new Response(
                    JSON.stringify({ error: 'Anthropic API key not configured' }),
                    { status: 500 }
                );
            }

            const response = await anthropic.messages.create({
                model: config?.model || 'claude-3-opus-20240229',
                messages: messages,
                max_tokens: config?.max_tokens || 1000,
                temperature: config?.temperature || 0.7,
                stream: true,
            });

            // Create a manual stream
            return new Response(
                new ReadableStream({
                    async start(controller) {
                        for await (const chunk of response) {
                            if (chunk.type === 'content_block_delta' &&
                                'delta' in chunk &&
                                chunk.delta &&
                                'text' in chunk.delta &&
                                typeof chunk.delta.text === 'string') {
                                controller.enqueue(new TextEncoder().encode(chunk.delta.text));
                            }
                        }
                        controller.close();
                    }
                })
            );
        } else {
            // Default to OpenAI
            const response = await openai.chat.completions.create({
                model: config?.model || 'gpt-4o',
                messages,
                temperature: config?.temperature || 0.7,
                max_tokens: config?.max_tokens || 1000,
                stream: true,
            });

            // Create a manual stream for OpenAI
            return new Response(
                new ReadableStream({
                    async start(controller) {
                        for await (const chunk of response) {
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(new TextEncoder().encode(content));
                            }
                        }
                        controller.close();
                    }
                })
            );
        }
    } catch (error) {
        console.error('Error generating response:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500 }
        );
    }
}
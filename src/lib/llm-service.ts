import { TerminalLLM, TerminalMessage } from '../types/terminal-types';

// Define response types for streaming
export type LLMResponse = {
    content: string;
    isComplete: boolean;
    id?: string;
};

// Interface for handling different LLM providers
export interface LLMProvider {
    generateCompletion(
        prompt: string,
        messages: TerminalMessage[],
        systemPrompt: string,
        config: TerminalLLM,
        onToken: (token: string) => void,
        onComplete: (response: LLMResponse) => void,
        onError: (error: Error) => void
    ): Promise<void>;
}

// OpenAI provider implementation
export class OpenAIProvider implements LLMProvider {
    async generateCompletion(
        prompt: string,
        messages: TerminalMessage[],
        systemPrompt: string,
        config: TerminalLLM,
        onToken: (token: string) => void,
        onComplete: (response: LLMResponse) => void,
        onError: (error: Error) => void
    ): Promise<void> {
        try {
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: prompt }
            ];

            // Create the API URL with the chat ID
            const response = await fetch(`/api/${config.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    config: {
                        model: config.model,
                        temperature: config.temperature,
                        max_tokens: config.maxTokens,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            // Set up streaming response handling
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete({
                        content: fullResponse,
                        isComplete: true,
                        id: crypto.randomUUID()
                    });
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                onToken(chunk);
            }
        } catch (error) {
            onError(error instanceof Error ? error : new Error('Unknown error'));
        }
    }
}

// Anthropic provider implementation
export class AnthropicProvider implements LLMProvider {
    async generateCompletion(
        prompt: string,
        messages: TerminalMessage[],
        systemPrompt: string,
        config: TerminalLLM,
        onToken: (token: string) => void,
        onComplete: (response: LLMResponse) => void,
        onError: (error: Error) => void
    ): Promise<void> {
        try {
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: prompt }
            ];

            // Anthropic API call via our backend proxy
            const response = await fetch(`/api/${config.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    config: {
                        model: config.model,
                        temperature: config.temperature,
                        max_tokens: config.maxTokens,
                        provider: 'anthropic'
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            // Set up streaming response handling
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete({
                        content: fullResponse,
                        isComplete: true,
                        id: crypto.randomUUID()
                    });
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                onToken(chunk);
            }
        } catch (error) {
            onError(error instanceof Error ? error : new Error('Unknown error'));
        }
    }
}

// Factory function to get the appropriate provider
export function getLLMProvider(config: TerminalLLM): LLMProvider {
    switch (config.provider) {
        case 'openai':
            return new OpenAIProvider();
        case 'anthropic':
            return new AnthropicProvider();
        default:
            throw new Error(`Unsupported provider: ${config.provider}`);
    }
}

// Main service function
export async function generateLLMResponse(
    prompt: string,
    messages: TerminalMessage[],
    systemPrompt: string,
    config: TerminalLLM,
    onToken: (token: string) => void,
    onComplete: (response: LLMResponse) => void,
    onError: (error: Error) => void
): Promise<void> {
    const provider = getLLMProvider(config);
    return provider.generateCompletion(
        prompt,
        messages,
        systemPrompt,
        config,
        onToken,
        onComplete,
        onError
    );
} 
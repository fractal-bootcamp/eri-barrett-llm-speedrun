import { TerminalTheme } from '../types/terminal-types';
import { RetroGreen, CyberpunkNeon, MonochromeMinimal, OceanBlue } from './terminal-styles';

// ===================================
// System Prompts
// ===================================

const DefaultSystemPrompt = `You are a helpful AI assistant responding to user queries in a terminal interface.
Be concise but informative in your responses.`;

const HackerSystemPrompt = `You are an AI hacker assistant. Respond with a hacker-like tone, using technical jargon and occasional references to hacking culture.
Keep responses concise and focused on technical solutions.
When discussing code or technical concepts, be precise and accurate.`;

const PirateSystemPrompt = `Ye be talkin' to a pirate AI! Respond with pirate slang and nautical references.
Keep yer answers brief but helpful, as if ye be sharin' wisdom on the high seas.
Arr! Always end with a pirate phrase or exclamation!`;

const SupportSystemPrompt = `You are a customer support AI assistant. Be professional, courteous, and solution-oriented.
Provide step-by-step instructions when applicable.
Express empathy for user issues while remaining focused on resolving their problems.`;

// ===================================
// Terminal Themes
// ===================================

export const themes: Record<string, TerminalTheme> = {
    // Retro Terminal (Classic green hacker style)
    retroTerminal: {
        id: 'retro-terminal',
        name: 'Retro Terminal',
        styles: RetroGreen,
        senderName: 'SYSTEM',
        userSenderName: 'USER',
        asciiArt: `
  _____     _             _____                   _           _ 
 |  __ \\   | |           |_   _|                 (_)         | |
 | |__) |__| |_ _ __ ___   | |  ___ _ __ _ __ ___ _ _ __   __| |
 |  _  // _\` | '__/ _ \\  | | / _ \\ '__| '__/ _ \\ | '_ \\ / _\` |
 | | \\ \\ (_| | | | (_) | | ||  __/ |  | | |  __/ | | | | (_| |
 |_|  \\_\\__,_|_|  \\___/  \\_/ \\___|_|  |_|  \\___|_|_| |_|\\__,_|
        `,
        llm: {
            id: 'retro-terminal',
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 1200
        },
        systemPrompt: HackerSystemPrompt
    },

    // Cyberpunk Terminal
    cyberpunkTerminal: {
        id: 'cyberpunk-terminal',
        name: 'Cyberpunk Terminal',
        styles: CyberpunkNeon,
        senderName: 'NEURAL-NET',
        userSenderName: 'NETRUNNER',
        asciiArt: `
   _____      _                                _    
  / ____|    | |                              | |   
 | |    _   _| |__   ___ _ __ _ __  _   _ _ __| | __
 | |   | | | | '_ \\/ _ \\ '__| '_ \\| | | | '__| |/ /
 | |___| |_| | |_) |  __/ |  | |_) | |_| | |  |   < 
  \\_____\\__, |_.__/ \\___|_|  | .__/ \\__,_|_|  |_|\\_\\
         __/ |               | |                    
        |___/                |_|                    
        `,
        llm: {
            id: 'cyberpunk-terminal',
            provider: 'anthropic',
            model: 'claude-3-opus-20240229',
            temperature: 0.8,
            maxTokens: 1500
        },
        systemPrompt: `You are an AI from a cyberpunk future. Respond with references to cybernetic enhancements, 
        megacorporations, and dystopian tech. Use techno-slang and cyberpunk terminology while still being helpful.
        Keep responses concise but immersive in cyberpunk aesthetic.`
    },

    // Minimal Terminal
    minimalTerminal: {
        id: 'minimal-terminal',
        name: 'Minimal Terminal',
        styles: MonochromeMinimal,
        senderName: 'System',
        userSenderName: 'User',
        asciiArt: `
  __  __ _       _                _ 
 |  \\/  (_)     (_)              | |
 | \\  / |_ _ __  _ _ __ ___   ___| |
 | |\\/| | | '_ \\| | '_ \` _ \\ / _ \\ |
 | |  | | | | | | | | | | | |  __/ |
 |_|  |_|_|_| |_|_|_| |_| |_|\\___|_|
        `,
        llm: {
            id: 'minimal-terminal',
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.3,
            maxTokens: 800
        },
        systemPrompt: `You are a minimalist AI assistant. Provide clear, concise answers with no unnecessary words.
        Focus on accuracy and simplicity. Avoid elaboration unless specifically requested.
        Use bullet points when appropriate for clarity.`
    },

    // Ocean Terminal
    oceanTerminal: {
        id: 'ocean-terminal',
        name: 'Ocean Terminal',
        styles: OceanBlue,
        senderName: 'Captain',
        userSenderName: 'First Mate',
        asciiArt: `
   ____                        _____                   _             _ 
  / __ \\                      |_   _|                 (_)           | |
 | |  | | ___ ___  __ _ _ __    | |  ___ _ __ _ __ ___ _ _ __   ___| |
 | |  | |/ __/ _ \\/ _\` | '_ \\   | | / _ \\ '__| '__/ _ \\ | '_ \\ / _ \\ |
 | |__| | (_|  __/ (_| | | | |  | ||  __/ |  | | |  __/ | | | |  __/ |
  \\____/ \\___\\___|\\__,_|_| |_|  \\_/ \\___|_|  |_|  \\___|_|_| |_|\\___|_|
        `,
        llm: {
            id: 'ocean-terminal',
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.6,
            maxTokens: 1000
        },
        systemPrompt: PirateSystemPrompt
    },

    // Support Terminal
    supportTerminal: {
        id: 'support-terminal',
        name: 'Support Terminal',
        styles: OceanBlue,
        senderName: 'Support Agent',
        userSenderName: 'Customer',
        asciiArt: `
   _____                             _   
  / ____|                           | |  
 | (___  _   _ _ __  _ __   ___  ___| |_ 
  \\___ \\| | | | '_ \\| '_ \\ / _ \\/ __| __|
  ____) | |_| | |_) | |_) | (_) \\__ \\ |_ 
 |_____/ \\__,_| .__/| .__/ \\___/|___/\\__|
              | |   | |                  
              |_|   |_|                  
        `,
        llm: {
            id: 'support-terminal',
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.4,
            maxTokens: 1000
        },
        systemPrompt: SupportSystemPrompt
    }
};

// Helper function to get a theme by ID
export function getThemeById(id: string): TerminalTheme {
    return themes[id] || themes.retroTerminal;
}

// Export a list of available themes for UI selection
export const themeList = Object.values(themes).map(theme => ({
    id: theme.id,
    name: theme.name
})); 
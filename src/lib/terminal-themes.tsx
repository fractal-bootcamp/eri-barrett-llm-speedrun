import { TerminalTheme } from '../types/terminal-types';
import { RetroGreen, CyberpunkNeon, MonochromeMinimal, OceanBlue, RetroBeige } from './terminal-styles';

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
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗   ║
  ║   ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗  ║
  ║      ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║  ║
  ║      ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║  ║
  ║      ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║  ║
  ║      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝  ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `,
        llm: {
            id: 'retro-terminal',
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 500
        },
        systemPrompt: `You are TERMINAL, a retro-style AI assistant that responds in a terse, technical manner.
        - Keep responses brief and to the point
        - Use occasional command-line style formatting
        - Add relevant technical details when appropriate
        - Respond with a slightly digital, technical personality`
    },

    // Cyberpunk Terminal
    cyberpunkTerminal: {
        id: 'cyberpunk-terminal',
        name: 'Cyberpunk Terminal',
        styles: CyberpunkNeon,
        senderName: 'NEURAL-NET',
        userSenderName: 'NETRUNNER',
        asciiArt: `
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   ███╗   ██╗███████╗ ██████╗ ███╗   ██╗                      ║
  ║   ████╗  ██║██╔════╝██╔═══██╗████╗  ██║                      ║
  ║   ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║                      ║
  ║   ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║                      ║
  ║   ██║ ╚████║███████╗╚██████╔╝██║ ╚████║                      ║
  ║   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝                      ║
  ║                                        NEURAL INTERFACE v2.0  ║
  ╚══════════════════════════════════════════════════════════════╝
  `,
        llm: {
            id: 'cyberpunk-terminal',
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.9,
            maxTokens: 1000
        },
        systemPrompt: `You are NEON, a cyberpunk-themed AI with an edgy, futuristic personality.
        - Use cyberpunk slang and references
        - Adopt a slightly rebellious, anti-establishment tone
        - Include references to technology, hacking, and digital systems
        - Occasionally mention megacorps and dystopian elements
        - Keep your attitude cool but helpful`
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
    },

    // Retro Beige Terminal
    retroBeigeTerminal: {
        id: 'retrobeige',
        name: 'Archive Terminal',
        styles: RetroBeige,
        senderName: 'SYSTEM',
        userSenderName: 'USER',
        asciiArt: `
   █████╗ ██████╗  ██████╗██╗  ██╗██╗██╗   ██╗███████╗
  ██╔══██╗██╔══██╗██╔════╝██║  ██║██║██║   ██║██╔════╝
  ███████║██████╔╝██║     ███████║██║██║   ██║█████╗  
  ██╔══██║██╔══██╗██║     ██╔══██║██║╚██╗ ██╔╝██╔══╝  
  ██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████╔╝ ███████╗
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
                                                     v2.3
        `,
        llm: {
            id: 'retrobeige',
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.5,
            maxTokens: 500
        },
        systemPrompt: `You are ARCHIVE, a minimalist knowledge terminal with a calm, professional demeanor.
        - Provide concise, factual responses
        - Use clear, straightforward language
        - Maintain a helpful, efficient tone
        - Focus on accuracy and clarity in all interactions`
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
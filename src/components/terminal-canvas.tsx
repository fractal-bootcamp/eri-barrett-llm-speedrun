'use client';

import { useState, useCallback } from 'react';
import { TerminalWindow } from './terminal-window';
import { TerminalTheme } from '../types/terminal-types';
import { RetroGreen } from '../lib/terminal-styles';
import { v4 as uuidv4 } from 'uuid';

interface TerminalInstance {
    id: string;
    theme: TerminalTheme;
    position: { x: number; y: number };
    zIndex: number;
    isActive: boolean;
}

export const TerminalCanvas = () => {
    const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
    const [nextZIndex, setNextZIndex] = useState(1);

    // Add a new terminal to the canvas
    const addTerminal = useCallback((theme: TerminalTheme = {
        id: 'retro-green',
        name: 'Terminal',
        styles: RetroGreen,
        senderName: 'System',
        userSenderName: 'User',
        asciiArt: '',
        llm: {
            id: 'gpt-4o',
            provider: 'openai',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 1000
        },
        systemPrompt: 'You are a helpful AI assistant.'
    }) => {
        const id = uuidv4();
        const position = {
            x: Math.random() * (window.innerWidth - 400),
            y: Math.random() * (window.innerHeight - 500)
        };

        // Deactivate all existing terminals
        setTerminals(prev => prev.map(term => ({ ...term, isActive: false })));

        // Add new terminal
        setTerminals(prev => [
            ...prev,
            {
                id,
                theme,
                position,
                zIndex: nextZIndex,
                isActive: true
            }
        ]);

        setNextZIndex(prev => prev + 1);

        return id;
    }, [nextZIndex]);

    // Handle focus on a terminal
    const handleTerminalFocus = useCallback((id: string) => {
        setTerminals(prev => prev.map(term => ({
            ...term,
            isActive: term.id === id,
            zIndex: term.id === id ? nextZIndex : term.zIndex
        })));

        setNextZIndex(prev => prev + 1);
    }, [nextZIndex]);

    // Handle close of a terminal
    const handleTerminalClose = useCallback((id: string) => {
        setTerminals(prev => prev.filter(term => term.id !== id));
    }, []);

    // Handle fullscreen change
    const handleFullscreenChange = useCallback((id: string, isFullscreen: boolean) => {
        // Nothing special needed here for now
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 1px), 
                               linear-gradient(90deg, rgba(0, 0, 0, 0.01) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}>
            <button
                className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={() => addTerminal()}
            >
                Add Terminal
            </button>

            {terminals.map((terminal) => (
                <TerminalWindow
                    key={terminal.id}
                    id={terminal.id}
                    theme={terminal.theme}
                    initialPosition={terminal.position}
                    zIndex={terminal.zIndex}
                    isActive={terminal.isActive}
                    initialMessage="Welcome to the terminal! Type a message to get started."
                    onClose={() => handleTerminalClose(terminal.id)}
                    onFullscreenChange={(isFullscreen) => handleFullscreenChange(terminal.id, isFullscreen)}
                    onFocus={() => handleTerminalFocus(terminal.id)}
                />
            ))}
        </div>
    );
};

export default TerminalCanvas;
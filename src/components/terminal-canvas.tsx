'use client';

import { useState, useCallback } from 'react';
import { TerminalWindow } from './terminal-window';
import { TerminalTheme } from '../types/terminal-types';
import { themes } from '../lib/terminal-themes';
import ThemeSelector from './theme-selector';
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
    const [selectedTheme, setSelectedTheme] = useState<TerminalTheme>(themes.retroTerminal);

    // Add a new terminal to the canvas
    const addTerminal = useCallback((theme: TerminalTheme = selectedTheme) => {
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
    }, [nextZIndex, selectedTheme]);

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

    // Handle theme selection
    const handleThemeSelection = useCallback((theme: TerminalTheme) => {
        setSelectedTheme(theme);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(0, 0, 0, 0.01) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}>
            <div className="absolute top-4 right-4 flex space-x-3">
                <ThemeSelector
                    onSelectTheme={handleThemeSelection}
                    currentThemeId={selectedTheme.id}
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => addTerminal()}
                >
                    Add Terminal
                </button>
            </div>

            {terminals.map((terminal) => (
                <TerminalWindow
                    key={terminal.id}
                    id={terminal.id}
                    theme={terminal.theme}
                    initialPosition={terminal.position}
                    zIndex={terminal.zIndex}
                    isActive={terminal.isActive}
                    initialMessage={`Welcome to the ${terminal.theme.name}! Type a message to get started.`}
                    onClose={() => handleTerminalClose(terminal.id)}
                    onFullscreenChange={(isFullscreen) => handleFullscreenChange(terminal.id, isFullscreen)}
                    onFocus={() => handleTerminalFocus(terminal.id)}
                />
            ))}

            {terminals.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-2xl mb-6">No terminals open</div>
                    <div className="text-center mb-8">
                        <p>Select a theme and click "Add Terminal" to start a conversation</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 max-w-3xl px-4">
                        {Object.values(themes).map(theme => (
                            <div
                                key={theme.id}
                                className="w-48 p-3 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => {
                                    setSelectedTheme(theme);
                                    addTerminal(theme);
                                }}
                                style={{
                                    backgroundColor: theme.styles.background,
                                    borderColor: theme.styles.border,
                                    color: theme.styles.text
                                }}
                            >
                                <div className="font-bold mb-2" style={{ color: theme.styles.headerText }}>{theme.name}</div>
                                <div className="text-xs truncate" style={{ color: theme.styles.messageText }}>
                                    {theme.systemPrompt.substring(0, 80)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TerminalCanvas;
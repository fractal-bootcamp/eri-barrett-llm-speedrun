'use client';

import { useState, useEffect } from 'react';
import { themes, themeList } from '../lib/terminal-themes';
import { TerminalTheme } from '../types/terminal-types';

interface ThemeSelectorProps {
    onSelectTheme: (theme: TerminalTheme) => void;
    currentThemeId?: string;
}

export default function ThemeSelector({ onSelectTheme, currentThemeId }: ThemeSelectorProps) {
    const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId || 'retroTerminal');
    const [customPrompt, setCustomPrompt] = useState('');
    const [isCustomPrompt, setIsCustomPrompt] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [modelTemperature, setModelTemperature] = useState(0.7);
    const [modelMaxTokens, setModelMaxTokens] = useState(1000);
    const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
    const [model, setModel] = useState('gpt-4o');

    // Load the current theme's settings when the selected theme changes
    useEffect(() => {
        const theme = themes[selectedThemeId];
        if (theme) {
            setCustomPrompt(theme.systemPrompt);
            setModelTemperature(theme.llm.temperature);
            setModelMaxTokens(theme.llm.maxTokens);
            setProvider(theme.llm.provider);
            setModel(theme.llm.model);
            setIsCustomPrompt(false);
        }
    }, [selectedThemeId]);

    // Apply the selected theme
    const applyTheme = () => {
        let selectedTheme = { ...themes[selectedThemeId] };

        // If using a custom prompt, update the theme's system prompt and LLM settings
        if (isCustomPrompt) {
            selectedTheme = {
                ...selectedTheme,
                systemPrompt: customPrompt,
                llm: {
                    ...selectedTheme.llm,
                    provider,
                    model,
                    temperature: modelTemperature,
                    maxTokens: modelMaxTokens
                }
            };
        }

        onSelectTheme(selectedTheme);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center space-x-2"
            >
                <span>Theme Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white shadow-lg rounded-md p-4 w-96 z-50">
                    <h3 className="text-lg font-bold mb-3">Theme Settings</h3>

                    {/* Theme Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Terminal Theme</label>
                        <select
                            value={selectedThemeId}
                            onChange={(e) => setSelectedThemeId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md"
                        >
                            {Object.keys(themes).map((themeId) => (
                                <option key={themeId} value={themeId}>
                                    {themes[themeId].name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Prompt Toggle */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="custom-prompt-toggle"
                            checked={isCustomPrompt}
                            onChange={() => setIsCustomPrompt(!isCustomPrompt)}
                            className="mr-2"
                        />
                        <label htmlFor="custom-prompt-toggle" className="text-sm font-medium">
                            Customize System Prompt
                        </label>
                    </div>

                    {/* System Prompt */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            {isCustomPrompt ? 'Custom System Prompt' : 'Default System Prompt'}
                        </label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            disabled={!isCustomPrompt}
                            className="w-full h-32 px-3 py-2 bg-gray-800 text-white rounded-md resize-none"
                            style={{ opacity: isCustomPrompt ? 1 : 0.7 }}
                        />
                    </div>

                    {/* Advanced Settings (only editable with custom prompt) */}
                    {isCustomPrompt && (
                        <div className="mb-4 p-3 bg-gray-800 rounded-md">
                            <h4 className="font-medium mb-3">Advanced Settings</h4>

                            {/* Provider Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Provider</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="openai"
                                            checked={provider === 'openai'}
                                            onChange={() => {
                                                setProvider('openai');
                                                setModel('gpt-4o');
                                            }}
                                            className="mr-2"
                                        />
                                        <span>OpenAI</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="anthropic"
                                            checked={provider === 'anthropic'}
                                            onChange={() => {
                                                setProvider('anthropic');
                                                setModel('claude-3-opus-20240229');
                                            }}
                                            className="mr-2"
                                        />
                                        <span>Anthropic</span>
                                    </label>
                                </div>
                            </div>

                            {/* Model Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Model</label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                                >
                                    {provider === 'openai' ? (
                                        <>
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                                            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Temperature: {modelTemperature}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={modelTemperature}
                                    onChange={(e) => setModelTemperature(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs">
                                    <span>More Precise</span>
                                    <span>More Creative</span>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">Max Tokens: {modelMaxTokens}</label>
                                <input
                                    type="range"
                                    min="100"
                                    max="2000"
                                    step="100"
                                    value={modelMaxTokens}
                                    onChange={(e) => setModelMaxTokens(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs">
                                    <span>Shorter</span>
                                    <span>Longer</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1 bg-gray-700 text-white rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyTheme}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 
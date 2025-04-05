'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemedTerminalWindowProps, TerminalMessage } from '../types/terminal-types';
import { v4 as uuidv4 } from 'uuid';
import { generateLLMResponse, LLMResponse } from '../lib/llm-service';
import { RetroBeige } from '../lib/terminal-styles';
// Simple import of the motion component
import { motion } from 'framer-motion';

export const TerminalWindow = ({
    id,
    theme,
    initialPosition,
    savedMessages = [],
    savedScrollPosition = 0,
    zIndex,
    isActive,
    initialMessage,
    onClose,
    onFullscreenChange,
    onFocus
}: ThemedTerminalWindowProps) => {
    // State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<TerminalMessage[]>(() => {
        if (savedMessages.length > 0) return savedMessages;
        if (initialMessage) {
            return [{
                id: uuidv4(),
                content: initialMessage,
                sender: 'system',
                timestamp: new Date()
            }];
        }
        return [];
    });
    const [inputValue, setInputValue] = useState('');
    const [savedScrollPos, setSavedScrollPos] = useState(savedScrollPosition);
    const [prevState, setPrevState] = useState({
        ...initialPosition,
        width: 380,
        height: 500
    });
    const [dimensions, setDimensions] = useState({ width: 380, height: 500 });
    const [position, setPosition] = useState(initialPosition);
    const [isLoading, setIsLoading] = useState(false);
    const [streamedResponse, setStreamedResponse] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Refs
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Reset error when user types
    useEffect(() => {
        if (error && inputValue) {
            setError(null);
        }
    }, [inputValue, error]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, streamedResponse]);

    // Restore saved scroll position
    useEffect(() => {
        if (messagesContainerRef.current && savedScrollPos > 0) {
            messagesContainerRef.current.scrollTop = savedScrollPos;
        }
    }, [savedScrollPos]);

    // Handle fullscreen changes
    useEffect(() => {
        onFullscreenChange(isFullscreen);
    }, [isFullscreen, onFullscreenChange]);

    // Handle window focus
    const handleWindowFocus = () => {
        if (!isActive) {
            onFocus();
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            // Save current position and dimensions before going fullscreen
            setPrevState({
                x: position.x,
                y: position.y,
                width: dimensions.width,
                height: dimensions.height
            });
        }
        setIsFullscreen(!isFullscreen);
    };

    // Toggle minimize
    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // Handle drag
    const handleDrag = (event: any, info: any) => {
        setPosition({
            x: position.x + info.delta.x,
            y: position.y + info.delta.y
        });
    };

    // Save scroll position
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            setSavedScrollPos(messagesContainerRef.current.scrollTop);
        }
    };

    // Handle message submission
    const handleSubmitMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (inputValue.trim() === '' || isLoading) return;

        // Add user message
        const userMessage: TerminalMessage = {
            id: uuidv4(),
            content: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Clear input and start loading
        const userPrompt = inputValue;
        setInputValue('');
        setIsLoading(true);
        setStreamedResponse('');
        setError(null);

        // Filter out any initial welcome message for the LLM context
        const messageHistory = messages.filter(msg =>
            !(msg.sender === 'system' && messages.indexOf(msg) === 0 && initialMessage === msg.content)
        );

        // Call the LLM service
        try {
            await generateLLMResponse(
                userPrompt,
                messageHistory,
                theme.systemPrompt,
                theme.llm,
                // Handle streaming tokens
                (token: string) => {
                    setStreamedResponse(prev => prev + token);
                },
                // Handle completion
                (response: LLMResponse) => {
                    setIsLoading(false);
                    // Add the complete message
                    const systemResponse: TerminalMessage = {
                        id: response.id || uuidv4(),
                        content: response.content,
                        sender: 'system',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, systemResponse]);
                    setStreamedResponse('');
                },
                // Handle errors
                (error: Error) => {
                    setIsLoading(false);
                    setError(error.message);
                    console.error('LLM Error:', error);
                }
            );
        } catch (err) {
            setIsLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Error calling LLM service:', err);
        }
    };

    // Export chat function
    const exportChat = () => {
        const chatExport = messages.map(msg =>
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender === 'user' ? theme.userSenderName : theme.senderName}: ${msg.content}`
        ).join('\n\n');

        const blob = new Blob([chatExport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${theme.name}-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle resize
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = dimensions.width;
        const startHeight = dimensions.height;

        const onMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(300, startWidth + (e.clientX - startX));
            const newHeight = Math.max(400, startHeight + (e.clientY - startY));
            setDimensions({ width: newWidth, height: newHeight });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // Handle responsive ASCII art
    const getAsciiArtStyle = () => {
        // Default style
        const baseStyle = {
            color: styles.text,
            maxWidth: '100%',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out'
        };

        // Fullscreen mode
        if (isFullscreen) {
            return {
                ...baseStyle,
                fontSize: '0.75rem',
                lineHeight: '1rem',
                transform: 'none'
            };
        }

        // Small width (mobile or small window)
        if (dimensions.width < 400) {
            return {
                ...baseStyle,
                fontSize: '0.4rem',
                lineHeight: '0.6rem',
                transform: 'scale(0.8)',
                transformOrigin: 'center top'
            };
        }

        // Medium width
        if (dimensions.width < 600) {
            return {
                ...baseStyle,
                fontSize: '0.5rem',
                lineHeight: '0.7rem',
                transform: 'scale(0.85)',
                transformOrigin: 'center top'
            };
        }

        // Large width (but not fullscreen)
        return {
            ...baseStyle,
            fontSize: '0.6rem',
            lineHeight: '0.9rem',
            transform: 'scale(0.9)',
            transformOrigin: 'center top'
        };
    };

    // Determine styles based on theme
    const { styles } = theme;

    if (isMinimized) {
        // Render minimized view
        return (
            <div
                className="absolute cursor-pointer"
                style={{
                    left: position.x,
                    top: position.y,
                    zIndex
                }}
                onClick={toggleMinimize}
                onMouseDown={handleWindowFocus}
            >
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm"
                    style={{
                        backgroundColor: styles.headerBackground,
                        border: `2px solid ${styles.headerBorder}`,
                        color: styles.headerText
                    }}
                >
                    {theme.name.charAt(0)}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={terminalRef}
            className={`absolute flex flex-col ${isFullscreen ? 'fixed inset-0' : 'rounded-md overflow-hidden'}`}
            style={{
                left: isFullscreen ? 0 : position.x,
                top: isFullscreen ? 0 : position.y,
                width: isFullscreen ? '100vw' : dimensions.width,
                height: isFullscreen ? '100vh' : dimensions.height,
                backgroundColor: styles.background,
                border: `2px solid ${styles.border}`,
                color: styles.text,
                zIndex: isFullscreen ? 9999 : zIndex
            }}
            onMouseDown={handleWindowFocus}
        >
            {/* Header */}
            <div
                className="flex items-center px-3 py-2 cursor-move terminal-header"
                style={{
                    backgroundColor: styles.headerBackground,
                    borderBottom: `1px solid ${styles.headerBorder}`
                }}
                onMouseDown={(e) => {
                    if (isFullscreen) return;

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startLeft = position.x;
                    const startTop = position.y;

                    const onMouseMove = (e: MouseEvent) => {
                        setPosition({
                            x: startLeft + (e.clientX - startX),
                            y: startTop + (e.clientY - startY)
                        });
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }}
            >
                {theme.styles === RetroBeige ? (
                    <>
                        <div className="flex-grow"></div>
                        <div className="flex space-x-3">
                            <button className="text-sm opacity-70" title="Download">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="text-sm opacity-70" onClick={toggleMinimize} title="Minimize">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="text-sm opacity-70" onClick={toggleFullscreen} title="Fullscreen">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="text-sm opacity-70" onClick={onClose} title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex space-x-2 mr-2">
                            <div
                                className="w-3 h-3 rounded-full cursor-pointer"
                                style={{ backgroundColor: 'rgb(255, 95, 86)' }}
                                onClick={onClose}
                                title="Close"
                            ></div>
                            <div
                                className="w-3 h-3 rounded-full cursor-pointer"
                                style={{ backgroundColor: 'rgb(255, 189, 46)' }}
                                onClick={toggleMinimize}
                                title="Minimize"
                            ></div>
                            <div
                                className="w-3 h-3 rounded-full cursor-pointer"
                                style={{ backgroundColor: 'rgb(39, 201, 63)' }}
                                onClick={toggleFullscreen}
                                title="Fullscreen"
                            ></div>
                        </div>
                        <div className="flex-1 text-center text-sm font-mono truncate" style={{ color: styles.headerText }}>
                            {theme.name} - {theme.llm.model}
                        </div>
                        <button
                            className="text-xs px-2 py-1 rounded hover:opacity-80"
                            style={{
                                backgroundColor: styles.buttonBackground,
                                color: styles.buttonText
                            }}
                            onClick={exportChat}
                            title="Export Chat"
                        >
                            Export
                        </button>
                    </>
                )}
            </div>

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onScroll={handleScroll}
                style={{ backgroundColor: styles.background }}
            >
                {/* Display ASCII Art at the top */}
                {theme.asciiArt && (
                    <div
                        className="mb-4 text-center w-full overflow-hidden"
                        style={{
                            maxHeight: isFullscreen ? '200px' : '120px',
                            transition: 'max-height 0.3s ease-in-out'
                        }}
                    >
                        <pre
                            className="inline-block whitespace-pre font-mono"
                            style={getAsciiArtStyle()}
                        >
                            {theme.asciiArt}
                        </pre>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`p-3 rounded-md ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
                        style={{
                            backgroundColor: message.sender === 'user' ? styles.userMessageBackground : styles.messageBackground,
                            color: message.sender === 'user' ? styles.userMessageText : styles.messageText,
                            border: `1px solid ${styles.messageBorder}`,
                            maxWidth: '80%'
                        }}
                    >
                        <div className="text-xs mb-1" style={{ color: styles.timestampText }}>
                            {message.sender === 'user' ? theme.userSenderName : theme.senderName} | {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                ))}

                {/* Streaming response */}
                {streamedResponse && (
                    <div
                        className="p-3 rounded-md mr-auto"
                        style={{
                            backgroundColor: styles.messageBackground,
                            color: styles.messageText,
                            border: `1px solid ${styles.messageBorder}`,
                            maxWidth: '80%'
                        }}
                    >
                        <div className="text-xs mb-1" style={{ color: styles.timestampText }}>
                            {theme.senderName} | {new Date().toLocaleTimeString()}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{streamedResponse}</div>
                    </div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamedResponse && (
                    <div
                        className="p-3 rounded-md mr-auto"
                        style={{
                            backgroundColor: styles.messageBackground,
                            color: styles.messageText,
                            border: `1px solid ${styles.messageBorder}`,
                            maxWidth: '80%'
                        }}
                    >
                        <div className="text-xs mb-1" style={{ color: styles.timestampText }}>
                            {theme.senderName} | {new Date().toLocaleTimeString()}
                        </div>
                        <div className="animate-pulse">Thinking...</div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div
                        className="p-3 rounded-md mr-auto"
                        style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            maxWidth: '80%'
                        }}
                    >
                        <div className="text-xs mb-1" style={{ color: '#ef4444' }}>
                            System | {new Date().toLocaleTimeString()}
                        </div>
                        <div className="whitespace-pre-wrap break-words">
                            Error: {error}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={handleSubmitMessage}
                className="p-3 flex"
                style={{
                    borderTop: `1px solid ${styles.headerBorder}`,
                    backgroundColor: styles.background
                }}
            >
                {theme.styles === RetroBeige ? (
                    <>
                        <div className="flex-1 flex items-center px-3 py-2 rounded-md" style={{
                            backgroundColor: styles.inputBackground,
                            border: `1px solid ${styles.inputBorder}`,
                            color: styles.inputText,
                            opacity: isLoading ? 0.7 : 1
                        }}>
                            <span className="text-sm mr-2 opacity-70">{'>'}</span>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 focus:outline-none bg-transparent"
                                placeholder="Type a message..."
                                disabled={isLoading}
                                style={{
                                    color: styles.inputText,
                                }}
                            />
                            <button
                                type="submit"
                                className="ml-2 p-2 rounded-md flex items-center justify-center"
                                disabled={isLoading || !inputValue.trim()}
                                style={{
                                    backgroundColor: styles.buttonBackground,
                                    color: styles.buttonText,
                                    opacity: (isLoading || !inputValue.trim()) ? 0.7 : 1
                                }}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-l-md focus:outline-none"
                            placeholder="Type your message..."
                            disabled={isLoading}
                            style={{
                                backgroundColor: styles.inputBackground,
                                border: `1px solid ${styles.inputBorder}`,
                                color: styles.inputText,
                                borderRight: 'none',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-r-md flex items-center justify-center"
                            disabled={isLoading || !inputValue.trim()}
                            style={{
                                backgroundColor: styles.buttonBackground,
                                color: styles.buttonText,
                                opacity: (isLoading || !inputValue.trim()) ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </>
                )}
            </form>

            {/* Resize Handle */}
            {!isFullscreen && (
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                    style={{
                        borderRight: `2px solid ${styles.resizeHandleBorder}`,
                        borderBottom: `2px solid ${styles.resizeHandleBorder}`
                    }}
                    onMouseDown={handleResizeStart}
                ></div>
            )}
        </div>
    );
};

export default TerminalWindow;

'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemedTerminalWindowProps, TerminalMessage } from '../types/terminal-types';
import { v4 as uuidv4 } from 'uuid';
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

    // Refs
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
    const handleSubmitMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (inputValue.trim() === '') return;

        // Add user message
        const userMessage: TerminalMessage = {
            id: uuidv4(),
            content: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Mock API call for system response
        setTimeout(() => {
            const systemResponse: TerminalMessage = {
                id: uuidv4(),
                content: `Response to: ${inputValue}`,
                sender: 'system',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, systemResponse]);
        }, 1000);
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
                    {theme.name}
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
            </div>

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
                onScroll={handleScroll}
                style={{ backgroundColor: styles.background }}
            >
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
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-l-md focus:outline-none"
                    placeholder="Type your message..."
                    style={{
                        backgroundColor: styles.inputBackground,
                        border: `1px solid ${styles.inputBorder}`,
                        color: styles.inputText,
                        borderRight: 'none'
                    }}
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded-r-md flex items-center justify-center"
                    disabled={!inputValue.trim()}
                    style={{
                        backgroundColor: styles.buttonBackground,
                        color: styles.buttonText,
                        opacity: !inputValue.trim() ? 0.7 : 1
                    }}
                >
                    Send
                </button>
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

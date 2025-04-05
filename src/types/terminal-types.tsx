// * Terminal Style
export type TerminalStyle = {
    gridColor: string
    background: string
    border: string
    headerBackground: string
    headerBorder: string
    text: string
    headerText: string
    dotColor: string
    inputBackground: string
    inputBorder: string
    inputText: string
    inputPlaceholder: string
    buttonBackground: string
    buttonHover: string
    buttonText: string
    messageBackground: string
    messageText: string
    userMessageBackground: string
    userMessageText: string
    messageBorder: string
    timestampText: string
    resizeHandleBorder: string
}

// * Overall Terminal Theme
export type TerminalTheme = {
    id: string
    name: string
    styles: TerminalStyle
    senderName: string
    userSenderName: string
    asciiArt: string
    llm: TerminalLLM
    systemPrompt: string
}

// * LLM
export interface TerminalLLM {
    id: string;
    provider: "openai" | "anthropic";
    model: string;
    temperature: number;
    maxTokens: number;
}

// * Terminal Message
export interface TerminalMessage {
    id: string;
    content: string;
    sender: "user" | "system"
    timestamp: Date;
}

// * Terminal Window Instance Props
export interface ThemedTerminalWindowProps {
    id: string;
    theme: TerminalTheme;
    initialPosition: { x: number; y: number };
    zIndex: number;
    isActive: boolean;
    savedMessages?: TerminalMessage[];
    savedScrollPosition?: number;
    initialMessage?: string;
    onClose: () => void;
    onFullscreenChange: (isFullscreen: boolean) => void;
    onFocus: () => void;
}

import React, { useState, useEffect, useRef } from 'react';
import { getAssistantResponseStream } from '../../services/geminiService';
import { IconChevronLeft, IconSend, IconSparkles } from '../icons';
import { CopyButton } from './CopyButton';
import { Spinner } from './Spinner';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// Helper component to render formatted text (Code blocks & Bold)
const FormattedMessage = ({ content }: { content: string }) => {
    // 1. Split by Code Blocks ```
    const parts = content.split(/```/);

    return React.createElement('div', { className: "space-y-3" },
        parts.map((part, index) => {
            if (index % 2 === 1) {
                // Code Block Section
                // Remove language identifier if present (e.g., "json\n...")
                let codeContent = part.trim();
                const firstLineMatch = codeContent.match(/^[a-zA-Z]+\n/);
                if (firstLineMatch) {
                    codeContent = codeContent.substring(firstLineMatch[0].length);
                }

                if (!codeContent) return null;

                return React.createElement('div', { key: index, className: "relative group my-3" },
                    React.createElement('div', { className: "absolute -top-3 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm z-10" }, "AI PROMPT"),
                    React.createElement('div', { className: "bg-slate-950 rounded-lg border border-slate-600 overflow-hidden" },
                         React.createElement('div', { className: "p-3 overflow-x-auto custom-scrollbar" },
                            React.createElement('pre', { className: "text-xs font-mono text-purple-300 whitespace-pre-wrap break-words" }, codeContent)
                         )
                    ),
                    React.createElement('div', { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" },
                         React.createElement(CopyButton, { textToCopy: codeContent })
                    )
                );
            } else {
                // Regular Text Section with Bold Parsing
                if (!part.trim()) return null;
                
                // Split by paragraphs to handle spacing
                const paragraphs = part.split(/\n\n+/);
                
                return React.createElement('div', { key: index, className: "space-y-2" },
                    paragraphs.map((para, pIndex) => {
                         // Parse **bold**
                        const boldParts = para.split(/\*\*(.*?)\*\*/g);
                        return React.createElement('p', { key: pIndex, className: "text-sm leading-relaxed text-slate-200" },
                            boldParts.map((subPart, subIndex) => 
                                subIndex % 2 === 1 
                                ? React.createElement('strong', { key: subIndex, className: "text-white font-bold" }, subPart) 
                                : subPart
                            )
                        );
                    })
                );
            }
        })
    );
};

export const AssistantSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: trimmedInput }];
        setChatHistory(newHistory);
        setInputValue('');
        setIsLoading(true);

        try {
            const stream = await getAssistantResponseStream(newHistory);
            
            setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setChatHistory(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'model') {
                        const updatedMessage = { ...lastMessage, content: lastMessage.content + chunkText };
                        return [...prev.slice(0, -1), updatedMessage];
                    }
                    return prev;
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setChatHistory(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const suggestionPrompts = [
        "Create a prompt for a cinematic shot of a futuristic city.",
        "How can I make my character prompts more consistent?",
        "Suggest 3 different art styles for a fantasy character.",
        "What's a good prompt for a dynamic video of a car chase?"
    ];

    return React.createElement('div', {
        className: `fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`,
        style: { width: '400px' }
    },
        React.createElement('div', { className: "flex flex-col h-full" },
            React.createElement('div', { className: "flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900" },
                React.createElement('div', { className: "flex items-center space-x-2" },
                    React.createElement(IconSparkles, { className: "w-6 h-6 text-purple-400" }),
                    React.createElement('h2', { className: "text-lg font-bold text-white tracking-wide" }, "AI Prompt Expert")
                ),
                React.createElement('button', {
                    onClick: onClose,
                    className: "p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors",
                    'aria-label': "Close assistant"
                },
                    React.createElement(IconChevronLeft, { className: "w-6 h-6" })
                )
            ),
            React.createElement('div', { ref: chatContainerRef, className: "flex-grow p-4 overflow-y-auto space-y-6 bg-slate-900" },
                chatHistory.length === 0 && React.createElement('div', { className: 'flex flex-col items-center justify-center h-full text-center px-4 opacity-80'},
                    React.createElement('div', { className: "bg-slate-800 p-4 rounded-full mb-4" }, 
                        React.createElement(IconSparkles, { className: "w-8 h-8 text-purple-500" })
                    ),
                    React.createElement('h3', { className: 'text-white font-bold text-lg mb-2' }, 'How can I help you create?'),
                    React.createElement('p', { className: "text-slate-400 text-sm mb-6" }, "I can help you refine prompts, suggest styles, or brainstorm creative ideas."),
                    React.createElement('div', { className: 'w-full flex flex-col space-y-2' },
                        suggestionPrompts.map((prompt, i) => React.createElement('button', {
                            key: i,
                            className: 'text-sm text-left text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-all border border-slate-700 hover:border-purple-500/50',
                            onClick: () => setInputValue(prompt)
                        }, prompt))
                    )
                ),
                chatHistory.map((msg, index) => React.createElement('div', { key: index, className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}` },
                    React.createElement('div', { className: `max-w-[90%] p-4 rounded-xl shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}` },
                        msg.role === 'model' 
                            ? React.createElement(FormattedMessage, { content: msg.content })
                            : React.createElement('p', { className: "text-sm whitespace-pre-wrap font-medium" }, msg.content)
                    )
                )),
                isLoading && React.createElement('div', { className: "flex justify-start" },
                    React.createElement('div', { className: "bg-slate-800 p-4 rounded-xl rounded-bl-none border border-slate-700 flex items-center space-x-3" },
                        React.createElement(Spinner),
                        React.createElement('span', { className: "text-sm text-slate-400 animate-pulse" }, "Thinking...")
                    )
                )
            ),
            React.createElement('div', { className: "p-4 border-t border-slate-700 bg-slate-900" },
                React.createElement('form', { onSubmit: handleSendMessage, className: "relative" },
                    React.createElement('textarea', {
                        value: inputValue,
                        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
                        onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        },
                        placeholder: "Ask me anything about prompts...",
                        rows: 1,
                        className: "w-full bg-slate-800 text-white rounded-xl py-3 pl-4 pr-12 resize-none border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner",
                        disabled: isLoading
                    } as any),
                    React.createElement('button', {
                        type: "submit",
                        className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all hover:scale-105",
                        disabled: isLoading || !inputValue.trim()
                    },
                        React.createElement(IconSend, { className: "w-5 h-5" })
                    )
                )
            )
        )
    );
};
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const SUGGESTED_QUERIES = [
    "What is my profit this month?",
    "Show me top 5 expenses this year", 
    "Recent income transactions",
    "Summary of all projects"
];

export function AIChatInterface() {
    const [messages, setMessages] = useState<Array<{ id: string, role: string, content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending request to AI API...');
            
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success && data.text) {
                const aiMessageId = (Date.now() + 1).toString();
                setMessages(prev => [...prev, { 
                    id: aiMessageId, 
                    role: 'assistant', 
                    content: data.text 
                }]);
                
                console.log('AI response added successfully');
                console.log('Tool calls made:', data.toolCalls?.length || 0);
                console.log('Steps completed:', data.steps || 0);
            } else {
                throw new Error(data.error || 'No valid response received');
            }

        } catch (error: unknown) {
            console.error('Chat Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(errorMessage);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => {
            const form = document.querySelector('#chat-form');
            if (form) (form as HTMLFormElement).requestSubmit();
        }, 100);
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto border rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">AI Financial Assistant</h3>
                {error && (
                    <div className="ml-auto text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        Error: Check console
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-medium">How can I help you today?</h4>
                            <p className="text-gray-600 text-sm max-w-md">
                                I can analyze your financial data, summarize projects, and track expenses.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                            {SUGGESTED_QUERIES.map((query) => (
                                <button
                                    key={query}
                                    className="h-auto py-3 px-4 text-left text-sm font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={() => handleSuggestionClick(query)}
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col p-4 space-y-4">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        <span className="text-sm text-gray-600">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <form id="chat-form" onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                    <input
                        className="flex-1 min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ask about your finances..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="shrink-0 h-10 w-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-md flex items-center justify-center transition-colors" 
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-4 w-4 text-white" />
                    </button>
                </form>
                <div className="text-xs text-center text-gray-500 mt-2">
                    AI can make mistakes. Please verify important financial data.
                </div>
            </div>
        </div>
    );
}

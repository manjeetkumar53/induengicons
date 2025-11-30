'use client';

import { cn } from '@/lib/utils';
import Markdown from 'markdown-to-jsx';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div
            className={cn(
                'flex w-full items-start gap-4 p-4',
                isUser ? 'flex-row-reverse bg-muted/50' : 'bg-background'
            )}
        >
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-background'
                )}
            >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn('flex-1 space-y-2 overflow-hidden', isUser && 'text-right')}>
                <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                    {role === 'data' ? (
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                            {JSON.stringify(JSON.parse(content), null, 2)}
                        </pre>
                    ) : (
                        <Markdown
                            options={{
                                overrides: {
                                    table: {
                                        component: ({ children }: { children: React.ReactNode }) => (
                                            <div className="overflow-x-auto my-4">
                                                <table className="w-full border-collapse text-sm">{children}</table>
                                            </div>
                                        ),
                                    },
                                    thead: {
                                        component: ({ children }: { children: React.ReactNode }) => (
                                            <thead className="bg-muted">{children}</thead>
                                        ),
                                    },
                                    th: {
                                        component: ({ children }: { children: React.ReactNode }) => (
                                            <th className="border px-4 py-2 text-left font-medium">{children}</th>
                                        ),
                                    },
                                    td: {
                                        component: ({ children }: { children: React.ReactNode }) => (
                                            <td className="border px-4 py-2">{children}</td>
                                        ),
                                    },
                                },
                            }}
                        >
                            {content}
                        </Markdown>
                    )}
                </div>
            </div>
        </div>
    );
}

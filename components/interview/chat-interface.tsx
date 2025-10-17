'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  questionId?: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  conversationHistory: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isComplete: boolean;
  progress: {
    current: number;
    total: number;
  };
}

export function ChatInterface({
  sessionId,
  conversationHistory,
  onSendMessage,
  isLoading,
  isComplete,
  progress,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversationHistory, isLoading]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || isComplete) return;

    const message = input.trim();
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="px-4 py-3 border-b bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Interview Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Question {progress.current} of {progress.total}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversationHistory.map((message, index) => (
            <MessageBubble
              key={`${message.timestamp}-${index}`}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && <TypingIndicator />}
          {isComplete && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interview completed! Thank you for your time.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-gray-950 px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isComplete ? 'Interview completed' : 'Type your answer...'}
            disabled={isLoading || isComplete}
            className="min-h-[60px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || isComplete}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

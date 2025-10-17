import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'text-xs mt-1',
              isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {new Date(timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

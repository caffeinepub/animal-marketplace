import { useState, useRef, useEffect } from 'react';
import { useGetConversation, useSendMessage, useGetProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatThreadProps {
  recipientPrincipal: string;
  listingId?: bigint;
}

const QUICK_REPLIES = [
  'Is this animal still available?',
  'What is your final price?',
  'Can I visit to see the animal?',
];

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatThread({ recipientPrincipal, listingId }: ChatThreadProps) {
  const { identity } = useInternetIdentity();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: messages = [], isLoading } = useGetConversation(recipientPrincipal);
  const { data: recipientProfile } = useGetProfile(recipientPrincipal);
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();

  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) =>
    Number(a.timestamp - b.timestamp)
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;
    try {
      await sendMessage({
        recipient: recipientPrincipal,
        listingId,
        text: messageText.trim(),
      });
      setMessageText('');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleQuickReply = async (text: string) => {
    if (isSending) return;
    try {
      await sendMessage({
        recipient: recipientPrincipal,
        listingId,
        text,
      });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const recipientName = recipientProfile?.displayName ?? `${recipientPrincipal.slice(0, 8)}...`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {recipientName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{recipientName}</p>
          <p className="text-xs text-muted-foreground">
            {recipientPrincipal.slice(0, 12)}...
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-56')} />
              </div>
            ))}
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No messages yet.</p>
            <p className="text-muted-foreground text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          <>
            {sortedMessages.map((msg, index) => {
              const isMine = msg.sender.toString() === myPrincipal;
              const showDate =
                index === 0 ||
                formatDate(msg.timestamp) !== formatDate(sortedMessages[index - 1].timestamp);

              return (
                <div key={index}>
                  {showDate && (
                    <div className="flex justify-center my-2">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      )}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className={cn(
                        'text-xs mt-1',
                        isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Quick Reply Buttons */}
      <div className="px-4 pt-3 pb-1 border-t border-border bg-card">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Quick Reply</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              disabled={isSending}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary bg-primary/5',
                'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                'transition-colors duration-150 font-medium',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 pt-2 border-border bg-card flex gap-2">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isSending || !messageText.trim()}>
          {isSending ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

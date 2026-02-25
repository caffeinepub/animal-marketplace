import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListConversations, useGetProfile } from '../hooks/useQueries';
import ChatThread from '../components/ChatThread';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, LogIn, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Principal } from '@dfinity/principal';

interface ConversationItemProps {
  principalStr: string;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ principalStr, isSelected, onClick }: ConversationItemProps) {
  // Convert string to Principal for the hook
  const principalObj = (() => {
    try {
      return Principal.fromText(principalStr);
    } catch {
      return undefined;
    }
  })();

  const { data: profile } = useGetProfile(principalObj);
  const displayName = profile?.displayName ?? `${principalStr.slice(0, 10)}...`;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60',
        isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {principalStr.slice(0, 16)}...
        </p>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  // Read principal from URL path as a fallback approach
  const urlPrincipal = (() => {
    const path = window.location.pathname;
    const match = path.match(/\/messages\/(.+)/);
    return match ? match[1] : undefined;
  })();

  const [selectedPrincipal, setSelectedPrincipal] = useState<string | undefined>(urlPrincipal);
  const { data: conversations = [], isLoading: convsLoading } = useListConversations();

  // When URL changes, update selected
  useEffect(() => {
    if (urlPrincipal) {
      setSelectedPrincipal(urlPrincipal);
    }
  }, [urlPrincipal]);

  // Auto-select first conversation if none selected and no URL param
  useEffect(() => {
    if (!selectedPrincipal && conversations.length > 0 && !urlPrincipal) {
      setSelectedPrincipal(conversations[0].toString());
    }
  }, [conversations, selectedPrincipal, urlPrincipal]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Sign in to view messages
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Log in to access your conversations with buyers and sellers.
        </p>
        <Button onClick={login} disabled={isLoggingIn} className="gap-2">
          {isLoggingIn ? (
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    );
  }

  // Merge URL principal with conversation list
  const allPrincipals = new Set<string>();
  conversations.forEach((p) => allPrincipals.add(p.toString()));
  if (selectedPrincipal) allPrincipals.add(selectedPrincipal);

  const principalList = Array.from(allPrincipals);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Messages</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden flex h-[600px]">
        {/* Conversation List */}
        <div className={cn(
          'w-full md:w-72 border-r border-border flex flex-col shrink-0',
          selectedPrincipal ? 'hidden md:flex' : 'flex'
        )}>
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : principalList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact a seller to start chatting.
                </p>
              </div>
            ) : (
              principalList.map((p) => (
                <ConversationItem
                  key={p}
                  principalStr={p}
                  isSelected={selectedPrincipal === p}
                  onClick={() => setSelectedPrincipal(p)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Thread */}
        <div className={cn(
          'flex-1 flex flex-col',
          !selectedPrincipal ? 'hidden md:flex' : 'flex'
        )}>
          {selectedPrincipal ? (
            <>
              {/* Mobile back button */}
              <div className="md:hidden px-4 py-2 border-b border-border">
                <button
                  onClick={() => setSelectedPrincipal(undefined)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
              <ChatThread recipientPrincipal={selectedPrincipal} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { shouldAutoScroll } from "@/utils/notificationUtils";
import { useChatMessages } from "@/hooks/useChatMessages";
import { 
  Send as SendHorizontal, 
  Check, 
  CheckCheck, 
  ArrowDown, 
  Loader, 
  CircleDot, 
  CircleOff 
} from "lucide-react";
import { usePresenceTracking, useObservePresence } from "@/utils/chatPresenceUtils";
import { MessageBubble } from "./MessageBubble";
import { ChatMessage } from "@/hooks/useChatSupport";

interface ChatInterfaceProps {
  userId?: string; // For admin to chat with specific user
  className?: string;
  onChatOpened?: () => void;
}

export function ChatInterface({ userId, className, onChatOpened }: ChatInterfaceProps) {
  const { t, isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { messages, loading, sendMessage, markAllAsRead } = useChatMessages(userId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Presence hooks for real-time typing and online status
  const { updateTypingStatus } = usePresenceTracking(user?.id);
  const otherUserPresence = useObservePresence(isAdmin ? userId : undefined);

  const isOtherUserTyping = otherUserPresence?.is_typing || false;
  const isOtherUserOnline = otherUserPresence?.status === 'online';

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (user && messages.length > 0) {
      markAllAsRead(isAdmin);
      if (onChatOpened) onChatOpened();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, messages.length, isAdmin]);
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
      setIsAutoScrollEnabled(true);
    }
  };
  
  // Auto scroll to bottom on new messages if user is already at bottom
  useEffect(() => {
    if (!messages.length) return;
    
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (isAutoScrollEnabled && scrollElement) {
      scrollToBottom();
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
    
    // Highlight the latest message if it's from the other party
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && ((isAdmin && !latestMessage.is_from_admin) || (!isAdmin && latestMessage.is_from_admin))) {
      setHighlightedMessageId(latestMessage.id);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
  }, [messages, isAutoScrollEnabled, isAdmin]);
  
  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement) return;
    
    const handleScroll = () => {
      const shouldScroll = shouldAutoScroll(scrollElement as HTMLElement);
      setShowScrollButton(!shouldScroll);
      setIsAutoScrollEnabled(shouldScroll);
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Clear typing status immediately
    updateTypingStatus(false);
    
    const success = await sendMessage(newMessage, userId);
    if (success) {
      setNewMessage("");
      // Always scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
    }
  };
  
  // Handle typing indication with debounce
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Update typing status for realtime presence
    updateTypingStatus(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop showing typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Ensure typing status is reset when component unmounts
      updateTypingStatus(false);
    };
  }, [updateTypingStatus]);
  
  if (!user) {
    return <div>{t("loginRequired") || "Please log in to use chat support"}</div>;
  }
  
  // Group messages by date for better readability
  const groupedMessages: { [key: string]: ChatMessage[] } = {};
  messages.forEach(message => {
    const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!groupedMessages[messageDate]) {
      groupedMessages[messageDate] = [];
    }
    groupedMessages[messageDate].push(message);
  });
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat header with user status */}
      <div className="border-b p-3 bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isAdmin && userId ? 
              t("chatWithUser") || "Chat with User" : 
              t("chatWithSupport") || "Chat with Support"
            }
          </h3>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{t("userStatus") || "User"}: </span>
                {isOtherUserOnline ? (
                  <div className="flex items-center ml-1 text-green-500">
                    <CircleDot className="h-3 w-3 mr-1" />
                    <span>{t("online") || "Online"}</span>
                  </div>
                ) : (
                  <div className="flex items-center ml-1 text-gray-400">
                    <CircleOff className="h-3 w-3 mr-1" />
                    <span>{t("offline") || "Offline"}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-xs">
                <span className="text-muted-foreground">{t("supportStatus") || "Support"}: </span>
                <div className="flex items-center ml-1 text-green-500">
                  <CircleDot className="h-3 w-3 mr-1" />
                  <span>{t("online") || "Online"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4 relative"
        type="always"
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-4">
            <p className="text-sm text-muted-foreground">{t("loading") || "Loading..."}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-10">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 
                t("noMessagesYet") || "No messages yet with this user" : 
                t("startConversation") || "Start a conversation with our support team"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedMessages).map(date => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <div className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                    {format(new Date(date), 'MMM d, yyyy')}
                  </div>
                </div>
                
                {groupedMessages[date].map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={(isAdmin && message.is_from_admin) || (!isAdmin && !message.is_from_admin)}
                    isRTL={isRTL}
                    isHighlighted={message.id === highlightedMessageId}
                  />
                ))}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isOtherUserTyping && (
              <div className={`flex mx-2 mb-1 text-xs text-muted-foreground ${isAdmin ? "justify-start" : "justify-end"}`}>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-full bg-muted/50",
                  "animate-pulse transition-opacity duration-700"
                )}>
                  <Loader className="h-3 w-3 animate-spin" />
                  <span>
                    {isAdmin ? 
                      (t("userIsTyping") || "User is typing...") : 
                      (t("supportIsTyping") || "Support is typing...")
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* Scroll to bottom button with improved styling */}
            {showScrollButton && (
              <Button 
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg opacity-90 hover:opacity-100 bg-primary text-primary-foreground animate-bounce"
                size="icon"
                onClick={scrollToBottom}
                variant="default"
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            )}
            
            {/* This invisible div helps us scroll to the bottom */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message input */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <Textarea
            placeholder={t("typeMessage") || "Type a message..."}
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
          />
          <Button 
            type="button" 
            size="icon" 
            variant="default"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={cn(
              "transition-all duration-300",
              newMessage.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground"
            )}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

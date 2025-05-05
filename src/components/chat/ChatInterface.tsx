
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport, ChatMessage } from "@/hooks/useChatSupport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { SendHorizontal, Check, CheckCheck, ArrowDown, Loader, CircleDot, CircleOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { shouldAutoScroll } from "@/utils/notificationUtils";

interface ChatInterfaceProps {
  userId?: string; // For admin to chat with specific user
  className?: string;
}

// Helper function to format date - moved outside component scope
const formatDateTime = (timestamp: string) => {
  try {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (e) {
    return timestamp;
  }
};

export function ChatInterface({ userId, className }: ChatInterfaceProps) {
  const { t, isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useChatSupport(userId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('offline');
  const processedMessagesRef = useRef<Set<string>>(new Set());
  
  // Simulate online status for demo purposes
  useEffect(() => {
    // In a real app, this would be based on presence data from Supabase
    const randomDelay = Math.random() * 10000 + 5000; // Between 5-15 seconds
    const timer = setTimeout(() => {
      setUserStatus('online');
    }, randomDelay);
    
    return () => clearTimeout(timer);
  }, []);
  
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
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (isAutoScrollEnabled && scrollElement) {
      scrollToBottom();
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages, isAutoScrollEnabled]);
  
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
  
  // Mark messages as read when viewed by the appropriate user
  useEffect(() => {
    if (!messages.length) return;
    
    // Process new messages that need to be marked as read
    const unprocessedMessages = messages.filter(msg => {
      // Only mark messages as unread if:
      // 1. For admin - messages FROM users (not from admin) that are unread
      // 2. For users - messages FROM admin that are unread
      const shouldMarkAsRead = 
        (isAdmin && !msg.is_from_admin && !msg.is_read) || 
        (!isAdmin && msg.is_from_admin && !msg.is_read);
        
      // Check if we've already processed this message
      const alreadyProcessed = processedMessagesRef.current.has(msg.id);
      
      // If it should be marked as read and hasn't been processed yet
      return shouldMarkAsRead && !alreadyProcessed;
    });
    
    // Mark each unprocessed message as read
    unprocessedMessages.forEach(msg => {
      markAsRead(msg.id);
      // Add to processed set
      processedMessagesRef.current.add(msg.id);
    });
    
  }, [isAdmin, messages, markAsRead]);
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage, userId);
    if (success) {
      setNewMessage("");
      // Always scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
    }
  };
  
  // Handle typing indication
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Set typing indicator (for future real-time implementation)
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop showing typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Simulate typing for demo purposes (in real implementation, this would come from realtime subscription)
  useEffect(() => {
    if (!isAdmin && !loading) {
      const typingInterval = setInterval(() => {
        // 20% chance to show typing indicator
        const shouldShowTyping = Math.random() < 0.2;
        setIsTyping(shouldShowTyping);
        
        if (shouldShowTyping) {
          // Stop typing after 1-3 seconds
          const typingDuration = Math.random() * 2000 + 1000;
          setTimeout(() => setIsTyping(false), typingDuration);
        }
      }, 8000); // Check every 8 seconds
      
      return () => clearInterval(typingInterval);
    }
  }, [isAdmin, loading]);
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Highlight new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && ((isAdmin && !latestMessage.is_from_admin) || (!isAdmin && latestMessage.is_from_admin))) {
        setHighlightedMessageId(latestMessage.id);
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
      }
    }
  }, [messages, isAdmin]);
  
  if (!user) {
    return <div>{t("loginRequired") || "Please log in to use chat support"}</div>;
  }
  
  // Sort messages by creation date in ascending order (oldest to newest)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Group messages by date for better readability
  const groupedMessages: { [key: string]: ChatMessage[] } = {};
  sortedMessages.forEach(message => {
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
                {userStatus === 'online' ? (
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
            {isTyping && (
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

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isRTL: boolean;
  isHighlighted: boolean;
}

function MessageBubble({ message, isMine, isRTL, isHighlighted }: MessageBubbleProps) {
  const [isRead, setIsRead] = useState(message.is_read);
  
  // Animate read status change
  useEffect(() => {
    if (!isRead && message.is_read) {
      setIsRead(true);
    }
  }, [message.is_read, isRead]);

  return (
    <div className={cn(
      "flex", 
      isMine ? (isRTL ? "flex-row" : "flex-row-reverse") : "",
      "gap-2 max-w-[85%]",
      isMine ? (isRTL ? "mr-auto" : "ml-auto") : (isRTL ? "ml-auto" : "mr-auto")
    )}>
      <div className={cn(
        "rounded-lg p-3 text-sm transition-all duration-500",
        isMine ? 
          "bg-primary text-primary-foreground" : 
          "bg-muted text-muted-foreground",
        isHighlighted ? 
          "animate-bounce-in shadow-md ring-2 ring-primary ring-offset-1" : "",
        message.is_read && !isRead ? 
          "shadow-md ring-1 ring-green-400" : ""
      )}>
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs opacity-80",
          isMine ? "justify-end" : "justify-start"
        )}>
          <span>{formatDateTime(message.created_at)}</span>
          {isMine && !message.is_from_admin && (
            message.is_read ? 
              <CheckCheck className={cn(
                "h-3 w-3 transition-all",
                isRead !== message.is_read ? "scale-150 text-green-400" : ""
              )} /> : 
              <Check className="h-3 w-3 opacity-70 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
}

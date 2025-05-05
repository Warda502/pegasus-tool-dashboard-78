
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport, ChatMessage } from "@/hooks/useChatSupport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { SendHorizontal, Check, CheckCheck, ArrowDown, Pencil } from "lucide-react";
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
  
  // Mark messages as read when viewed by admin
  useEffect(() => {
    if (isAdmin && messages.length > 0) {
      const unreadMessages = messages.filter(msg => !msg.is_read && !msg.is_from_admin);
      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    }
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
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
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
      {/* Chat header */}
      <div className="border-b p-3 bg-card">
        <h3 className="text-sm font-semibold">
          {isAdmin && userId ? 
            t("chatWithUser") || "Chat with User" : 
            t("chatWithSupport") || "Chat with Support"
          }
        </h3>
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
                  />
                ))}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isAdmin && !isTyping && (
              <div className="flex mx-2 mb-1 text-xs text-muted-foreground opacity-0">
                <Pencil className="h-3 w-3 mr-1" />
                <span>User is typing...</span>
              </div>
            )}
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <Button 
                className="absolute bottom-4 right-4 h-8 w-8 rounded-full shadow-lg opacity-90 hover:opacity-100"
                size="icon"
                onClick={scrollToBottom}
                variant="secondary"
              >
                <ArrowDown className="h-4 w-4" />
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
}

function MessageBubble({ message, isMine, isRTL }: MessageBubbleProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Highlight new messages
  useEffect(() => {
    // Check if this is a new message (less than 1 second old)
    const messageTime = new Date(message.created_at).getTime();
    const isNewMessage = Date.now() - messageTime < 1000;
    
    if (isNewMessage && !isMine) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.created_at, isMine]);

  return (
    <div className={cn(
      "flex", 
      isMine ? (isRTL ? "flex-row" : "flex-row-reverse") : "",
      "gap-2 max-w-[85%]",
      isMine ? (isRTL ? "mr-auto" : "ml-auto") : (isRTL ? "ml-auto" : "mr-auto")
    )}>
      <div className={cn(
        "rounded-lg p-3 text-sm transition-all duration-300",
        isMine ? 
          "bg-primary text-primary-foreground" : 
          "bg-muted text-muted-foreground",
        isHighlighted && !isMine ? "animate-pulse shadow-md" : ""
      )}>
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs opacity-80",
          isMine ? "justify-end" : "justify-start"
        )}>
          <span>{formatDateTime(message.created_at)}</span>
          {isMine && !message.is_from_admin && (
            message.is_read ? 
              <CheckCheck className="h-3 w-3 transition-opacity" /> : 
              <Check className="h-3 w-3 opacity-70 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
}

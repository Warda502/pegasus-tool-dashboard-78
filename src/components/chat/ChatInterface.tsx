
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport, ChatMessage } from "@/hooks/useChatSupport";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { SendHorizontal, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark messages as read when viewed by admin
  useEffect(() => {
    if (isAdmin && messages.length > 0) {
      const unreadMessages = messages.filter(msg => !msg.is_read && !msg.is_from_admin);
      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    }
  }, [isAdmin, messages, markAsRead]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage, userId);
    if (success) {
      setNewMessage("");
      // Force scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!user) {
    return <div>{t("loginRequired") || "Please log in to use chat support"}</div>;
  }
  
  // Sort messages by creation date in ascending order (oldest to newest)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
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
        className="flex-1 p-4"
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
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={(isAdmin && message.is_from_admin) || (!isAdmin && !message.is_from_admin)}
                isRTL={isRTL}
              />
            ))}
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
            onChange={(e) => setNewMessage(e.target.value)}
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
  return (
    <div className={cn(
      "flex", 
      isMine ? (isRTL ? "flex-row" : "flex-row-reverse") : "",
      "gap-2 max-w-[85%]",
      isMine ? (isRTL ? "mr-auto" : "ml-auto") : (isRTL ? "ml-auto" : "mr-auto")
    )}>
      <div className={cn(
        "rounded-lg p-3 text-sm",
        isMine ? 
          "bg-primary text-primary-foreground" : 
          "bg-muted text-muted-foreground"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs opacity-80",
          isMine ? "justify-end" : "justify-start"
        )}>
          <span>{formatDateTime(message.created_at)}</span>
          {isMine && !message.is_from_admin && (
            message.is_read ? 
              <CheckCheck className="h-3 w-3" /> : 
              <Check className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
}

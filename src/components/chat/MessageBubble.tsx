
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useChatSupport";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isRTL: boolean;
  isHighlighted: boolean;
}

// Helper function to format date
const formatDateTime = (timestamp: string) => {
  try {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (e) {
    return timestamp;
  }
};

export function MessageBubble({ message, isMine, isRTL, isHighlighted }: MessageBubbleProps) {
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


import { useState, useEffect } from "react";
import { MessageSquare, X, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport } from "@/hooks/useChatSupport";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ChatSupportButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { getUnreadCount } = useChatSupport();
  const [animate, setAnimate] = useState(false);
  
  const unreadCount = getUnreadCount();
  
  // Effect to trigger notification animation every 2 seconds when there are unread messages
  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      const interval = setInterval(() => {
        setAnimate(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setAnimate(false);
    }
  }, [unreadCount, isOpen]);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className={cn(
            "relative transition-all",
            animate && unreadCount > 0 ? "bg-muted/80" : ""
          )}
        >
          <div className={cn(
            "absolute -left-1 -top-1",
            animate && unreadCount > 0 ? "animate-fade-in" : "opacity-0"
          )}>
            <BellRing className="h-3 w-3 text-amber-500" />
          </div>
          
          <MessageSquare className={cn(
            "h-4 w-4 mr-1",
            animate && unreadCount > 0 ? "text-primary" : ""
          )} />
          {t("chatSupport") || "Chat Support"}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]",
                animate ? "animate-pulse" : ""
              )}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        className="p-0 max-w-md" 
        side="right"
      >
        <div className="flex flex-col h-full">
          <div className="p-3 border-b bg-card flex items-center justify-between">
            <h2 className="font-semibold text-sm">{t("chatSupport") || "Chat Support"}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <ChatInterface className="flex-1" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

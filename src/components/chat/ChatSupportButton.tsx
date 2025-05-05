
import { useState, useEffect } from "react";
import { MessageSquare, X, BellRing, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/AuthContext";

export function ChatSupportButton() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use the new hooks for notifications
  const { 
    unreadCount, 
    newMessageReceived, 
    setNewMessageReceived 
  } = useChatNotifications(isOpen);
  
  const [animate, setAnimate] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Effect to trigger notification animation when there are unread messages
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
  
  // Effect to trigger pulse effect when a new message is received
  useEffect(() => {
    if (newMessageReceived && !isOpen) {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 2000);
    }
  }, [newMessageReceived, isOpen]);
  
  // Ensure we stop animations when chat is opened
  useEffect(() => {
    if (isOpen) {
      setAnimate(false);
      setPulseEffect(false);
      setNewMessageReceived(false);
    }
  }, [isOpen, setNewMessageReceived]);
  
  if (!user) return null;
  
  return (
    <div className="relative">
      {/* Enhanced notification popup with better styling */}
      {newMessageReceived && unreadCount > 0 && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 z-50">
          <Card className="p-3 bg-card shadow-lg border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <span className="font-semibold text-sm">{t("newMessage") || "New Message"}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-muted/80" 
                onClick={() => setNewMessageReceived(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("clickToViewMessage") || "Click to view the message"}
            </p>
          </Card>
        </div>
      )}
      
      {/* Chat sheet with improved styling */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="sm" 
            variant={pulseEffect ? "default" : "outline"}
            className={cn(
              "relative transition-all duration-300",
              unreadCount > 0 ? "animate-pulse" : "",
              animate && unreadCount > 0 ? "bg-muted/80" : "",
              newMessageReceived ? "ring-2 ring-primary ring-offset-2" : "",
              pulseEffect ? "shadow-md shadow-primary/30" : ""
            )}
          >
            <div className={cn(
              "absolute -left-1 -top-1 transition-opacity",
              (animate && unreadCount > 0) || pulseEffect ? "opacity-100" : "opacity-0"
            )}>
              <BellRing className={cn(
                "h-3 w-3", 
                pulseEffect ? "text-primary animate-bounce" : "text-amber-500"
              )} />
            </div>
            
            <MessageSquare className={cn(
              "h-4 w-4 mr-1 transition-colors duration-300",
              (animate && unreadCount > 0) || pulseEffect ? "text-primary" : ""
            )} />
            {t("chatSupport") || "Chat Support"}
            
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className={cn(
                  "absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]",
                  animate || pulseEffect ? "animate-bounce" : "",
                  pulseEffect ? "shadow-md shadow-destructive/30" : ""
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
            <ChatInterface className="flex-1" onChatOpened={() => setIsOpen(true)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

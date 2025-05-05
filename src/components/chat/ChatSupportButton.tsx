
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, BellRing, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport } from "@/hooks/useChatSupport";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { playNotificationSound } from "@/utils/notificationUtils";
import { Card } from "@/components/ui/card";

export function ChatSupportButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { getUnreadCount, markAllAsRead, messages } = useChatSupport();
  const [animate, setAnimate] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const prevMessagesLengthRef = useRef(0);
  const prevMessagesRef = useRef<typeof messages>([]);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  const unreadCount = getUnreadCount();
  
  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
      // Also reset animations and notifications when chat is opened
      setAnimate(false);
      setShowNotification(false);
      setPulseEffect(false);
    }
  }, [isOpen, unreadCount, markAllAsRead]);
  
  // Play sound and show enhanced notification when new messages arrive
  useEffect(() => {
    // Only proceed if we have more messages than before
    if (messages.length > prevMessagesLengthRef.current) {
      // Find new messages (ones that weren't in the previous messages array)
      const newMessages = messages.filter(
        current => !prevMessagesRef.current.some(prev => prev.id === current.id)
      );
      
      // Check if any of the new messages are from admin
      const newAdminMessages = newMessages.filter(msg => msg.is_from_admin);
      
      // Only notify if there's a new message from admin and the chat isn't open
      if (!isOpen && newAdminMessages.length > 0) {
        playNotificationSound(0.5);
        setShowNotification(true);
        
        // Trigger pulse effect
        setPulseEffect(true);
        setTimeout(() => setPulseEffect(false), 2000);
        
        // Auto-hide notification after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Update references for next comparison
    prevMessagesLengthRef.current = messages.length;
    prevMessagesRef.current = [...messages];
  }, [messages, isOpen]);
  
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
    <div className="relative">
      {/* Enhanced notification popup with better styling */}
      {showNotification && unreadCount > 0 && !isOpen && (
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
                onClick={() => setShowNotification(false)}
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
              showNotification ? "ring-2 ring-primary ring-offset-2" : "",
              pulseEffect ? "shadow-md shadow-primary/30" : ""
            )}
            onClick={() => {
              if (unreadCount > 0) {
                // This will help immediately stop animations when clicking
                setAnimate(false);
                setPulseEffect(false);
              }
            }}
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
            <ChatInterface className="flex-1" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

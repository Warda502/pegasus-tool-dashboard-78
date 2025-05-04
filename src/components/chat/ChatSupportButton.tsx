
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { useLanguage } from "@/hooks/useLanguage";
import { useChatSupport } from "@/hooks/useChatSupport";
import { Badge } from "@/components/ui/badge";

export function ChatSupportButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { getUnreadCount } = useChatSupport();
  
  const unreadCount = getUnreadCount();
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="relative"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {t("chatSupport") || "Chat Support"}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
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


import { useState } from "react";
import { UserChatList } from "@/components/chat/UserChatList";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatSupport() {
  const { t } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  
  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-4">
        {/* User list (sidebar) */}
        <Card className="overflow-hidden h-full">
          <UserChatList 
            onSelectUser={setSelectedUserId} 
            selectedUserId={selectedUserId} 
          />
        </Card>
        
        {/* Chat interface (main content) */}
        <Card className="lg:col-span-2 overflow-hidden h-full">
          {selectedUserId ? (
            <ChatInterface userId={selectedUserId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium mb-2">{t("selectConversation") || "Select a Conversation"}</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {t("selectUserDescription") || "Choose a user from the list to view and respond to their messages."}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

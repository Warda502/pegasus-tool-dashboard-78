
import { useState } from "react";
import { useChatSupport } from "@/hooks/useChatSupport";
import { useLanguage } from "@/hooks/useLanguage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserChatListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId?: string;
  className?: string;
}

export function UserChatList({ onSelectUser, selectedUserId, className }: UserChatListProps) {
  const { t } = useLanguage();
  const { getUsersWithMessages, loading } = useChatSupport();
  const [searchQuery, setSearchQuery] = useState("");
  
  const usersWithMessages = getUsersWithMessages().filter(user => 
    user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d');
    } catch (e) {
      return "";
    }
  };
  
  const truncateMessage = (message: string, maxLength = 30) => {
    return message.length > maxLength ? 
      `${message.substring(0, maxLength)}...` : 
      message;
  };
  
  return (
    <div className={cn("flex flex-col h-full border-r", className)}>
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold mb-2">{t("conversations") || "Conversations"}</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchUsers") || "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <p className="text-sm text-muted-foreground">{t("loading") || "Loading..."}</p>
          </div>
        ) : usersWithMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 
                t("noSearchResults") || "No users match your search" : 
                t("noConversations") || "No conversations yet"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {usersWithMessages.map((user) => (
              <Button
                key={user.userId}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-4 py-3 h-auto rounded-none",
                  selectedUserId === user.userId ? "bg-accent" : "hover:bg-accent/50"
                )}
                onClick={() => onSelectUser(user.userId)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-sm truncate max-w-[150px]">{user.userEmail}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(user.lastMessage.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between w-full mt-1">
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user.lastMessage.is_from_admin ? "You: " : ""}
                      {truncateMessage(user.lastMessage.message)}
                    </span>
                    {user.unreadCount > 0 && (
                      <Badge variant="default" className="text-[10px] h-5">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

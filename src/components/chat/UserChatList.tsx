import { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Check, CheckCheck, CircleDot, CircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useObservePresence } from "@/utils/chatPresenceUtils";
import { useAuth } from "@/hooks/auth/AuthContext";

interface UserChatListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId?: string;
  className?: string;
}

interface UserWithMessages {
  userId: string;
  userEmail: string;
  lastMessage: any;
  unreadCount: number;
}

export function UserChatList({ onSelectUser, selectedUserId, className }: UserChatListProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { messages, loading } = useChatMessages(); // Get all messages
  const [searchQuery, setSearchQuery] = useState("");
  
  // Group messages by user
  const usersWithMessages = useMemo(() => {
    const userGroups: Record<string, UserWithMessages> = {};
    
    messages.forEach(msg => {
      const userId = msg.user_id;
      const userEmail = msg.user_email || 'Unknown User';
      
      if (!userGroups[userId]) {
        userGroups[userId] = {
          userId,
          userEmail,
          lastMessage: msg,
          unreadCount: msg.is_from_admin || msg.is_read ? 0 : 1
        };
      } else {
        // Update last message if current is newer
        if (new Date(msg.created_at) > new Date(userGroups[userId].lastMessage.created_at)) {
          userGroups[userId].lastMessage = msg;
        }
        // Increment unread count
        if (!msg.is_from_admin && !msg.is_read) {
          userGroups[userId].unreadCount += 1;
        }
      }
    });
    
    return Object.values(userGroups)
      .filter(user => user.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // Sort by unread count first
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        // Then by most recent message
        return new Date(b.lastMessage.created_at).getTime() - 
              new Date(a.lastMessage.created_at).getTime();
      });
  }, [messages, searchQuery]);
  
  const formatDate = (timestamp: string) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    // If message is from today, show time
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a');
    }
    
    // If message is from this week, show day name
    const diffTime = Math.abs(today.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return format(messageDate, 'EEEE');
    }
    
    // Otherwise show date
    return format(messageDate, 'MMM d');
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
            {usersWithMessages.map((userData) => (
              <UserChatListItem 
                key={userData.userId}
                userData={userData}
                isSelected={selectedUserId === userData.userId}
                onSelect={() => onSelectUser(userData.userId)}
                formatDate={formatDate}
                truncateMessage={truncateMessage}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface UserChatListItemProps {
  userData: UserWithMessages;
  isSelected: boolean;
  onSelect: () => void;
  formatDate: (date: string) => string;
  truncateMessage: (message: string, maxLength?: number) => string;
}

function UserChatListItem({ 
  userData, 
  isSelected, 
  onSelect, 
  formatDate, 
  truncateMessage 
}: UserChatListItemProps) {
  const { t } = useLanguage();
  
  // Use presence hook to get real-time status
  const userPresence = useObservePresence(userData.userId);
  const isOnline = userPresence?.status === 'online';
  
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-4 py-3 h-auto rounded-none transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        userData.unreadCount > 0 ? "bg-muted/40" : ""
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col items-start w-full">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-1">
            <span className={cn(
              "font-medium text-sm truncate max-w-[150px]",
              userData.unreadCount > 0 ? "font-semibold" : ""
            )}>
              {userData.userEmail}
            </span>
            {isOnline ? (
              <CircleDot className="h-3 w-3 text-green-500" />
            ) : (
              <CircleOff className="h-3 w-3 text-gray-400" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(userData.lastMessage.created_at)}
          </span>
        </div>
        <div className="flex justify-between w-full mt-1">
          <span className={cn(
            "text-xs truncate max-w-[150px]",
            userData.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {userData.lastMessage.is_from_admin && (
              <span className="flex items-center gap-1">
                {t("you") || "You"}:
                {userData.lastMessage.is_read ? 
                  <CheckCheck className="h-3 w-3 text-primary" /> : 
                  <Check className="h-3 w-3 text-muted-foreground" />
                }
              </span>
            )}
            {truncateMessage(userData.lastMessage.message)}
          </span>
          {userData.unreadCount > 0 && (
            <Badge 
              variant="default" 
              className={cn(
                "text-[10px] h-5",
                userData.unreadCount > 0 ? "animate-pulse" : ""
              )}
            >
              {userData.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );
}

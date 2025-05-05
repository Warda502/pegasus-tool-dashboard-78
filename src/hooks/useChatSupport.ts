
import { useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useChatMessages } from "./useChatMessages";
import { useChatNotifications } from "./useChatNotifications";

export interface ChatMessage {
  id: string;
  user_id: string;
  admin_id: string | null;
  message: string;
  created_at: string;
  is_from_admin: boolean;
  is_read: boolean;
  user_email?: string; // For UI display purposes
}

export const useChatSupport = (userId?: string) => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    markAsRead, 
    markAllAsRead 
  } = useChatMessages(userId);
  
  const { 
    unreadCount, 
    newMessageReceived, 
    setNewMessageReceived,
    fetchUnreadCount 
  } = useChatNotifications();

  // For admin UI, fetch user email for each message
  const enhanceMessagesWithUserInfo = useCallback(async (rawMessages: any[]): Promise<ChatMessage[]> => {
    if (!isAdmin || rawMessages.length === 0) return rawMessages as ChatMessage[];
    
    // Extract unique user IDs
    const userIds = Array.from(new Set(rawMessages.map(msg => msg.user_id)));
    
    // Fetch user emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);
    
    // Create user ID to email mapping
    const userEmailMap = users?.reduce((acc, user) => {
      acc[user.id] = user.email;
      return acc;
    }, {} as Record<string, string>) || {};
    
    // Add user email to each message
    return rawMessages.map(msg => ({
      ...msg,
      user_email: userEmailMap[msg.user_id] || 'Unknown User'
    }));
  }, [isAdmin]);

  // Group messages by user
  const getUsersWithMessages = useCallback(() => {
    if (!isAdmin) return [];
    
    const userGroups = messages.reduce((acc, msg) => {
      const userId = msg.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userEmail: msg.user_email || 'Unknown User',
          lastMessage: msg,
          unreadCount: msg.is_from_admin || msg.is_read ? 0 : 1
        };
      } else {
        // Update last message if current is newer
        if (new Date(msg.created_at) > new Date(acc[userId].lastMessage.created_at)) {
          acc[userId].lastMessage = msg;
        }
        // Increment unread count
        if (!msg.is_from_admin && !msg.is_read) {
          acc[userId].unreadCount += 1;
        }
      }
      return acc;
    }, {} as Record<string, {
      userId: string;
      userEmail: string;
      lastMessage: ChatMessage;
      unreadCount: number;
    }>);
    
    return Object.values(userGroups).sort((a, b) => {
      // Sort by unread count first
      if (b.unreadCount !== a.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      // Then by most recent message
      return new Date(b.lastMessage.created_at).getTime() - 
             new Date(a.lastMessage.created_at).getTime();
    });
  }, [isAdmin, messages]);

  // Getter for unread count
  const getUnreadCount = useCallback(() => {
    return unreadCount;
  }, [unreadCount]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    markAllAsRead,
    fetchMessages: fetchUnreadCount, // Alias for backward compatibility
    getUnreadCount,
    getUsersWithMessages,
    enhanceMessagesWithUserInfo,
    newMessageReceived,
    setNewMessageReceived
  };
};


import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { toast } from "@/components/ui/sonner";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If not admin and userId provided, filter by user ID
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      } else if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const enhancedMessages = await enhanceMessagesWithUserInfo(data);
        setMessages(enhancedMessages);
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId, user, enhanceMessagesWithUserInfo]);

  // Send a new message
  const sendMessage = async (messageText: string, recipientId?: string) => {
    if (!user) return false;
    
    try {
      const newMessage = {
        user_id: isAdmin ? recipientId! : user.id,
        admin_id: isAdmin ? user.id : null,
        message: messageText,
        is_from_admin: isAdmin,
        is_read: false
      };
      
      const { error } = await supabase.from('chat_messages').insert(newMessage);
      
      if (error) throw error;
      
      toast(t("messageSent") || "Message sent");
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast(t("errorSendingMessage") || "Error sending message", { 
        description: err instanceof Error ? err.message : String(err) 
      });
      return false;
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!isAdmin) return false;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, is_read: true } : msg)
      );
      
      return true;
    } catch (err) {
      console.error("Error marking message as read:", err);
      return false;
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('chat_message_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        async () => {
          // Refetch messages when changes occur
          await fetchMessages();
        }
      )
      .subscribe();
    
    // Initial fetch
    fetchMessages();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  // Get unread message count for admins
  const getUnreadCount = useCallback(() => {
    return messages.filter(msg => !msg.is_read && !msg.is_from_admin).length;
  }, [messages]);

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

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    fetchMessages,
    getUnreadCount,
    getUsersWithMessages
  };
};

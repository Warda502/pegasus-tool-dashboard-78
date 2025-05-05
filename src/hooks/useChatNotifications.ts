
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./useChatSupport";
import { useAuth } from "./auth/AuthContext";
import { playNotificationSound } from "@/utils/notificationUtils";

export const useChatNotifications = (chatOpen: boolean = false) => {
  const { user, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [newMessageReceived, setNewMessageReceived] = useState<boolean>(false);
  const previousMessagesRef = useRef<ChatMessage[]>([]);
  
  // Get unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      // For admin: count messages FROM users (not from admin) that are unread
      // For regular users: count messages FROM admin that are unread
      if (isAdmin) {
        query = query.eq('is_from_admin', false);
      } else {
        query = query
          .eq('user_id', user.id)
          .eq('is_from_admin', true);
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      
      setUnreadCount(count || 0);
      return count || 0;
    } catch (err) {
      console.error("Error fetching unread count:", err);
      return 0;
    }
  }, [user, isAdmin]);

  // Monitor for new messages in real-time
  useEffect(() => {
    if (!user) return;
    
    // Initial count
    fetchUnreadCount();
    
    // Listen for new messages
    let channelFilter = {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    };
    
    // Add filter for the current user
    if (!isAdmin) {
      channelFilter = {
        ...channelFilter,
        filter: `user_id=eq.${user.id}`
      };
    }
    
    const channel = supabase
      .channel('chat-notifications')
      .on('postgres_changes', channelFilter, async (payload) => {
        const newMessage = payload.new as ChatMessage;
        
        // For admin: only notify for messages from users
        // For users: only notify for messages from admin
        const shouldNotify = isAdmin 
          ? !newMessage.is_from_admin 
          : (newMessage.is_from_admin && newMessage.user_id === user.id);
          
        if (shouldNotify) {
          // Don't notify if the chat is already open
          if (!chatOpen) {
            playNotificationSound(0.5);
            setNewMessageReceived(true);
            
            // Auto-hide notification after 5 seconds
            setTimeout(() => {
              setNewMessageReceived(false);
            }, 5000);
          }
          
          // Update unread count
          fetchUnreadCount();
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, chatOpen, fetchUnreadCount]);

  // Reset notification when chat is opened
  useEffect(() => {
    if (chatOpen) {
      setNewMessageReceived(false);
    }
  }, [chatOpen]);

  return {
    unreadCount,
    newMessageReceived,
    setNewMessageReceived,
    fetchUnreadCount
  };
};

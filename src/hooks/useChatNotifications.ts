
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
    if (!user) return 0;
    
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
      
      if (error) {
        console.error("Error fetching unread count:", error.message);
        return unreadCount; // Return the current value if there's an error
      }
      
      // Update state only if the count has changed to avoid unnecessary renders
      if (count !== unreadCount) {
        setUnreadCount(count || 0);
      }
      
      return count || 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error fetching unread count:", errorMessage);
      return unreadCount; // Return the current value if there's an error
    }
  }, [user, isAdmin, unreadCount]);

  // Monitor for new messages in real-time
  useEffect(() => {
    if (!user) return;
    
    // Initial count
    fetchUnreadCount();
    
    // Set up channel for real-time updates
    const channel = supabase.channel('chat-notifications');
    
    // Listen for INSERT events
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        ...(isAdmin ? {} : { filter: `user_id=eq.${user.id}` })
      },
      (payload) => {
        try {
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
        } catch (error) {
          console.error("Error processing chat notification:", error);
        }
      }
    );
    
    // Listen for UPDATE events (when messages are marked as read)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        ...(isAdmin ? {} : { filter: `user_id=eq.${user.id}` })
      },
      (payload) => {
        try {
          const updatedMessage = payload.new as ChatMessage;
          
          // If a message was marked as read, update the unread count
          if (updatedMessage.is_read) {
            fetchUnreadCount();
          }
        } catch (error) {
          console.error("Error processing chat update:", error);
        }
      }
    );
    
    // Subscribe to the channel with error handling
    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error("Error connecting to chat notifications channel");
      }
    });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, chatOpen, fetchUnreadCount]);

  // Reset notification when chat is opened
  useEffect(() => {
    if (chatOpen && user) {
      setNewMessageReceived(false);
      
      // Re-fetch unread count when chat is opened
      fetchUnreadCount();
    }
  }, [chatOpen, fetchUnreadCount, user]);

  return {
    unreadCount,
    newMessageReceived,
    setNewMessageReceived,
    fetchUnreadCount
  };
};

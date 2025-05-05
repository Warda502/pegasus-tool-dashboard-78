
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./useChatSupport";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "./useLanguage";

export const useChatMessages = (userId?: string) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  
  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      // Filter by user ID if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setMessages(data as ChatMessage[]);
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Send a new message
  const sendMessage = async (messageText: string, recipientId?: string) => {
    if (!messageText.trim()) return false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast(t("loginRequired") || "Please log in to send messages");
        return false;
      }
      
      const newMessage = {
        user_id: userId || session.user.id,
        admin_id: session.user.id,
        message: messageText.trim(),
        is_from_admin: !userId, // If userId provided, we're admin sending to user
        is_read: false
      };
      
      const { error } = await supabase.from('chat_messages').insert(newMessage);
      
      if (error) throw error;
      
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
  
  // Mark all messages as read for the current context
  const markAllAsRead = async (isAdmin: boolean) => {
    try {
      // For admin viewing user messages: mark messages FROM user as read
      // For user viewing admin messages: mark messages FROM admin as read
      const unreadMessages = messages.filter(msg => 
        !msg.is_read && 
        ((isAdmin && !msg.is_from_admin) || (!isAdmin && msg.is_from_admin))
      );
      
      if (unreadMessages.length === 0) return true;
      
      const messageIds = unreadMessages.map(msg => msg.id);
      
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', messageIds);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg)
      );
      
      return true;
    } catch (err) {
      console.error("Error marking all messages as read:", err);
      return false;
    }
  };

  // Set up real-time updates with proper filtering
  useEffect(() => {
    if (!userId) return;
    
    console.log(`Setting up real-time chat for ${userId ? 'specific user' : 'all users'}`);
    
    // Initial fetch
    fetchMessages();
    
    // Set up channel for real-time updates
    const channelOptions = {
      event: 'INSERT' as const,
      schema: 'public',
      table: 'chat_messages',
      ...(userId ? { filter: `user_id=eq.${userId}` } : {})
    };
    
    // Subscribe to changes using the correct method signature for Supabase channels
    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        channelOptions,
        (payload) => {
          console.log('Chat message change detected:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            console.log('New message:', newMessage);
            
            // Only add to state if it matches our filter
            if (!userId || newMessage.user_id === userId) {
              setMessages(prev => [...prev, newMessage]);
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage;
            console.log('Updated message:', updatedMessage);
            
            setMessages(prev => 
              prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    markAllAsRead
  };
};

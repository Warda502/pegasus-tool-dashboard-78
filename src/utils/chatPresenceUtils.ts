
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// Types for presence data
export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline';
  last_seen_at: string;
  is_typing: boolean;
}

// Channel name constants
export const CHAT_PRESENCE_CHANNEL = 'chat_presence';

/**
 * Initialize presence tracking for a user
 * @param userId The user ID to track presence for
 * @returns Functions to update user status
 */
export const usePresenceTracking = (userId?: string) => {
  const [channel, setChannel] = useState<any>(null);
  
  // Initialize presence channel when component mounts
  useEffect(() => {
    if (!userId) return;
    
    const presenceChannel = supabase.channel(CHAT_PRESENCE_CHANNEL);
    
    const initialPresence: UserPresence = {
      user_id: userId,
      status: 'online',
      last_seen_at: new Date().toISOString(),
      is_typing: false
    };
    
    // Subscribe to the channel and track initial presence
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track(initialPresence);
      }
    });
    
    setChannel(presenceChannel);
    
    return () => {
      // Update status to offline before unsubscribing
      if (presenceChannel) {
        const offlinePresence = { ...initialPresence, status: 'offline' };
        presenceChannel.track(offlinePresence).then(() => {
          supabase.removeChannel(presenceChannel);
        });
      }
    };
  }, [userId]);
  
  // Function to update typing status
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!channel || !userId) return;
    
    await channel.track({
      user_id: userId,
      status: 'online',
      last_seen_at: new Date().toISOString(),
      is_typing: isTyping
    });
  };
  
  return { updateTypingStatus };
};

/**
 * Hook to observe another user's presence
 * @param observedUserId The user ID to observe presence for
 * @returns The presence state of the observed user
 */
export const useObservePresence = (observedUserId?: string) => {
  const [presenceState, setPresenceState] = useState<UserPresence | null>(null);
  
  useEffect(() => {
    if (!observedUserId) return;
    
    const channel = supabase.channel(CHAT_PRESENCE_CHANNEL);
    
    // Handle presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        updatePresenceFromState(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Check if the joined user is the one we're observing
        const relevantPresence = newPresences.find((p: any) => 
          p.user_id === observedUserId
        );
        if (relevantPresence) {
          extractAndSetUserPresence(relevantPresence);
        }
      })
      .on('presence', { event: 'leave' }, () => {
        // When a leave event occurs, check the current state again
        const state = channel.presenceState();
        updatePresenceFromState(state);
      })
      .subscribe();
    
    // Helper function to extract and validate presence data
    function extractAndSetUserPresence(presenceData: any) {
      if (presenceData && 
          typeof presenceData === 'object' &&
          'user_id' in presenceData &&
          'status' in presenceData &&
          'last_seen_at' in presenceData &&
          'is_typing' in presenceData) {
        
        const typedPresence: UserPresence = {
          user_id: presenceData.user_id,
          status: presenceData.status,
          last_seen_at: presenceData.last_seen_at,
          is_typing: presenceData.is_typing
        };
        
        setPresenceState(typedPresence);
      }
    }
    
    // Helper function to update presence state from the channel state
    function updatePresenceFromState(state: Record<string, any[]>) {
      // Find presence entries for the observed user
      const allPresences: any[] = Object.values(state).flat();
      
      // Find the user we're observing
      const userPresenceObj = allPresences.find((p: any) => p.user_id === observedUserId);
      
      if (userPresenceObj) {
        extractAndSetUserPresence(userPresenceObj);
      } else {
        // If no presence found, assume offline
        setPresenceState({
          user_id: observedUserId,
          status: 'offline',
          last_seen_at: new Date().toISOString(),
          is_typing: false
        });
      }
    }
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [observedUserId]);
  
  return presenceState;
};

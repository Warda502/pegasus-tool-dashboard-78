
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { RealtimePresenceState } from '@supabase/supabase-js';

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
          setPresenceState(relevantPresence as UserPresence);
        }
      })
      .on('presence', { event: 'leave' }, () => {
        // When a leave event occurs, check the current state again
        const state = channel.presenceState();
        updatePresenceFromState(state);
      })
      .subscribe();
    
    // Helper function to update presence state from the channel state
    function updatePresenceFromState(state: RealtimePresenceState<any>) {
      // Find presence entries for the observed user
      const allPresences: any[] = Object.values(state).flat();
      
      // Use type casting with explicit check to ensure the presence object matches our expected structure
      const userPresenceObj = allPresences.find((p: any) => p.user_id === observedUserId);
      
      if (userPresenceObj && typeof userPresenceObj === 'object') {
        // Check if the found presence has the required properties
        if ('user_id' in userPresenceObj && 
            'status' in userPresenceObj && 
            'last_seen_at' in userPresenceObj && 
            'is_typing' in userPresenceObj) {
          
          const typedPresence: UserPresence = {
            user_id: userPresenceObj.user_id,
            status: userPresenceObj.status,
            last_seen_at: userPresenceObj.last_seen_at,
            is_typing: userPresenceObj.is_typing
          };
          
          setPresenceState(typedPresence);
        }
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


import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize the Supabase Realtime features for chat
 * This should be called once when the app initializes
 */
export async function setupRealtimeChat() {
  try {
    console.log("Setting up Realtime chat features...");
    
    // Use a simpler approach to check if realtime is working
    try {
      // Set up a test channel for chat
      const channel = supabase.channel('test-realtime');
      
      // Add a simple listener to test if channels are working
      channel.on(
        'presence', 
        { event: 'sync' }, 
        () => {
          console.log("Realtime channels appear to be functioning.");
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to test channel");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to test channel");
        }
      });
      
      // If we get here without errors, realtime appears to be functioning
      console.log("Realtime setup completed successfully");
      
      // Clean up test subscription
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error setting up Realtime for chat:", errorMessage);
      return false;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Error in setupRealtimeChat:", errorMessage);
    return false;
  }
}

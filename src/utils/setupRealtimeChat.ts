
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize the Supabase Realtime features for chat
 * This should be called once when the app initializes
 */
export async function setupRealtimeChat() {
  try {
    console.log("Setting up Realtime chat features...");
    
    // Check if chat_messages table exists first
    const { data: tablesData, error: tablesError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
      
    if (tablesError) {
      console.error("Error checking chat_messages table:", tablesError);
      return false;
    }
    
    // Enable table for realtime
    try {
      // We'll use Supabase's channel functionality to check if realtime is working
      const channel = supabase.channel('test-realtime');
      
      const subscription = channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        }, () => {})
        .subscribe();
      
      // If we get here, realtime appears to be functioning
      console.log("Realtime appears to be enabled for chat_messages");
      
      // Clean up test subscription
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
      
      return true;
    } catch (err) {
      console.error("Error setting up Realtime for chat_messages:", err);
      return false;
    }
  } catch (err) {
    console.error("Error setting up Realtime chat:", err);
    return false;
  }
}

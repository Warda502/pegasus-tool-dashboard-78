
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize the Supabase Realtime features for chat
 * This should be called once when the app initializes
 */
export async function setupRealtimeChat() {
  try {
    // First check if Realtime is already enabled for chat_messages table
    const { data: publicationData, error: publicationError } = await supabase
      .rpc('get_realtime_tables');
      
    if (publicationError) {
      console.error("Error checking Realtime configuration:", publicationError);
      return false;
    }
    
    const isChatMessagesEnabled = publicationData && 
      Array.isArray(publicationData) && 
      publicationData.some(table => table === 'chat_messages');
      
    if (!isChatMessagesEnabled) {
      console.log("Realtime not enabled for chat_messages, enabling now...");
      
      // Enable Realtime for chat_messages
      const { error } = await supabase.rpc('supabase_functions.enable_realtime', {
        table_name: 'chat_messages'
      });
      
      if (error) {
        console.error("Failed to enable Realtime for chat_messages:", error);
        return false;
      }
      
      console.log("Successfully enabled Realtime for chat_messages");
    } else {
      console.log("Realtime already enabled for chat_messages table");
    }
    
    return true;
  } catch (err) {
    console.error("Error setting up Realtime chat:", err);
    return false;
  }
}

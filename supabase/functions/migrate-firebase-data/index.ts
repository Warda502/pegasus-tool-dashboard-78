
// This Edge Function will securely migrate data from Firebase to Supabase
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.2";

// Your Firebase and Supabase configuration
const FIREBASE_URL = Deno.env.get('FIREBASE_URL') || 'https://pegasus-tool-database-default-rtdb.firebaseio.com';
const FIREBASE_API_KEY = Deno.env.get('FIREBASE_API_KEY') || 'AIzaSyAoZXmXFEvXAujyaI1ahFolBf06in5R4P4';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://sxigocnatqgqgiedrgue.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log("Edge function initialized");
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Service role key configured: ${SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No'}`);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client with service role for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Helper function to fetch data from Firebase
async function fetchFromFirebase(path: string, idToken: string) {
  const url = `${FIREBASE_URL}/${path}?auth=${idToken}`;
  console.log(`Fetching from Firebase: ${path}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Firebase fetch error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch from Firebase: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Successfully fetched data from Firebase: ${path}`);
    return data;
  } catch (error) {
    console.error(`Error fetching from Firebase (${path}):`, error);
    throw error;
  }
}

// Helper function to sign in to Firebase
async function firebaseSignIn(email: string, password: string) {
  console.log(`Authenticating with Firebase using email: ${email}`);
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Firebase auth error:", errorData);
      throw new Error(`Firebase authentication failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const authData = await response.json();
    console.log("Firebase authentication successful");
    return authData;
  } catch (error) {
    console.error('Firebase sign-in error:', error);
    throw error;
  }
}

// Main migration function
async function migrateData(adminEmail: string, adminPassword: string) {
  console.log('Starting migration process...');
  let stats = {
    users: { total: 0, migrated: 0, errors: 0 },
    operations: { total: 0, migrated: 0, errors: 0 }
  };
  
  try {
    // Step 1: Sign in to Firebase as admin
    console.log('Authenticating with Firebase...');
    const authData = await firebaseSignIn(adminEmail, adminPassword);
    const idToken = authData.idToken;
    const localId = authData.localId;
    
    if (!idToken) {
      throw new Error('Failed to get Firebase authentication token');
    }
    
    // Step 2: Fetch users data
    console.log('Fetching users from Firebase...');
    const usersData = await fetchFromFirebase('users.json', idToken);
    
    if (!usersData) {
      throw new Error('No users data found in Firebase');
    }
    
    // Step 3: Migrate users
    console.log('Migrating users to Supabase...');
    const userIds = Object.keys(usersData);
    stats.users.total = userIds.length;
    
    for (const firebaseId of userIds) {
      const userData = usersData[firebaseId];
      
      try {
        // Create auth user in Supabase (this is a simplified version, in production we'd need to handle this differently)
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.Email,
          password: userData.Password || 'tempPassword123', // You'd want a better password strategy
          email_confirm: true
        });
        
        if (authError) {
          console.error(`Error creating auth user for ${userData.Email}:`, authError);
          stats.users.errors++;
          continue;
        }
        
        // Insert user data
        const { error: insertError } = await supabaseAdmin.from('users').insert({
          id: authUser.user.id,
          name: userData.Name,
          email: userData.Email,
          password: userData.Password,
          phone: userData.Phone,
          country: userData.Country,
          activate: userData.Activate,
          block: userData.Block,
          credits: userData.Credits,
          user_type: userData.User_Type,
          email_type: userData.Email_Type,
          expiry_time: userData.Expiry_Time,
          start_date: userData.Start_Date,
          hwid: userData.Hwid || 'Null',
          uid: authUser.user.id
        });
        
        if (insertError) {
          console.error(`Error inserting user data for ${userData.Email}:`, insertError);
          stats.users.errors++;
          continue;
        }
        
        stats.users.migrated++;
        
        // Map Firebase ID to Supabase ID for operations migration
        userData.supabaseId = authUser.user.id;
      } catch (error) {
        console.error(`Error processing user ${firebaseId}:`, error);
        stats.users.errors++;
      }
    }
    
    // Step 4: Fetch operations data
    console.log('Fetching operations from Firebase...');
    const operationsData = await fetchFromFirebase('operations.json', idToken);
    
    if (!operationsData) {
      console.log('No operations data found in Firebase');
      return stats;
    }
    
    // Step 5: Migrate operations
    console.log('Migrating operations to Supabase...');
    const operationIds = Object.keys(operationsData);
    stats.operations.total = operationIds.length;
    
    for (const firebaseOpId of operationIds) {
      const opData = operationsData[firebaseOpId];
      try {
        // Find the Supabase user ID that corresponds to this operation's UID
        const userId = opData.UID;
        const correspondingUser = Object.values(usersData).find(
          (u: any) => u.UID === userId
        ) as any;
        
        const supabaseUserId = correspondingUser?.supabaseId;
        
        if (!supabaseUserId) {
          console.warn(`Could not find Supabase user ID for operation ${firebaseOpId}, using original UID`);
        }
        
        // Insert operation
        const { error: insertError } = await supabaseAdmin.from('operations').insert({
          id: firebaseOpId, // Using Firebase operation ID as Supabase ID
          operation_type: opData.OprationTypes,
          phone_sn: opData.Phone_SN,
          brand: opData.Brand,
          model: opData.Model,
          imei: opData.Imei,
          username: opData.UserName,
          credit: opData.Credit,
          time: opData.Time ? new Date(opData.Time) : null,
          status: opData.Status,
          android: opData.Android,
          baseband: opData.Baseband,
          carrier: opData.Carrier,
          security_patch: opData.Security_Patch,
          uid: supabaseUserId || userId,
          hwid: opData.Hwid,
          log_operation: opData.LogOpration
        });
        
        if (insertError) {
          console.error(`Error inserting operation data for ${firebaseOpId}:`, insertError);
          stats.operations.errors++;
          continue;
        }
        
        stats.operations.migrated++;
      } catch (error) {
        console.error(`Error processing operation ${firebaseOpId}:`, error);
        stats.operations.errors++;
      }
    }
    
    console.log('Migration completed successfully!');
    return stats;
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Check if service role key is available
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Service role key is missing!');
    return new Response(
      JSON.stringify({ success: false, error: 'Service role key is required but not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Starting migration for admin user: ${email}`);
    const results = await migrateData(email, password);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Migration completed',
        stats: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in migration function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during migration'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

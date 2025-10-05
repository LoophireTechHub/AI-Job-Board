// Supabase Client for Client-Side Components

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Creating Supabase client with:', {
    url: supabaseUrl,
    urlType: typeof supabaseUrl,
    keyExists: !!supabaseKey,
    keyType: typeof supabaseKey,
  });

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

// Supabase Client for Client-Side Components

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'present' : 'MISSING',
      key: supabaseKey ? 'present' : 'MISSING'
    });
    throw new Error('Supabase environment variables are not configured');
  }

  // Trim any whitespace
  const cleanUrl = supabaseUrl.trim();
  const cleanKey = supabaseKey.trim();

  return createBrowserClient(cleanUrl, cleanKey);
}

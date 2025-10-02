// Supabase Client for Client-Side Components

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging
  console.log('Supabase Client Debug:', {
    urlExists: !!supabaseUrl,
    urlLength: supabaseUrl?.length,
    urlFirst20: supabaseUrl?.substring(0, 20),
    keyExists: !!supabaseKey,
    keyLength: supabaseKey?.length,
    keyFirst20: supabaseKey?.substring(0, 20),
  });

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

  console.log('Creating Supabase client with:', {
    url: cleanUrl,
    keyLength: cleanKey.length
  });

  return createBrowserClient(cleanUrl, cleanKey);
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInWithLinkedIn(redirectTo?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=${redirectTo || '/jobs'}`,
      scopes: 'openid profile email',
    },
  });

  if (error) {
    console.error('LinkedIn OAuth error:', error);
    throw error;
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCandidateProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching candidate profile:', error);
    return null;
  }

  return data;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/jobs';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Check if candidate profile exists
      const { data: profile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      // If no profile exists, create one from OAuth data
      if (!profile) {
        const userMetadata = data.user.user_metadata;

        await supabase.from('candidate_profiles').insert({
          user_id: data.user.id,
          email: data.user.email!,
          first_name: userMetadata.given_name || userMetadata.full_name?.split(' ')[0] || '',
          last_name: userMetadata.family_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '',
          profile_picture_url: userMetadata.avatar_url || userMetadata.picture,
          linkedin_id: userMetadata.provider_id,
          linkedin_url: userMetadata.custom_claims?.sub ? `https://www.linkedin.com/in/${userMetadata.custom_claims.sub}` : null,
          headline: userMetadata.headline || null,
          profile_completed: false,
        });
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to home if something went wrong
  return NextResponse.redirect(`${origin}/`);
}

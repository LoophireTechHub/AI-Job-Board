'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
        const handlePasswordReset = async () => {
                const supabase = createClient();

                // Check if there's a reset token in the URL
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                          // Redirect to dashboard or password update form
                  router.push('/dashboard');
                } else {
                          // No session, redirect to signin
                  router.push('/auth/signin');
                }
        };

                handlePasswordReset();
  }, [router]);

  return (
        <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                      <p>Processing password reset...</p>p>
                {error && <p className="text-red-500 mt-2">{error}</p>p>}
                    </div>div>
            </div>div>
      );
}</div>

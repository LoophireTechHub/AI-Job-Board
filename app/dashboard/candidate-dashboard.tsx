'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CandidateDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your candidate dashboard. Explore job opportunities and manage your applications.</p>
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Candidate dashboard features coming soon...</p>
        </div>
      </div>
    </div>
  );
}

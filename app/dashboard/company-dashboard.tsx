'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const JobPostingManager = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Job Postings</h2>
    <p className="text-gray-600">Job posting management coming soon...</p>
  </div>
);

const ApplicantReview = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Applicants</h2>
    <p className="text-gray-600">Applicant review interface coming soon...</p>
  </div>
);

const AIScreeningTool = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">AI Screening</h2>
    <p className="text-gray-600">AI screening tool coming soon...</p>
  </div>
);

export default function CompanyDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'postings' | 'applicants' | 'screening'>('postings');

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage job postings, review applicants, and use AI screening</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('postings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'postings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applicants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('screening')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'screening'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Screening
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'postings' && <JobPostingManager />}
          {activeTab === 'applicants' && <ApplicantReview />}
          {activeTab === 'screening' && <AIScreeningTool />}
        </div>
      </div>
    </div>
  );
}

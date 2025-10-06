'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    candidatesScreened: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (!user) {
          router.push('/auth/signin');
          return;
        }

        setUser(user);

        // Fetch job stats
        const { count: activeJobCount, error: jobCountError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('status', 'active');

        if (jobCountError) {
          console.error('Error fetching job count:', jobCountError);
        }

        // First get all job IDs for this user
        const { data: userJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('created_by', user.id);

        let totalApplicationCount = 0;
        if (!jobsError && userJobs && userJobs.length > 0) {
          const jobIds = userJobs.map(job => job.id);
          const { count: appCount, error: appCountError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds);

          if (appCountError) {
            console.error('Error fetching application count:', appCountError);
          } else {
            totalApplicationCount = appCount || 0;
          }
        }

        setStats({
          activeJobs: activeJobCount || 0,
          totalApplications: totalApplicationCount,
          candidatesScreened: 0, // TODO: Implement when AI screening is ready
        });

        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        variant="page"
        title="Authentication Error"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to your Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your job postings and applications with AI-powered screening
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>Create and manage job listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.activeJobs}</p>
              <p className="text-sm text-gray-500 mt-2">Active jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
              <p className="text-sm text-gray-500 mt-2">Total applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Screening</CardTitle>
              <CardDescription>Automated candidate evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.candidatesScreened}</p>
              <p className="text-sm text-gray-500 mt-2">Candidates screened</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to get up and running</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Create your first job posting</h3>
                  <p className="text-sm text-gray-600 mb-2">Add a job listing to start receiving applications</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => router.push('/dashboard/jobs/new')}>
                      <Plus className="mr-1 h-3 w-3" />
                      New Job
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/jobs')}>
                      <Briefcase className="mr-1 h-3 w-3" />
                      View Jobs
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Configure AI screening questions</h3>
                  <p className="text-sm text-gray-600">Let Claude AI generate interview questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Review AI-screened candidates</h3>
                  <p className="text-sm text-gray-600">See AI analysis and scores for each applicant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

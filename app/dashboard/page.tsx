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
    applicationsThisWeek: 0,
    applicationsByStatus: {
      submitted: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
    },
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
        let applicationsThisWeekCount = 0;
        const statusCounts = {
          submitted: 0,
          screening: 0,
          interviewing: 0,
          offer: 0,
        };

        if (!jobsError && userJobs && userJobs.length > 0) {
          const jobIds = userJobs.map(job => job.id);

          // Total applications
          const { count: appCount, error: appCountError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds);

          if (!appCountError) {
            totalApplicationCount = appCount || 0;
          }

          // Applications this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const { count: weekCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobIds)
            .gte('created_at', oneWeekAgo.toISOString());

          applicationsThisWeekCount = weekCount || 0;

          // Applications by status
          const { data: applications } = await supabase
            .from('applications')
            .select('status')
            .in('job_id', jobIds);

          if (applications) {
            applications.forEach(app => {
              if (app.status in statusCounts) {
                statusCounts[app.status as keyof typeof statusCounts]++;
              }
            });
          }
        }

        setStats({
          activeJobs: activeJobCount || 0,
          totalApplications: totalApplicationCount,
          candidatesScreened: statusCounts.screening + statusCounts.interviewing,
          applicationsThisWeek: applicationsThisWeekCount,
          applicationsByStatus: statusCounts,
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>Active listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.activeJobs}</p>
              <p className="text-sm text-gray-500 mt-2">Active jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Total received</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
              <p className="text-sm text-gray-500 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Recent applications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.applicationsThisWeek}</p>
              <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In Process</CardTitle>
              <CardDescription>Active candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.candidatesScreened}</p>
              <p className="text-sm text-gray-500 mt-2">Screening & interviewing</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Breakdown */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
              <CardDescription>Current pipeline breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.applicationsByStatus.submitted}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submitted</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.applicationsByStatus.screening}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Screening</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.applicationsByStatus.interviewing}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Interviewing</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.applicationsByStatus.offer}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Offer</p>
                </div>
              </div>
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

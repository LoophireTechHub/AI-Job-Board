import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ApplicationCard } from '@/components/applications/application-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Inbox } from 'lucide-react';

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job_id?: string; status?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const { job_id, status, search } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Build query
  let query = supabase
    .from('applications')
    .select(
      `
      *,
      jobs!inner(id, title, created_by)
    `
    )
    .eq('jobs.created_by', user.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (job_id) {
    query = query.eq('job_id', job_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `candidate_name.ilike.%${search}%,candidate_email.ilike.%${search}%`
    );
  }

  const { data: applications, error } = await query;

  if (error) {
    console.error('Error fetching applications:', error);
  }

  // Get jobs for filter dropdown
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage candidate applications
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter applications by job, status, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                type="search"
                placeholder="Search by name or email..."
                defaultValue={search}
                name="search"
              />
            </div>

            {/* Job Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Job Position</label>
              <select
                name="job_id"
                defaultValue={job_id || ''}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
              >
                <option value="">All Jobs</option>
                {jobs?.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                name="status"
                defaultValue={status || ''}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="screening">Screening</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
      </div>

      {/* Applications Grid */}
      {applications && applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Inbox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {search || job_id || status
                ? 'Try adjusting your filters'
                : "You haven't received any applications yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

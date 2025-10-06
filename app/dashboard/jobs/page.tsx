'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types/job';
import { JobCard } from '@/components/jobs';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus } from 'lucide-react';

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success messages from URL params
    const success = searchParams.get('success');
    if (success === 'published') {
      setSuccessMessage('Job published successfully!');
    } else if (success === 'draft') {
      setSuccessMessage('Job saved as draft!');
    } else if (success === 'updated-published') {
      setSuccessMessage('Job updated and published successfully!');
    } else if (success === 'updated-draft') {
      setSuccessMessage('Job updated and saved as draft!');
    }
  }, [searchParams]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check authentication
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

        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('created_by', user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });

        if (jobsError) {
          setError(jobsError.message);
        } else {
          setJobs(jobsData || []);
        }

        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    initialize();
  }, [router, supabase]);

  const handleEdit = (job: Job) => {
    router.push(`/dashboard/jobs/${job.id}/edit`);
  };

  const handleDelete = async (job: Job) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Remove from list
      setJobs(jobs.filter(j => j.id !== job.id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const handleStatusChange = async (job: Job, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      const updatedJob = await response.json();

      // Update in list
      setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        variant="page"
        title="Error Loading Jobs"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="mt-2 text-gray-600">
              Manage your job listings and track applications
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/jobs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Job List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first job posting
              </p>
              <Button onClick={() => router.push('/dashboard/jobs/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                variant="company"
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <JobsContent />
    </Suspense>
  );
}

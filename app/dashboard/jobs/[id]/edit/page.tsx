'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { JobForm } from '@/components/jobs';
import { JobFormValues } from '@/lib/validations/job';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

        // Fetch job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('created_by', user.id)
          .single();

        if (jobError) {
          setError('Job not found or you do not have permission to edit it');
          setLoading(false);
          return;
        }

        // Transform database format to form format
        const formData: any = {
          ...jobData,
          location_type: jobData.remote_policy,
          job_type: jobData.industry || 'full-time',
          requirements: jobData.requirements ? jobData.requirements.join('\n') : '',
        };

        // Parse location back to city/state/country
        if (jobData.location) {
          const locationParts = jobData.location.split(', ');
          if (locationParts.length >= 3) {
            formData.location_city = locationParts[0];
            formData.location_state = locationParts[1];
            formData.location_country = locationParts[2];
          } else if (locationParts.length === 2) {
            formData.location_city = locationParts[0];
            formData.location_state = locationParts[1];
            formData.location_country = 'US';
          }
        }

        // Parse salary range back to min/max/currency
        if (jobData.salary_range) {
          const salaryMatch = jobData.salary_range.match(/(\w+)\s+(\d+)(?:\s*-\s*(\d+))?/);
          if (salaryMatch) {
            formData.salary_currency = salaryMatch[1];
            formData.salary_min = parseInt(salaryMatch[2]);
            if (salaryMatch[3]) {
              formData.salary_max = parseInt(salaryMatch[3]);
            }
          }
        }

        setJob(formData);
        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    initialize();
  }, [router, supabase, jobId]);

  const handleSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job');
      }

      // Show success and redirect
      if (data.status === 'active') {
        router.push('/dashboard/jobs?success=updated-published');
      } else {
        router.push('/dashboard/jobs?success=updated-draft');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update job');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/jobs');
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        variant="page"
        title="Error Loading Job"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="mt-2 text-gray-600">
            Update the details of your job listing
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6">
            <ErrorMessage
              variant="inline"
              title="Failed to update job"
              message={submitError}
              onDismiss={() => setSubmitError(null)}
            />
          </div>
        )}

        {/* Job Form */}
        {job && (
          <JobForm
            initialData={job}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
}

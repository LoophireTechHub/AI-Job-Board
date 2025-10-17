'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { JobForm } from '@/components/jobs';
import { JobFormValues } from '@/lib/validations/job';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
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
        setLoading(false);
      } catch (err) {
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      const job = await response.json();

      // Show success and redirect
      if (data.status === 'active') {
        router.push('/dashboard/jobs?success=published');
      } else {
        router.push('/dashboard/jobs?success=draft');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create job');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to post a new job listing
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-6">
            <ErrorMessage
              variant="inline"
              title="Failed to create job"
              message={submitError}
              onDismiss={() => setSubmitError(null)}
            />
          </div>
        )}

        {/* Job Form */}
        <JobForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </div>
  );
}

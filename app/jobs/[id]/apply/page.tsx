import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationForm } from '@/components/applications/application-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, getCandidateProfile } from '@/lib/auth/linkedin';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch job details
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !job) {
    notFound();
  }

  // Only allow applications to active jobs
  if (job.status !== 'active') {
    redirect(`/jobs/${id}`);
  }

  // Check if user is authenticated
  const user = await getCurrentUser();
  let candidateProfile = null;
  let defaultValues = {};

  if (user) {
    candidateProfile = await getCandidateProfile(user.id);

    if (candidateProfile) {
      defaultValues = {
        candidate_name: `${candidateProfile.first_name || ''} ${candidateProfile.last_name || ''}`.trim(),
        candidate_email: candidateProfile.email,
        candidate_phone: candidateProfile.phone || '',
        linkedin_url: candidateProfile.linkedin_url || '',
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link href={`/jobs/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Details
          </Button>
        </Link>

        {/* Job Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-base">
                  {job.department} • {job.industry}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {job.experience_level}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location} • {job.remote_policy}
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary_range}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Apply for this Position</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Fill out the form below to submit your application. Fields marked with{' '}
            <span className="text-red-500">*</span> are required.
          </p>

          <ApplicationForm
            jobId={id}
            candidateProfileId={candidateProfile?.id}
            defaultValues={defaultValues}
          />
        </div>
      </div>
    </div>
  );
}

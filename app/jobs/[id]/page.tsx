'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types/job';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Building2,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const supabase = createClient();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('status', 'active')
        .single();

      if (fetchError) {
        setError('Job not found or no longer available');
        setLoading(false);
        return;
      }

      setJob(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load job details');
      console.error(err);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job: ${job?.title}`,
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !job) {
    return (
      <ErrorMessage
        variant="page"
        title="Job Not Found"
        message={error || 'This job posting is no longer available'}
        onRetry={fetchJob}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.department && (
                <p className="text-lg text-gray-600 mb-4">{job.department}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {job.remote_policy === 'remote'
                      ? 'Remote'
                      : job.remote_policy === 'hybrid'
                      ? `Hybrid${job.location ? ` - ${job.location}` : ''}`
                      : job.location || 'Location not specified'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">
                    {job.industry || 'General'} • {job.experience_level} level
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Ready to Apply?</CardTitle>
                <CardDescription>Submit your application with AI-powered screening</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleApply} className="w-full" size="lg">
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.salary_range && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Salary Range</span>
                    </div>
                    <p className="font-semibold text-gray-900">{job.salary_range}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span>Experience Level</span>
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">{job.experience_level}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span>Industry</span>
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">{job.industry || 'General'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>Work Location</span>
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">{job.remote_policy}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ApplicationSuccess } from '@/components/applications/application-success';

export default async function ApplicationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { id } = await params;
  const { email } = await searchParams;
  const supabase = await createClient();

  // Fetch job details
  const { data: job, error } = await supabase.from('jobs').select('title').eq('id', id).single();

  if (error || !job) {
    notFound();
  }

  return <ApplicationSuccess jobTitle={job.title} candidateEmail={email || ''} />;
}

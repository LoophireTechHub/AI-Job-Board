import { CandidateDashboard } from '@/components/candidate';

interface InterviewPageProps {
  searchParams: { 
    applicationId?: string;
    jobId?: string;
  };
}

export default function InterviewPage({ searchParams }: InterviewPageProps) {
  return (
    <CandidateDashboard 
      applicationId={searchParams.applicationId}
      jobId={searchParams.jobId}
    />
  );
}

import { JobStatus } from '@/types/job';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  closed: {
    label: 'Closed',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  deleted: {
    label: 'Deleted',
    className: 'bg-gray-100 text-gray-500 border-gray-300',
  },
};

export function JobStatusBadge({ status, className = '' }: JobStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

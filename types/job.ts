// Job-related TypeScript types

export type JobStatus = 'draft' | 'active' | 'closed' | 'deleted';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type LocationType = 'remote' | 'hybrid' | 'onsite';

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;

  // Basic Info
  title: string;
  industry: string;
  department: string | null;

  // Location
  remote_policy: LocationType;
  location: string | null;

  // Job Details
  experience_level: ExperienceLevel;
  salary_range: string | null;

  // Content
  description: string;
  requirements: string[] | null;
  responsibilities?: string[] | null;

  // Status
  status: JobStatus;

  // Metadata
  application_count?: number;
  view_count?: number;
}

export interface JobFormData {
  title: string;
  department: string;
  location_type: LocationType;
  location_city: string;
  location_state?: string;
  location_country: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  requirements: string;
  benefits: string;
}

export interface JobFilters {
  search?: string;
  location_type?: LocationType[];
  job_type?: JobType[];
  experience_level?: ExperienceLevel[];
  department?: string[];
  status?: JobStatus[];
}

export interface JobCardProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onStatusChange?: (job: Job, newStatus: JobStatus) => void;
  showActions?: boolean;
  variant?: 'company' | 'public';
}

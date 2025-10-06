'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Job, JobFilters as JobFiltersType } from '@/types/job';
import { JobCard } from '@/components/jobs/job-card';
import { JobSearchBar } from '@/components/jobs/job-search-bar';
import { JobFilters } from '@/components/jobs/job-filters';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Briefcase } from 'lucide-react';

export default function PublicJobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFiltersType>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, filters]);

  const fetchJobs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load jobs');
        console.error(fetchError);
        setLoading(false);
        return;
      }

      setJobs(data || []);
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.industry?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    }

    // Apply location type filters
    if (filters.location_type && filters.location_type.length > 0) {
      filtered = filtered.filter((job) =>
        filters.location_type?.includes(job.remote_policy)
      );
    }

    // Apply job type filters (using industry field)
    if (filters.job_type && filters.job_type.length > 0) {
      filtered = filtered.filter((job) =>
        filters.job_type?.some(type =>
          job.industry?.toLowerCase().includes(type) ||
          job.title.toLowerCase().includes(type)
        )
      );
    }

    // Apply experience level filters
    if (filters.experience_level && filters.experience_level.length > 0) {
      filtered = filtered.filter((job) =>
        filters.experience_level?.includes(job.experience_level)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <ErrorMessage
        variant="page"
        title="Failed to Load Jobs"
        message={error}
        onRetry={fetchJobs}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
          </div>
          <p className="text-gray-600">
            Browse {jobs.length} active job {jobs.length === 1 ? 'posting' : 'postings'} and apply with AI-powered screening
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          <JobSearchBar
            onSearch={handleSearch}
            placeholder="Search jobs by title, keywords, location..."
          />
          <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'No active job postings at the moment. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="public"
                  showActions={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

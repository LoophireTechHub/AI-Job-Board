'use client';

import { useState } from 'react';
import { JobFilters as JobFiltersType, LocationType, JobType, ExperienceLevel } from '@/types/job';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

const locationTypes: { value: LocationType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const jobTypes: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLocationFilter = (location: LocationType) => {
    const currentLocations = filters.location_type || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location];
    onFiltersChange({ ...filters, location_type: newLocations });
  };

  const toggleJobTypeFilter = (type: JobType) => {
    const currentTypes = filters.job_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFiltersChange({ ...filters, job_type: newTypes });
  };

  const toggleExperienceFilter = (level: ExperienceLevel) => {
    const currentLevels = filters.experience_level || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    onFiltersChange({ ...filters, experience_level: newLevels });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  const activeFiltersCount =
    (filters.location_type?.length || 0) +
    (filters.job_type?.length || 0) +
    (filters.experience_level?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
          {/* Location Type */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Location Type</h3>
            <div className="flex flex-wrap gap-2">
              {locationTypes.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  active={filters.location_type?.includes(value) || false}
                  onClick={() => toggleLocationFilter(value)}
                />
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Job Type</h3>
            <div className="flex flex-wrap gap-2">
              {jobTypes.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  active={filters.job_type?.includes(value) || false}
                  onClick={() => toggleJobTypeFilter(value)}
                />
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Experience Level</h3>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  label={label}
                  active={filters.experience_level?.includes(value) || false}
                  onClick={() => toggleExperienceFilter(value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${
          active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
}

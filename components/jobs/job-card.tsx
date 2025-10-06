'use client';

import Link from 'next/link';
import { Job, JobCardProps } from '@/types/job';
import { JobStatusBadge } from './job-status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Calendar, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function JobCard({
  job,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
  variant = 'company',
}: JobCardProps) {
  const baseUrl = variant === 'company' ? '/dashboard/jobs' : '/jobs';
  const applicationText = job.application_count === 1 ? '1 application' : `${job.application_count || 0} applications`;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <JobStatusBadge status={job.status} />
              {job.department && (
                <span className="text-xs text-gray-500">{job.department}</span>
              )}
            </div>
            <Link href={`${baseUrl}/${job.id}`}>
              <CardTitle className="text-xl hover:text-blue-600 transition-colors cursor-pointer">
                {job.title}
              </CardTitle>
            </Link>
            {job.company_name && (
              <CardDescription className="mt-1">{job.company_name}</CardDescription>
            )}
          </div>

          {showActions && variant === 'company' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(job)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(job)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          {/* Location */}
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

          {/* Job Type & Experience */}
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">
              {job.industry || 'General'} • {job.experience_level} level
            </span>
          </div>

          {/* Application Count (Company view only) */}
          {variant === 'company' && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{applicationText}</span>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>

          {/* Salary (if available) */}
          {job.salary_range && (
            <div className="mt-3 pt-3 border-t">
              <span className="font-semibold text-gray-900">
                {job.salary_range}
              </span>
            </div>
          )}
        </div>

        {/* Actions for public view */}
        {variant === 'public' && job.status === 'active' && (
          <div className="mt-4">
            <Link href={`/jobs/${job.id}`}>
              <Button className="w-full">View Details & Apply</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobFormSchema, JobFormValues } from '@/lib/validations/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface JobFormProps {
  initialData?: Partial<JobFormValues>;
  onSubmit: (data: JobFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      location_country: 'US',
      salary_currency: 'USD',
      status: 'draft',
      ...initialData,
    },
  });

  const locationType = watch('location_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about the role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Senior Software Engineer"
              {...register('title')}
              aria-invalid={errors.title ? 'true' : 'false'}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering"
              {...register('department')}
            />
            {errors.department && (
              <p className="text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>

          {/* Job Type & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_type">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('job_type', value as any)}
                defaultValue={initialData?.job_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.job_type && (
                <p className="text-sm text-red-600">{errors.job_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">
                Experience Level <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue('experience_level', value as any)}
                defaultValue={initialData?.experience_level}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience_level && (
                <p className="text-sm text-red-600">{errors.experience_level.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where will this role be based?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_type">
              Location Type <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('location_type', value as any)}
              defaultValue={initialData?.location_type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
            {errors.location_type && (
              <p className="text-sm text-red-600">{errors.location_type.message}</p>
            )}
          </div>

          {locationType !== 'remote' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_city">City</Label>
                <Input
                  id="location_city"
                  placeholder="e.g., San Francisco"
                  {...register('location_city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_state">State/Province</Label>
                <Input
                  id="location_state"
                  placeholder="e.g., CA"
                  {...register('location_state')}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
          <CardDescription>Salary range (optional but recommended)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="e.g., 80000"
                {...register('salary_min')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="e.g., 120000"
                {...register('salary_max')}
              />
              {errors.salary_max && (
                <p className="text-sm text-red-600">{errors.salary_max.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_currency">Currency</Label>
              <Input
                id="salary_currency"
                placeholder="USD"
                {...register('salary_currency')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Detailed description of the role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={8}
              placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              rows={6}
              placeholder="List the skills, experience, and qualifications needed (one per line)..."
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setValue('status', 'draft')}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue('status', 'active')}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            mode === 'create' ? 'Publish Job' : 'Update & Publish'
          )}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadResume } from '@/lib/storage/resume-upload';
import { validateResumeFile } from '@/lib/storage/resume-validation';

const applicationSchema = z.object({
  candidate_name: z.string().min(1, 'Full name is required').max(255),
  candidate_email: z.string().email('Invalid email address'),
  candidate_phone: z.string().optional(),
  cover_letter: z.string().max(5000, 'Cover letter must be less than 5000 characters').optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  onSuccess?: (applicationId: string) => void;
  onError?: (error: string) => void;
  candidateProfileId?: string;
  defaultValues?: Partial<ApplicationFormData>;
}

export function ApplicationForm({
  jobId,
  onSuccess,
  onError,
  candidateProfileId,
  defaultValues,
}: ApplicationFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      onError?.(validation.error || 'Invalid file');
      return;
    }

    setResumeFile(file);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeUrl('');
    setUploadProgress(0);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);

      // Upload resume if selected
      let uploadedResumeUrl = resumeUrl;
      if (resumeFile && !resumeUrl) {
        setIsUploading(true);
        setUploadProgress(30);

        const result = await uploadResume(resumeFile, data.candidate_email);

        setUploadProgress(60);

        if (!result.success || !result.url) {
          throw new Error(result.error || 'Failed to upload resume');
        }

        uploadedResumeUrl = result.url;
        setResumeUrl(result.url);
        setUploadProgress(100);
        setIsUploading(false);
      }

      if (!uploadedResumeUrl) {
        throw new Error('Please upload your resume');
      }

      // Submit application
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          candidate_profile_id: candidateProfileId,
          resume_url: uploadedResumeUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }

      const application = await response.json();

      // Reset form
      reset();
      setResumeFile(null);
      setResumeUrl('');

      // Redirect to success page or call onSuccess callback
      if (onSuccess) {
        onSuccess(application.id);
      } else {
        // Default redirect to success page
        window.location.href = `/jobs/${jobId}/apply/success?email=${encodeURIComponent(data.candidate_email)}`;
      }
    } catch (error) {
      console.error('Application submission error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to submit application');
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="candidate_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="candidate_name"
              {...register('candidate_name')}
              placeholder="John Doe"
              className={errors.candidate_name ? 'border-red-500' : ''}
            />
            {errors.candidate_name && (
              <p className="text-sm text-red-500 mt-1">{errors.candidate_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="candidate_email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="candidate_email"
              type="email"
              {...register('candidate_email')}
              placeholder="john@example.com"
              className={errors.candidate_email ? 'border-red-500' : ''}
            />
            {errors.candidate_email && (
              <p className="text-sm text-red-500 mt-1">{errors.candidate_email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="candidate_phone">Phone Number</Label>
            <Input
              id="candidate_phone"
              type="tel"
              {...register('candidate_phone')}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              type="url"
              {...register('linkedin_url')}
              placeholder="https://linkedin.com/in/johndoe"
              className={errors.linkedin_url ? 'border-red-500' : ''}
            />
            {errors.linkedin_url && (
              <p className="text-sm text-red-500 mt-1">{errors.linkedin_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="portfolio_url">Portfolio / Website</Label>
            <Input
              id="portfolio_url"
              type="url"
              {...register('portfolio_url')}
              placeholder="https://johndoe.com"
              className={errors.portfolio_url ? 'border-red-500' : ''}
            />
            {errors.portfolio_url && (
              <p className="text-sm text-red-500 mt-1">{errors.portfolio_url.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle>
            Resume <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>Upload your resume (PDF, DOC, or DOCX - Max 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          {!resumeFile && !resumeUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your resume here, or
              </p>
              <Label
                htmlFor="resume-upload"
                className="inline-block cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                browse files
              </Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">{resumeFile?.name || 'Resume uploaded'}</p>
                  <p className="text-sm text-gray-500">
                    {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {resumeUrl && !isUploading && (
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Uploaded successfully
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeResume}
                disabled={isUploading || isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
          <CardDescription>Tell us why you're interested in this position (Optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('cover_letter')}
            placeholder="I am excited to apply for this position because..."
            rows={8}
            className={errors.cover_letter ? 'border-red-500' : ''}
          />
          {errors.cover_letter && (
            <p className="text-sm text-red-500 mt-1">{errors.cover_letter.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </form>
  );
}

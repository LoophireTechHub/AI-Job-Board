'use client';

import { JobFormData } from '@/types/job';

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
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
  // TODO: Implement full form in Issue #16
  // This is a placeholder structure

  return (
    <div className="space-y-6">
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Job Form Component</h3>
        <p className="text-sm text-gray-500 mt-2">
          Full implementation coming in Issue #16 (Job Creation Form)
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Mode: {mode} | Submitting: {isSubmitting ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}

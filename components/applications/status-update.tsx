'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ApplicationStatus } from '@/types/database';

interface StatusUpdateProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export function StatusUpdate({ applicationId, currentStatus }: StatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      setStatus(currentStatus); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Update Status</Label>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
        disabled={isUpdating}
        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm disabled:opacity-50"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

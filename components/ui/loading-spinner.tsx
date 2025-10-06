import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2
      className={`animate-spin text-gray-600 ${sizeClasses[size]} ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="h-4 w-1/4 rounded bg-gray-200"></div>
      <div className="h-3 w-1/2 rounded bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200"></div>
        <div className="h-3 w-5/6 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

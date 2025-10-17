import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'page';
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  variant = 'inline',
}: ErrorMessageProps) {
  if (variant === 'page') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-6">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

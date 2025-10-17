import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ApplicationSuccessProps {
  jobTitle: string;
  candidateEmail: string;
}

export function ApplicationSuccess({ jobTitle, candidateEmail }: ApplicationSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Application Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg mt-4">
            Thank you for applying to <strong>{jobTitle}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>
                  We've sent a confirmation email to <strong>{candidateEmail}</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Our AI system will analyze your resume and match it against the job requirements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>The hiring team will review your application within 3-5 business days</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>If you're a good fit, we'll reach out to schedule an interview</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Application Tips</h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Check your email (including spam folder) for updates</li>
              <li>• Keep your phone accessible in case we call</li>
              <li>• Feel free to apply to other positions that match your skills</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/jobs">
              <Button>Browse More Jobs</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

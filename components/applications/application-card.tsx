import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, Phone, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types/database';

interface ApplicationCardProps {
  application: Application & {
    jobs?: { title: string };
  };
}

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  interviewing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const jobTitle = application.jobs?.title || 'Unknown Position';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{application.candidate_name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {jobTitle}
            </CardDescription>
          </div>
          <Badge className={statusColors[application.status]}>{application.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${application.candidate_email}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {application.candidate_email}
              </a>
            </div>
            {application.candidate_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${application.candidate_phone}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {application.candidate_phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Applied {new Date(application.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Score Badge */}
          {application.overall_score && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                Score: {application.overall_score.toFixed(1)}/5.0
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            <Link href={`/dashboard/applications/${application.id}`} className="flex-1">
              <Button className="w-full">
                View Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {application.resume_url && (
              <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <FileText className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

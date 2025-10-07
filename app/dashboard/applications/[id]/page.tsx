import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Linkedin,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch application with job details
  const { data: application, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      jobs!inner(id, title, department, industry, created_by)
    `
    )
    .eq('id', id)
    .eq('jobs.created_by', user.id)
    .single();

  if (error || !application) {
    notFound();
  }

  const parsedData = application.resume_parsed_data;

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    interviewing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <Link href="/dashboard/applications">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{application.candidate_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Applied for {application.jobs?.title}
            </p>
          </div>
          <Badge className={statusColors[application.status]}>{application.status}</Badge>
        </div>

        {application.overall_score && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 px-4 py-2">
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {application.overall_score.toFixed(1)}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">/ 5.0</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <a
                  href={`mailto:${application.candidate_email}`}
                  className="text-blue-600 hover:underline"
                >
                  {application.candidate_email}
                </a>
              </div>
              {application.candidate_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a href={`tel:${application.candidate_phone}`} className="hover:underline">
                    {application.candidate_phone}
                  </a>
                </div>
              )}
              {parsedData?.personal_info?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{parsedData.personal_info.location}</span>
                </div>
              )}
              {parsedData?.personal_info?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <a
                    href={parsedData.personal_info.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {parsedData?.personal_info?.portfolio && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a
                    href={parsedData.personal_info.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Portfolio
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Summary */}
          {parsedData?.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{parsedData.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {parsedData?.experience && parsedData.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
                {parsedData.total_experience_years && (
                  <CardDescription>
                    {parsedData.total_experience_years} years of experience
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg">{exp.position}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {exp.start_date} - {exp.end_date || 'Present'}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    {exp.description && exp.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <Badge key={i} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsedData?.education && parsedData.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                    {edu.field_of_study && (
                      <p className="text-sm text-gray-500">{edu.field_of_study}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {edu.graduation_date}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {parsedData?.skills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.skills.technical && parsedData.skills.technical.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.technical.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {parsedData.skills.soft && parsedData.skills.soft.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.soft.map((skill, i) => (
                        <Badge key={i} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.cover_letter}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {application.resume_url && (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Resume
                  </Button>
                </a>
              )}
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Applied</span>
                <p className="font-medium">
                  {new Date(application.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Position</span>
                <p className="font-medium">{application.jobs?.title}</p>
              </div>
              <div>
                <span className="text-gray-500">Department</span>
                <p className="font-medium">{application.jobs?.department}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

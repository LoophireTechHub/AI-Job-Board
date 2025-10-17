'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatInterface, Message } from '@/components/interview/chat-interface';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { validateResumeFile } from '@/lib/storage/resume-validation';
import { uploadResume } from '@/lib/storage/resume-upload';

type ApplicationStep = 'info' | 'interview';

interface JobDetails {
  id: string;
  title: string;
  company_name: string;
  department: string;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Page state
  const [step, setStep] = useState<ApplicationStep>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Job details
  const [job, setJob] = useState<JobDetails | null>(null);

  // Candidate info
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandateEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Interview session
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Load job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to load job');
        const data = await response.json();
        if (data.success) {
          setJob(data.job);
        }
      } catch (err) {
        setError('Failed to load job details');
      }
    };

    fetchJob();
  }, [jobId]);

  // Handle resume file selection
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setResumeError(validation.error || 'Invalid file');
      setResumeFile(null);
      return;
    }

    setResumeError(null);
    setResumeFile(file);
  };

  // Remove resume
  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeError(null);
  };

  // Start interview session
  const handleStartInterview = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      setError('Please provide your name and email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create application record
      const appResponse = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          candidateName: candidateName.trim(),
          candidateEmail: candidateEmail.trim(),
        }),
      });

      if (!appResponse.ok) {
        const errorData = await appResponse.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      const appData = await appResponse.json();
      const applicationId = appData.application.id;

      // 2. Upload resume if provided
      if (resumeFile) {
        try {
          await uploadResume(resumeFile, applicationId);
        } catch (uploadError) {
          console.error('Resume upload failed:', uploadError);
          // Continue anyway - resume is optional
        }
      }

      // 3. Start interview session
      const sessionResponse = await fetch('/api/interview-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          sessionType: 'screening',
        }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const sessionData = await sessionResponse.json();

      // Set interview state
      setSessionId(sessionData.sessionId);
      setProgress({ current: 1, total: sessionData.totalQuestions });

      // Build initial conversation from greeting and first question
      const initialMessages: Message[] = [
        {
          id: '1',
          role: 'assistant' as const,
          content: sessionData.message,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: sessionData.firstQuestion.text,
          timestamp: new Date().toISOString(),
          questionId: sessionData.firstQuestion.id,
        },
      ];

      setConversationHistory(initialMessages);
      setStep('interview');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message in interview
  const handleSendMessage = async (message: string) => {
    if (!sessionId || isComplete) return;

    setIsInterviewLoading(true);

    // Add user message to conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setConversationHistory(prev => [...prev, userMessage]);

    try {
      // Get current question ID from last assistant message with questionId
      const lastQuestion = conversationHistory
        .filter(msg => msg.role === 'assistant' && msg.questionId)
        .pop();

      const response = await fetch(`/api/interview-session/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: lastQuestion?.questionId,
          answer: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();

      // Check if interview is complete
      if (data.isComplete) {
        const completionMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        };
        setConversationHistory(prev => [...prev, completionMessage]);
        setIsComplete(true);
        setProgress({ current: data.questionsRemaining || 0, total: progress.total });

        // Redirect to success page after a delay
        setTimeout(() => {
          router.push(`/jobs/${jobId}/apply/success`);
        }, 3000);
        return;
      }

      // Add AI transition and next question
      const aiMessages: Message[] = [
        {
          id: `assistant-${Date.now()}-1`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        },
        {
          id: `assistant-${Date.now()}-2`,
          role: 'assistant',
          content: data.nextQuestion.text,
          timestamp: new Date().toISOString(),
          questionId: data.nextQuestion.id,
        },
      ];

      setConversationHistory(prev => [...prev, ...aiMessages]);
      setProgress({
        current: progress.total - data.questionsRemaining,
        total: progress.total
      });

    } catch (err) {
      console.error('Error submitting answer:', err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your response. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  // Render info collection step
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to job details
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Apply for {job?.title || 'Position'}</CardTitle>
              <CardDescription>
                {job?.company_name && `${job.company_name} " `}
                {job?.department}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandateEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Resume (Optional)</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Upload your resume (PDF, DOC, or DOCX, max 5MB)
                  </p>

                  {!resumeFile ? (
                    <div className="relative">
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeChange}
                        className="cursor-pointer"
                      />
                      <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {resumeFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveResume}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {resumeError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {resumeError}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                      About this interview
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This is a conversational AI interview. You'll answer questions in a natural,
                      chat-like format. Take your time and answer thoughtfully - there's no time limit.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    disabled={isLoading || !candidateName.trim() || !candidateEmail.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting Interview...
                      </>
                    ) : (
                      'Start Interview'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render interview chat interface
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Interview: {job?.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {job?.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          sessionId={sessionId || ''}
          conversationHistory={conversationHistory}
          onSendMessage={handleSendMessage}
          isLoading={isInterviewLoading}
          isComplete={isComplete}
          progress={progress}
        />
      </div>
    </div>
  );
}

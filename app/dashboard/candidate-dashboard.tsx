'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CandidateDashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<{ email: string; user_metadata?: { full_name?: string } } | null>(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
        const checkUser = async () => {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                          router.push('/auth/signin');
                          return;
                }

                setUser(user);

                // Fetch available jobs
                const { data: jobsData } = await supabase
                  .from('jobs')
                  .select('*')
                  .eq('status', 'active');

                // Fetch user's applications
                const { data: applicationsData } = await supabase
                  .from('applications')
                  .select('*')
                  .eq('candidate_email', user.email);

                setJobs(jobsData || []);
                setApplications(applicationsData || []);
                setLoading(false);
        };

                checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
  };

  if (loading) {
        return <div className="p-8 text-center">Loading...</div>div>;
  }
  
    return (
          <div className="min-h-screen bg-gray-50">
                <header className="border-b border-gray-200 bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                                  <div className="flex items-center justify-between">
                                              <h1 className="text-2xl font-bold text-gray-900">AI Job Board</h1>h1>
                                              <div className="flex items-center gap-4">
                                                            <span className="text-sm text-gray-600">
                                                              {user?.user_metadata?.full_name || user?.email}
                                                                          </span>span>
                                                            <Button onClick={handleLogout} variant="outline" size="sm">
                                                                            Sign Out
                                                                          </Button>Button>
                                                          </div>div>
                                            </div>div>
                                </div>div>
                      </header>header>
          
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mb-8">
                                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h2>h2>
                                  <p className="text-gray-600">Browse open positions and manage your applications</p>p>
                                </div>div>
                
                        <div className="grid gap-6 md:grid-cols-2 mb-8">
                                  <Card>
                                              <CardHeader>
                                                            <CardTitle className="text-lg">Available Jobs</CardTitle>CardTitle>
                                                            <CardDescription>Positions waiting for your application</CardDescription>CardDescription>
                                                          </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-4xl font-bold text-blue-600">{jobs.length}</div>div>
                                                          </CardContent>CardContent>
                                            </Card>Card>
                        
                                  <Card>
                                              <CardHeader>
                                                            <CardTitle className="text-lg">Your Applications</CardTitle>CardTitle>
                                                            <CardDescription>Applications you've submitted</CardDescription>CardDescription>
                                                          </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-4xl font-bold text-green-600">{applications.length}</div>div>
                                                          </CardContent>CardContent>
                                            </Card>Card>
                                </div>div>
                
                        <div className="mb-8">
                                  <h3 className="text-xl font-bold text-gray-900 mb-4">Available Positions</h3>h3>
                                  <div className="grid gap-4">
                                    {jobs.map((job: any) => (
                          <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                          <CardHeader>
                                                            <CardTitle>{job.title}</CardTitle>CardTitle>
                                                            <CardDescription>{job.department}</CardDescription>CardDescription>
                                                          </CardHeader>CardHeader>
                                          <CardContent>
                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-sm text-gray-600">
                                                                                                      <p><strong>Industry:</strong>strong> {job.industry}</p>p>
                                                                                                      <p><strong>Experience Level:</strong>strong> {job.experience_level}</p>p>
                                                                                                    </div>div>
                                                                                <Button 
                                                                                                        onClick={() => router.push(`/jobs/${job.id}`)}
                                                                                                      >
                                                                                                      View & Apply
                                                                                                    </Button>Button>
                                                                              </div>div>
                                                          </CardContent>CardContent>
                                        </Card>Card>
                        ))}
                                            </div>div>
                                </div>div>
                
                        <div className="mb-8">
                                  <h3 className="text-xl font-bold text-gray-900 mb-4">Your Applications</h3>h3>
                                  <div className="grid gap-4">
                                    {applications.length > 0 ? (
                          applications.map((app: any) => (
                                            <Card key={app.id}>
                                                              <CardHeader>
                                                                                  <CardTitle className="text-base">{app.job_title}</CardTitle>CardTitle>
                                                                                </CardHeader>CardHeader>
                                                              <CardContent>
                                                                                  <div className="space-y-2">
                                                                                                        <p><strong>Status:</strong>strong> <span className="capitalize text-gray-600">{app.status}</span>span></p>p>
                                                                                                        <p><strong>Applied:</strong>strong> {new Date(app.created_at).toLocaleDateString()}</p>p>
                                                                                                      </div>div>
                                                                                </CardContent>CardContent>
                                                            </Card>Card>
                                          ))
                        ) : (
                          <Card>
                                          <CardContent className="pt-6 text-center text-gray-600">
                                                            You haven't applied to any positions yet. Browse available jobs above!
                                                          </CardContent>CardContent>
                                        </Card>Card>
                                              )}
                                            </div>div>
                                </div>div>
                      </main>main>
              </div>div>
        );
}</div>

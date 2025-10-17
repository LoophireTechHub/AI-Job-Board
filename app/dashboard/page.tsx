'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import CandidateDashboard from './candidate-dashboard';
import CompanyDashboard from './company-dashboard';

export default function DashboardPage() {
        const router = useRouter();
        const supabase = createClient();
        const [user, setUser] = useState<{
                  id: string;
                  email: string;
                  user_metadata?: { full_name?: string };
        } | null>(null);
        const [loading, setLoading] = useState(true);
        const [userRole, setUserRole] = useState<'candidate' | 'company' | null>(null);

  useEffect(() => {
            const checkUser = async () => {
                        try {
                                      const { data: { user: authUser } } = await supabase.auth.getUser();

                          if (!authUser) {
                                          router.push('/auth/signin');
                                          return;
                          }

                          setUser(authUser);

                          // Check user role from profiles table
                          const { data: profile, error } = await supabase
                                        .from('profiles')
                                        .select('role')
                                        .eq('id', authUser.id)
                                        .single();

                          if (error) {
                                          console.error('Error fetching profile:', error);
                                          // Default to candidate if profile doesn't exist
                                        setUserRole('candidate');
                          } else if (profile) {
                                          setUserRole(profile.role);
                          }
                        } catch (error) {
                                      console.error('Error in checkUser:', error);
                                      setUserRole('candidate');
                        } finally {
                                      setLoading(false);
                        }
            };

                checkUser();
  }, []);

  if (loading) {
            return (
                        <div className="flex items-center justify-center h-screen">
                                <div className="text-center">
                                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>div>
                                          <p className="text-gray-600">Loading your dashboard...</p>p>
                                        </div>div>
                              </div>div>
                      );
  }
      
        if (!user) {
                  return (
                              <div className="flex items-center justify-center h-screen">
                                      <div className="text-center">
                                                <p className="text-gray-600">Please sign in to continue</p>p>
                                              </div>div>
                                    </div>div>
                            );
        }
      
        // Route based on user role
        if (userRole === 'candidate') {
                  return <CandidateDashboard />;
        }
      
        if (userRole === 'company') {
                  return <CompanyDashboard />;
        }
      
        // Default fallback (should not reach here)
        return (
                  <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                                <p className="text-gray-600">Unable to determine user role</p>p>
                              </div>div>
                      </div>div>
              }}</div>

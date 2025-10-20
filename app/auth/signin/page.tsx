'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) throw signInError;
      if (data.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTabStyles = (tab: 'candidate' | 'employer') => {
    const isActive = activeTab === tab;
    if (tab === 'candidate') {
      return {
        tabButton: `flex-1 py-3 px-4 font-medium text-center border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`,
        bgGradient: 'from-blue-50 to-indigo-100',
        buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      };
    } else {
      return {
        tabButton: `flex-1 py-3 px-4 font-medium text-center border-b-2 transition-colors ${isActive ? 'border-purple-600 text-purple-600 bg-purple-50' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`,
        bgGradient: 'from-purple-50 to-indigo-100',
        buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      };
    }
  };

  const candidateStyles = getTabStyles('candidate');
  const employerStyles = getTabStyles('employer');

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${activeTab === 'candidate' ? candidateStyles.bgGradient : employerStyles.bgGradient} p-4 transition-all duration-300`}>
      <Card className="w-full max-w-md">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('candidate')} className={candidateStyles.tabButton}>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Candidate
            </div>
          </button>
          <button onClick={() => setActiveTab('employer')} className={employerStyles.tabButton}>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Employer
            </div>
          </button>
        </div>

        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {activeTab === 'candidate' ? 'Candidate Sign In' : 'Employer Sign In'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'candidate' ? 'Sign in to explore job opportunities' : 'Sign in to post jobs and manage candidates'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/reset-password" className={`text-xs ${activeTab === 'candidate' ? 'text-blue-600 hover:text-blue-700' : 'text-purple-600 hover:text-purple-700'} hover:underline`}>
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className={`w-full text-white font-medium transition-colors ${activeTab === 'candidate' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="w-full text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? <Link href="/auth/signup" className={`font-medium ${activeTab === 'candidate' ? 'text-blue-600 hover:text-blue-700' : 'text-purple-600 hover:text-purple-700'} hover:underline`}>
                Sign up
              </Link>
            </p>
          </div>

          <div className={`p-4 rounded-lg border text-sm ${activeTab === 'candidate' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
            {activeTab === 'candidate' ? (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0">👤</span>
                <p><strong>Test Account:</strong> candidate.test@loophiretech.com</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0">🏢</span>
                <p><strong>Test Account:</strong> company.test@loophiretech.com</p>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

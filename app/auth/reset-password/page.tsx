'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/auth/update-password`,
                });

          if (error) throw error;

          setMessage('Check your email for the password reset link!');
        } catch (error: any) {
                setError(error.message || 'Failed to send reset email');
        } finally {
                setLoading(false);
        }
  };

  return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
              <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                      <div>
                                <h2 className="text-center text-3xl font-bold">Reset your password</h2>h2>
                                <p className="mt-2 text-center text-sm text-gray-600">
                                            Enter your email address and we'll send you a link to reset your password.
                                          </p>p>
                              </div>div>
              
                      <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
                                <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                          Email
                                                        </label>label>
                                            <input
                                                            id="email"
                                                            type="email"
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="you@example.com"
                                                          />
                                          </div>div>
                      
                        {error && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                        {error}
                                  </div>div>
                                )}
                      
                        {message && (
                      <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {message}
                                  </div>div>
                                )}
                      
                                <button
                                              type="submit"
                                              disabled={loading}
                                              className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400"
                                            >
                                  {loading ? 'Sending...' : 'Send reset link'}
                                          </button>button>
                      
                                <div className="text-center text-sm">
                                            <button
                                                            type="button"
                                                            onClick={() => router.push('/auth/signin')}
                                                            className="text-blue-600 hover:text-blue-500"
                                                          >
                                                          Back to sign in
                                                        </button>button>
                                          </div>div>
                              </form>form>
                    </div>div>
            </div>div>
      );
}
</div>

'use client';

import { useState } from 'react';
import { signInWithLinkedIn } from '@/lib/auth/linkedin';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

interface LinkedInSignInButtonProps {
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export function LinkedInSignInButton({
  redirectTo,
  className,
  variant = 'default',
}: LinkedInSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithLinkedIn(redirectTo);
    } catch (error) {
      console.error('LinkedIn sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
      variant={variant}
      style={
        variant === 'default'
          ? {
              backgroundColor: '#0077B5',
              color: 'white',
            }
          : undefined
      }
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Connecting...
        </>
      ) : (
        <>
          <Linkedin className="mr-2 h-4 w-4" />
          Sign in with LinkedIn
        </>
      )}
    </Button>
  );
}

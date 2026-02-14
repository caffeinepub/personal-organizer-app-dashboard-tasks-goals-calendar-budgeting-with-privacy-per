import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { Loader2 } from 'lucide-react';
import LoginButton from './LoginButton';
import UserProfileSetup from './UserProfileSetup';

export default function RequireAuth() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-2 max-w-lg px-4">
          <h1 className="text-3xl font-bold">Welcome to Everything Tracker</h1>
          <p className="text-muted-foreground">
            Your secure, mobile-first organizer for tasks, goals, calendar, budget, and crypto tracking.
            Sign in to get started.
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <UserProfileSetup />;
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
}

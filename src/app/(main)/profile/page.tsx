
'use client';

import { useAuth } from '@/providers/auth-provider';
import { ProfileHeader } from '@/components/profile-header';
import { ProfileTabs } from '@/components/profile-tabs';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (user || authLoading === false) {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Check if we're offline by looking at the console errors
    const checkOfflineStatus = () => {
      // Simple check - if we have a user but it's basic data, we're likely offline
      if (user && user.bio === '' && user.website === '' && user.followerCount === 0) {
        setIsOffline(true);
      }
    };

    checkOfflineStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Auth loading: {authLoading ? 'true' : 'false'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Offline Notice */}
      {isOffline && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ You're currently offline. Some features may be limited. Your profile data is loaded from cache.
          </p>
        </div>
      )}

      <div className="space-y-8">
        <ProfileHeader
          user={user}
          isOwnProfile={true}
        />

        <ProfileTabs
          userId={user.id}
          isOwnProfile={true}
          isProfessional={user.isProfessional || false}
        />
      </div>
    </div>
  );
}

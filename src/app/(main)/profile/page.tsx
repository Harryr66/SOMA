
'use client';

import { useAuth } from '@/providers/auth-provider';
import { ProfileHeader } from '@/components/profile-header';
import { ProfileTabs } from '@/components/profile-tabs';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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

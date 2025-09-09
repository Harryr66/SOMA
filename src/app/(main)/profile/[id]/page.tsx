
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProfileHeader } from '@/components/profile-header';
import { ProfileTabs } from '@/components/profile-tabs';
import { useAuth } from '@/providers/auth-provider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const artistId = params.id as string;
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'userProfiles', artistId));
        if (userDoc.exists()) {
          setProfileUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          notFound();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchProfile();
    }
  }, [artistId]);

  const handleFollowToggle = async () => {
    // TODO: Implement follow/unfollow logic
    setIsFollowing(!isFollowing);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-24"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = user?.id === artistId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-8">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
        />

        <ProfileTabs
          userId={artistId}
          isOwnProfile={isOwnProfile}
          isProfessional={profileUser.isProfessional || false}
        />
      </div>
    </div>
  );
}

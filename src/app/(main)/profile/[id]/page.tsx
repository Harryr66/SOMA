
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { artists, artworkData } from '@/lib/data';
import { ArtworkCard } from '@/components/artwork-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const isProfessional = false;
  const loading = false;
  const signOut = () => {};
  const artistId = params.id as string;

  const artist = useMemo(() => artists.find((a) => a.id === artistId), [artistId]);
  const artistWorks = useMemo(() => artworkData.filter((art) => art.artist.id === artistId), [artistId]);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    // Redirect the user to their own editable profile page if they land here.
    if (user && user.uid === artistId) {
      router.replace('/profile');
    }
  }, [user, artistId, router]);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowers(currentFollowers => isFollowing ? currentFollowers - 1 : currentFollowers + 1);
  };

  if (!artist) {
    notFound();
  }
  
  // While redirecting, it's best to show nothing to prevent a flash of content.
  if (user && user.uid === artistId) {
      return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <header className="bg-card p-6 rounded-lg border border-muted mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-1 rounded-full gradient-border">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={artist.avatarUrl || undefined} alt={artist.name} data-ai-hint="artist portrait" />
              <AvatarFallback>
                {artist.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline text-4xl font-semibold">{artist.name}</h1>
            <p className="text-muted-foreground">{artist.handle}</p>
            <div className="mt-2 flex items-center justify-center md:justify-start gap-6">
                <div className="text-center">
                    <p className="font-bold text-lg">{followers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center cursor-pointer">
                    <p className="font-bold text-lg">{following.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                </div>
            </div>
            <div className="mt-4 flex justify-center md:justify-start items-center gap-2">
              <Button 
                variant="outline" 
                className={cn("hover:gradient-border", isFollowing && "gradient-border")}
                onClick={handleFollowToggle}
              >
                {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>
        </div>
      </header>

      <h2 className="font-headline text-2xl font-semibold mb-4">Portfolio</h2>
      {artistWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artistWorks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed col-span-full">
          <h3 className="font-headline text-2xl mt-4 font-semibold">
            Portfolio is Empty
          </h3>
          <p className="text-muted-foreground mt-1">
            This artist hasn't uploaded any work yet.
          </p>
        </div>
      )}
    </div>
  );
}

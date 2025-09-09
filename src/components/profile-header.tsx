'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { Artist } from '@/lib/types';
import { 
  User, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Settings,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileHeaderProps {
  artist?: Artist;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
}

export function ProfileHeader({ 
  artist, 
  isOwnProfile = false, 
  onEdit, 
  onFollow, 
  onUnfollow, 
  onMessage, 
  onShare 
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUserArtist: Artist | null = user ? {
    id: user.id,
    name: user.displayName,
    handle: user.username,
    avatarUrl: user.avatarUrl,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt
  } : null;

  const displayArtist = artist || currentUserArtist;
  const displayName = displayArtist?.name || 'Unknown Artist';
  const handle = displayArtist?.handle || 'unknown';
  const avatarUrl = displayArtist?.avatarUrl;
  const bio = user?.bio || 'No bio available';
  const location = user?.location || 'Location not specified';
  const website = user?.website || '';
  const joinDate = displayArtist?.createdAt || new Date();
  const followerCount = displayArtist?.followerCount || 0;
  const followingCount = displayArtist?.followingCount || 0;

  const handleFollow = () => {
    if (isFollowing) {
      onUnfollow?.();
      setIsFollowing(false);
    } else {
      onFollow?.();
      setIsFollowing(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${displayName} (@${handle})`,
        text: `Check out ${displayName}'s profile on SOMA`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!displayArtist) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                <p className="text-muted-foreground">@{handle}</p>
                
                {/* Bio */}
                <p className="mt-2 text-sm leading-relaxed">{bio}</p>

                {/* Location and Join Date */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(joinDate, { addSuffix: true })}</span>
                  </div>
                  {website && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="h-4 w-4" />
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{followerCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{followingCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" onClick={onMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Posts will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="artworks" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Artworks will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="likes" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Liked content will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Saved content will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

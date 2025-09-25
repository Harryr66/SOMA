'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, UserPlus, Edit, Gift, Upload, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoryViewer } from './story-viewer';
import { StoryUploader } from './story-uploader';
import { TipDialog } from './tip-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ProfileHeaderProps {
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    followerCount: number;
    followingCount: number;
    isProfessional: boolean;
    isTipJarEnabled?: boolean;
    profileRingColor?: string;
    hasActiveStory?: boolean;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  currentTab?: string;
}

export function ProfileHeader({ 
  user, 
  isOwnProfile, 
  isFollowing = false, 
  onFollowToggle,
  currentTab
}: ProfileHeaderProps) {
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showStoryUploader, setShowStoryUploader] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);

  // Early return if user is not properly loaded
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading profile...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
        </div>
      </div>
    );
  }

  const handleAvatarClick = () => {
    if (user.hasActiveStory) {
      setShowStoryViewer(true);
    } else if (isOwnProfile) {
      setShowStoryUploader(true);
    }
  };

  const getAvatarBorderClass = () => {
    if (user.hasActiveStory) {
      return 'story-gradient-border';
    }
    return 'border-4 border-muted rounded-full';
  };

  const getAvatarBorderStyle = () => {
    return { borderRadius: '50%' };
  };

  const getDynamicButton = () => {
    if (!isOwnProfile || !user.isProfessional) return null;

    switch (currentTab) {
      case 'shop':
        return (
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            List an Item
          </Button>
        );
      case 'community':
        return (
          <Button 
            variant="gradient"
            onClick={() => {/* TODO: Add community creation logic */}}
          >
            <Users className="h-4 w-4 mr-2" />
            Start Community
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  onClick={handleAvatarClick}
                  className={cn(
                    'relative h-32 w-32 rounded-full transition-all hover:scale-105 overflow-hidden flex items-center justify-center',
                    getAvatarBorderClass()
                  )}
                  style={getAvatarBorderStyle()}
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage 
                      src={user.avatarUrl} 
                      alt={user.displayName || 'User'}
                      className="h-full w-full object-cover rounded-full"
                    />
                    <AvatarFallback className="text-2xl h-full w-full rounded-full">
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                {user.hasActiveStory ? (
                  <StoryViewer 
                    userId={user.id} 
                    onClose={() => setShowStoryViewer(false)} 
                  />
                ) : (
                  <StoryUploader 
                    onClose={() => setShowStoryUploader(false)} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* User Information */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-foreground">
                {user.displayName || 'User'}
              </h1>
              <p className="text-muted-foreground text-lg">@{user.username}</p>
              
              {user.isProfessional && (
                <Badge variant="secondary" className="mt-2">
                  Professional Artist
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">{user.followerCount}</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="font-medium">{user.followingCount}</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="text-foreground">
                <p className="whitespace-pre-line">{user.bio}</p>
              </div>
            )}


            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isOwnProfile ? (
                <>
                  <Button asChild variant="outline">
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  
                  {user.isProfessional && user.isTipJarEnabled && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTipDialog(true)}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Tip
                    </Button>
                  )}
                  
                  {user.isProfessional && (
                    <Button asChild variant="gradient">
                      <a href="/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </a>
                    </Button>
                  )}
                  
                  {getDynamicButton()}
                </>
              ) : (
                <Button 
                  variant="outline"
                  onClick={onFollowToggle}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tip Dialog */}
      {showTipDialog && (
        <TipDialog 
          artistId={user.id}
          artistName={user.displayName || 'User'}
          onClose={() => setShowTipDialog(false)} 
        />
      )}
    </>
  );
}
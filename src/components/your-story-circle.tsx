'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StoryUploader } from '@/components/story-uploader';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';
import { Plus } from 'lucide-react';

export function YourStoryCircle() {
  const { user, avatarUrl } = useAuth();
  const { storyItems } = useContent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) return null;

  const userStories = storyItems.filter(story => story.artistId === user.id);
  const hasActiveStory = userStories.length > 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center space-y-2 cursor-pointer group">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary group-hover:ring-offset-4 transition-all">
              <AvatarImage src={avatarUrl || undefined} alt={user.displayName} />
              <AvatarFallback className="text-lg">
                {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {hasActiveStory && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary border-2 border-background rounded-full flex items-center justify-center">
              <Plus className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium">Your Story</p>
            <p className="text-xs text-muted-foreground">
              {hasActiveStory ? 'Add to story' : 'Add story'}
            </p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <StoryUploader onClose={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

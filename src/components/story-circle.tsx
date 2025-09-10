'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StoryViewer } from '@/components/story-viewer';
import { Artist, Story } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

interface StoryCircleProps {
  artist: Artist;
  stories: Story[];
  isOwn?: boolean;
  onAddStory?: () => void;
}

export function StoryCircle({ artist, stories, isOwn = false, onAddStory }: StoryCircleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasActiveStory = stories.length > 0;
  const latestStory = stories[0];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center space-y-2 cursor-pointer group">
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary group-hover:ring-offset-4 transition-all">
              <AvatarImage src={artist.avatarUrl} alt={artist.name} />
              <AvatarFallback className="text-lg">
                {artist.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {hasActiveStory && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
            )}
            {isOwn && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary border-2 border-background rounded-full flex items-center justify-center">
                <Plus className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs font-medium truncate max-w-16">{artist.name}</p>
            {latestStory && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(latestStory.items[0].createdAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-none p-0 w-screen h-screen max-w-full sm:max-w-full">
        {hasActiveStory && (
          <StoryViewer 
            userId={artist.id}
            onClose={() => setIsOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

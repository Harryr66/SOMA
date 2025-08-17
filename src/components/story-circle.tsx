
'use client';

import { type Artist, type StoryItem } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useContent } from '@/providers/content-provider';
import { useMemo, useState } from 'react';
import { StoryViewer } from './story-viewer';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface StoryCircleProps {
  artist: Artist;
}

export function StoryCircle({ artist }: StoryCircleProps) {
  const { storyItems } = useContent();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveStory = useMemo(() => {
    if (!storyItems) return false;
    return storyItems.some(item => item.artistId === artist.id);
  }, [storyItems, artist.id]);


  if (!hasActiveStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20 text-center cursor-pointer">
              <div className={cn("rounded-full p-0.5", hasActiveStory ? 'story-gradient-border' : 'border-2 border-accent')}>
                <div className="bg-background p-0.5 rounded-full">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={artist.avatarUrl || 'https://placehold.co/64x64.png'} alt={artist.name} data-ai-hint="artist portrait" />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
              </div>
              <p className="text-xs font-medium truncate w-full">{artist.handle}</p>
            </div>
        </DialogTrigger>
        <DialogContent className="bg-transparent border-none p-0 w-screen h-screen max-w-full sm:max-w-full">
            {hasActiveStory && (
              <StoryViewer artist={artist} onClose={() => setIsOpen(false)} />
            )}
        </DialogContent>
    </Dialog>
  );
}


'use client';

import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StoryUploader } from './story-uploader';
import { StoryViewer } from './story-viewer';
import { useState, useMemo } from 'react';
import { useContent } from '@/providers/content-provider';
import { type Artist } from '@/lib/types';
import { cn } from '@/lib/utils';

export function YourStoryCircle() {
  const { user, avatarUrl, profileRingColor } = useAuth();
  const { storyItems } = useContent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasActiveStory = useMemo(() => {
    if (!user) return false;
    return storyItems.some(item => item.artistId === user.id);
  }, [storyItems, user]);


  if (!user) {
    return null;
  }
  
  const currentUserArtist: Artist = {
    id: user.id,
    name: user.displayName || 'Anonymous User',
    handle: user.email?.split('@')[0] || 'anonymous',
    avatarUrl: avatarUrl || undefined,
  };

  const ringStyle = !hasActiveStory && profileRingColor ? { borderColor: profileRingColor } : {};
  const ringClassName = cn(
    "p-0.5 rounded-full",
    {
      'story-gradient-border': hasActiveStory,
      'border-2': !hasActiveStory && !!profileRingColor,
      'border-2 border-border': !hasActiveStory && !profileRingColor
    }
  );


  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20 text-center cursor-pointer">
          <div className="relative">
             <div className={ringClassName} style={ringStyle}>
                <div className="bg-background p-0.5 rounded-full">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl || undefined} alt={user.displayName || 'User'} data-ai-hint="artist portrait" />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            {!hasActiveStory && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-foreground rounded-full flex items-center justify-center border-2 border-background">
                    <Plus className="h-4 w-4 text-background" />
                </div>
            )}
          </div>
          <p className="text-xs font-medium truncate w-full">Your Story</p>
        </div>
      </DialogTrigger>
       <DialogContent className={cn(
          hasActiveStory 
            ? "bg-transparent border-none p-0 w-screen h-screen max-w-full sm:max-w-full" 
            : "max-h-[90vh] overflow-y-auto"
        )}>
        {hasActiveStory ? (
           <StoryViewer artist={currentUserArtist} onClose={() => setIsDialogOpen(false)} />
        ) : (
           <StoryUploader onSuccess={() => setIsDialogOpen(false)} onClose={() => setIsDialogOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

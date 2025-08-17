

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { X, Trash2, Loader2, PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { type StoryItem, type Artist } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useContent } from '@/providers/content-provider';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { StoryUploader } from './story-uploader';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
  artist: Artist;
  onClose: () => void;
  initialStoryIndex?: number;
}

export function StoryViewer({ artist, onClose, initialStoryIndex = 0 }: StoryViewerProps) {
  const { storyItems: allStoryItems, deleteStoryItem } = useContent();
  const { user } = useAuth();
  
  const stories = useMemo(() => {
    return allStoryItems.filter(item => item.artistId === artist.id)
                        .sort((a, b) => a.createdAt - b.createdAt);
  }, [allStoryItems, artist.id]);

  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>();

  const isOwnStory = user?.uid === artist.id;
  const currentStory = stories[currentIndex];
  
  const goToNextStory = () => {
    setCurrentIndex(i => {
      if (i < stories.length - 1) {
        return i + 1;
      }
      onClose(); // Close viewer when last story finishes
      return i;
    });
  };

  const goToPrevStory = () => {
    setCurrentIndex(i => (i > 0 ? i - 1 : i));
  };

  useEffect(() => {
    setProgress(0);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    const story = stories[currentIndex];
    if (!story) {
        if (stories.length === 0 && isOwnStory) {
            // No stories left after deletion, can open uploader or close
        } else if (stories.length === 0) {
            onClose();
        }
        return;
    };
    
    if (story.mediaType === 'image') {
        const DURATION = 5000;
        let startTime: number;
        
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const elapsedTime = time - startTime;
            const newProgress = Math.min((elapsedTime / DURATION) * 100, 100);
            setProgress(newProgress);

            if (elapsedTime < DURATION) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                goToNextStory();
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);

    } else if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentIndex, stories]);
  
  const handleDelete = () => {
    if (!currentStory) return;
    deleteStoryItem(currentStory.id);
    if (stories.length <= 1) {
        onClose();
    } else {
        // Go to the next story, but don't increment past the new end
        setCurrentIndex(i => Math.min(i, stories.length - 2));
    }
  };
  
  const handleVideoTimeUpdate = () => {
    if (videoRef.current?.duration) {
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(p);
    }
  };
  
  const handleUploaderSuccess = (newItemId: string) => {
    setIsUploaderOpen(false);
    const updatedStories = allStoryItems.filter(item => item.artistId === artist.id)
                                         .sort((a, b) => a.createdAt - b.createdAt);
    const newIndex = updatedStories.findIndex(s => s.id === newItemId);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  };


  if (!currentStory) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
    );
  }

  const mediaConfig = currentStory.mediaConfig || { scale: 1, x: 0, y: 0, bgColor: '#000000' };
  const captionConfigs = currentStory.captionConfigs || [];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-0 md:p-4">
      <div 
        className="relative w-full h-full md:max-w-sm md:h-[95vh] md:max-h-[800px] bg-black rounded-none md:rounded-lg overflow-hidden shadow-2xl flex flex-col"
        style={{ backgroundColor: mediaConfig.bgColor }}
      >
        <div className="absolute top-0 left-0 right-0 p-3 z-20 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-white transition-all duration-100 linear"
                    style={{ width: `${index < currentIndex ? 100 : index === currentIndex ? progress : 0}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <Link href={`/profile/${artist.id}`} onClick={onClose} className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={artist.avatarUrl} alt={artist.name} data-ai-hint="artist portrait" />
                    <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-white font-semibold text-sm hover:underline">{artist.handle}</p>
            </Link>
            <div className="flex items-center">
                 {isOwnStory && (
                    <>
                      <Dialog open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white h-8 w-8 hover:bg-white/20">
                              <PlusCircle className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <StoryUploader onSuccess={handleUploaderSuccess} onClose={() => setIsUploaderOpen(false)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="text-white h-8 w-8 hover:bg-white/20" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                 )}
                 <Button variant="ghost" size="icon" className="text-white h-8 w-8 hover:bg-white/20" onClick={onClose}>
                    <X className="h-5 w-5" />
                 </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            <div 
                className="absolute w-full h-full"
                style={{
                  transform: `translate(${mediaConfig.x}px, ${mediaConfig.y}px) scale(${mediaConfig.scale})`,
                }}
            >
              {currentStory.mediaType === 'image' ? (
                  <Image src={currentStory.mediaUrl} alt={captionConfigs[0]?.text || 'Story'} fill style={{ objectFit: 'contain' }} />
              ) : (
                  <video
                      ref={videoRef}
                      src={currentStory.mediaUrl}
                      className="w-full h-full object-contain"
                      autoPlay
                      muted
                      playsInline
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={goToNextStory}
                  />
              )}
            </div>
        </div>
        
        {captionConfigs.map((captionConfig) => (
          <div 
            key={captionConfig.id}
            className="absolute z-20 pointer-events-none"
            style={{
                top: '50%',
                left: '50%',
                width: 'calc(100% - 32px)',
                transform: `translate(-50%, -50%) translate(${captionConfig.x}px, ${captionConfig.y}px) rotate(${captionConfig.rotation || 0}deg)`,
            }}
          >
            <div
                className="relative w-full"
            >
                <p 
                    className="w-full text-center font-bold px-3 py-1.5 rounded-lg whitespace-pre-wrap break-words"
                    style={{
                        color: captionConfig.color,
                        backgroundColor: captionConfig.hasBackground ? captionConfig.backgroundColor : 'transparent',
                        textShadow: !captionConfig.hasBackground ? '1px 1px 3px rgba(0,0,0,0.7)' : 'none',
                        fontSize: `${captionConfig.fontSize}rem`,
                        lineHeight: 1.4,
                    }}
                >
                    {captionConfig.text}
                </p>
            </div>
          </div>
        ))}

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={goToPrevStory} />
        <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={goToNextStory} />
      </div>

       {/* Navigation Buttons for Desktop */}
      <Button variant="ghost" size="icon" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white h-10 w-10 hover:bg-white/20 rounded-full" onClick={goToPrevStory} disabled={currentIndex === 0}>
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button variant="ghost" size="icon" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white h-10 w-10 hover:bg-white/20 rounded-full" onClick={goToNextStory}>
        <ArrowRight className="h-6 w-6" />
      </Button>
    </div>
  );
}

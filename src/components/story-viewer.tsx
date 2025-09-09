'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Story, StoryItem } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StoryViewer({ 
  stories, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious 
}: StoryViewerProps) {
  const { user } = useAuth();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef<number>();

  const isOwnStory = user?.id === stories[currentIndex]?.artist.id;
  const currentStory = stories[currentIndex];
  
  const goToNextStory = () => {
    if (currentStoryIndex < currentStory.items.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onNext();
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      onPrevious();
    }
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const duration = 5000; // 5 seconds per story

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        goToNextStory();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentStoryIndex, isPaused]);

  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
  }, [currentIndex]);

  if (!currentStory) {
    return null;
  }

  const currentStoryItem = currentStory.items[currentStoryIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousStory}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextStory}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Story Content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex space-x-1">
            {currentStory.items.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-100 ${
                    index === currentStoryIndex ? 'animate-pulse' : ''
                  }`}
                  style={{
                    width: index === currentStoryIndex ? `${progress}%` : 
                           index < currentStoryIndex ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Story Media */}
        <div className="relative w-full h-full">
          {currentStoryItem.mediaType === 'image' ? (
            <Image
              src={currentStoryItem.mediaUrl}
              alt="Story"
              fill
              className="object-cover"
            />
          ) : (
            <video
              src={currentStoryItem.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
            />
          )}

          {/* Play/Pause Button for Videos */}
          {currentStoryItem.mediaType === 'video' && (
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlayPause}
              className="absolute inset-0 m-auto text-white hover:bg-white/20"
            >
              {isPaused ? <Play className="h-12 w-12" /> : <Pause className="h-12 w-12" />}
            </Button>
          )}
        </div>

        {/* Story Info */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentStory.artist.avatarUrl} alt={currentStory.artist.name} />
              <AvatarFallback>{currentStory.artist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-semibold">{currentStory.artist.name}</p>
              <p className="text-sm text-white/70">
                {formatDistanceToNow(new Date(currentStoryItem.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Story Captions */}
          {currentStoryItem.captionConfigs && currentStoryItem.captionConfigs.length > 0 && (
            <div className="space-y-2">
              {currentStoryItem.captionConfigs.map((caption, index) => (
                <div
                  key={index}
                  className="text-white text-sm"
                  style={{
                    position: 'absolute',
                    left: `${caption.x}%`,
                    top: `${caption.y}%`,
                    color: caption.color,
                    backgroundColor: caption.hasBackground ? caption.backgroundColor : 'transparent',
                    padding: caption.hasBackground ? '4px 8px' : '0',
                    borderRadius: caption.hasBackground ? '4px' : '0',
                    fontSize: `${caption.fontSize}px`,
                    transform: caption.rotation ? `rotate(${caption.rotation}deg)` : 'none',
                  }}
                >
                  {caption.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

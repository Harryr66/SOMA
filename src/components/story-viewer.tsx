'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
  userId: string;
  onClose: () => void;
}

interface Story {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  duration: number;
  createdAt: Date;
}

export function StoryViewer({ userId, onClose }: StoryViewerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: '1',
        imageUrl: '/placeholder-story.jpg',
        duration: 5000,
        createdAt: new Date()
      },
      {
        id: '2',
        imageUrl: '/placeholder-story2.jpg',
        duration: 3000,
        createdAt: new Date()
      }
    ];
    setStories(mockStories);
  }, [userId]);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!isPlaying || !currentStory) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 100;
        if (newProgress >= currentStory.duration) {
          handleNext();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  if (!currentStory) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No stories available</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {stories.map((_, index) => (
              <div
                key={index}
                className="h-1 bg-white/30 rounded-full flex-1"
              >
                <div
                  className={cn(
                    'h-full bg-white rounded-full transition-all duration-100',
                    index === currentIndex ? 'w-full' : 'w-0'
                  )}
                  style={{
                    width: index === currentIndex ? `${(progress / currentStory.duration) * 100}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative aspect-[9/16] bg-black">
        <img
          src={currentStory.imageUrl}
          alt="Story"
          className="w-full h-full object-cover"
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20 h-16 w-16 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 w-1/2" onClick={handlePrevious} />
        <div className="absolute inset-y-0 right-0 w-1/2" onClick={handleNext} />
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === stories.length - 1}
          className="text-white hover:bg-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, decrement } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { toast } from '@/hooks/use-toast';

interface LikeButtonProps {
  episodeId: string;
  initialLikes: number;
  initialLikedBy: string[];
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
}

export function LikeButton({ 
  episodeId, 
  initialLikes, 
  initialLikedBy, 
  size = 'default',
  variant = 'ghost',
  showCount = true 
}: LikeButtonProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [likedBy, setLikedBy] = useState(initialLikedBy);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = user ? likedBy.includes(user.id) : false;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like videos.",
        variant: "destructive",
      });
      return;
    }

    setIsLiking(true);
    try {
      const episodeRef = doc(db, 'episodes', episodeId);
      
      if (isLiked) {
        // Unlike
        await updateDoc(episodeRef, {
          likedBy: arrayRemove(user.id),
          likes: decrement(1)
        });
        setLikedBy(prev => prev.filter(id => id !== user.id));
        setLikes(prev => prev - 1);
      } else {
        // Like
        await updateDoc(episodeRef, {
          likedBy: arrayUnion(user.id),
          likes: increment(1)
        });
        setLikedBy(prev => [...prev, user.id]);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLike}
      disabled={isLiking}
      className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
      />
      {showCount && (
        <span className="text-sm">
          {likes > 0 ? likes : ''}
        </span>
      )}
    </Button>
  );
}

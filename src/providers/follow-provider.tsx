'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artist } from '@/lib/types';

interface FollowContextType {
  followedArtists: Artist[];
  followArtist: (artistId: string) => void;
  unfollowArtist: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
  getFollowedArtists: () => Artist[];
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);

  // Load followed artists from localStorage on mount
  useEffect(() => {
    const savedFollows = localStorage.getItem('soma_followed_artists');
    if (savedFollows) {
      try {
        setFollowedArtists(JSON.parse(savedFollows));
      } catch (error) {
        console.error('Error loading followed artists:', error);
      }
    } else {
      // Add some mock followed artists for demo
      const mockFollowedArtists: Artist[] = [
        {
          id: 'artist-1',
          name: 'Elena Vance',
          handle: 'elena_vance',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Abstract expressionist painter exploring the intersection of color and emotion.',
          followerCount: 1250,
          followingCount: 89,
          createdAt: new Date('2023-01-15'),
          isVerified: true,
          isProfessional: true,
          location: 'New York, NY',
          socialLinks: {
            instagram: '@elena_vance',
            website: 'elena-vance.com'
          }
        },
        {
          id: 'artist-2',
          name: 'Marcus Chen',
          handle: 'marcus_chen',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Digital artist creating futuristic cityscapes and urban narratives.',
          followerCount: 2100,
          followingCount: 156,
          createdAt: new Date('2022-11-20'),
          isVerified: true,
          isProfessional: true,
          location: 'Los Angeles, CA',
          socialLinks: {
            instagram: '@marcus_chen',
            website: 'marcuschen.art'
          }
        }
      ];
      setFollowedArtists(mockFollowedArtists);
    }
  }, []);

  // Save to localStorage whenever followed artists change
  useEffect(() => {
    localStorage.setItem('soma_followed_artists', JSON.stringify(followedArtists));
  }, [followedArtists]);

  const followArtist = (artistId: string) => {
    // In a real app, you'd fetch the artist data from API
    // For now, we'll create a mock artist
    const mockArtist: Artist = {
      id: artistId,
      name: `Artist ${artistId}`,
      handle: `artist_${artistId}`,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 1000000000}?w=150&h=150&fit=crop&crop=face`,
      bio: 'Artist bio',
      followerCount: Math.floor(Math.random() * 10000),
      followingCount: Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      isVerified: Math.random() > 0.5,
      isProfessional: true,
      location: 'Various',
      socialLinks: {
        instagram: `@artist_${artistId}`,
        website: `https://artist${artistId}.com`
      }
    };

    if (!isFollowing(artistId)) {
      setFollowedArtists(prev => [...prev, mockArtist]);
    }
  };

  const unfollowArtist = (artistId: string) => {
    setFollowedArtists(prev => prev.filter(artist => artist.id !== artistId));
  };

  const isFollowing = (artistId: string): boolean => {
    return followedArtists.some(artist => artist.id === artistId);
  };

  const getFollowedArtists = (): Artist[] => {
    return followedArtists;
  };

  const value: FollowContextType = {
    followedArtists,
    followArtist,
    unfollowArtist,
    isFollowing,
    getFollowedArtists
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}

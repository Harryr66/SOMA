'use client';

import React from 'react';
import { ArtPost } from '@/components/art-post';
import { FeedFilters } from '@/components/feed-filters';
import { Post } from '@/lib/types';

const mockPosts: Post[] = [
  {
    id: '1',
    artworkId: '1',
    artist: {
      id: 'elena',
      name: 'Elena Vance',
      handle: 'elena_vance',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followerCount: 1250,
      followingCount: 89,
      createdAt: new Date('2023-01-15')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Abstract painting with vibrant colors',
    caption: 'Just finished this piece! The colors really came together beautifully. What do you think? #abstract #art #painting',
    likes: 42,
    commentsCount: 8,
    timestamp: '2 hours ago',
    createdAt: Date.now() - 7200000,
    tags: ['abstract', 'art', 'painting']
  },
  {
    id: '2',
    artworkId: '2',
    artist: {
      id: 'marcus',
      name: 'Marcus Chen',
      handle: 'marcus_chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followerCount: 2100,
      followingCount: 156,
      createdAt: new Date('2022-11-20')
    },
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    imageAiHint: 'Digital artwork featuring futuristic cityscape',
    caption: 'Working on a new digital series. This is the first piece - exploring themes of urban isolation and connection. #digitalart #cityscape #futuristic',
    likes: 67,
    commentsCount: 12,
    timestamp: '4 hours ago',
    createdAt: Date.now() - 14400000,
    tags: ['digitalart', 'cityscape', 'futuristic']
  },
  {
    id: '3',
    artworkId: '3',
    artist: {
      id: 'sophia',
      name: 'Sophia Rodriguez',
      handle: 'sophia_art',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followerCount: 890,
      followingCount: 234,
      createdAt: new Date('2023-03-10')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Ceramic sculpture of a woman in contemplation',
    caption: 'My latest ceramic piece is finally fired and glazed! The process took weeks but I\'m so happy with how it turned out. #ceramics #sculpture #art',
    likes: 34,
    commentsCount: 5,
    timestamp: '6 hours ago',
    createdAt: Date.now() - 21600000,
    tags: ['ceramics', 'sculpture', 'art']
  }
];

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Art Feed</h1>
          <p className="text-muted-foreground">
            Discover amazing artworks from talented artists
          </p>
        </div>

        {/* Filters */}
        <FeedFilters />

        {/* Posts */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <ArtPost key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center">
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
}

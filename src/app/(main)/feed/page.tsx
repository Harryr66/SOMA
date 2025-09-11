'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FeedFilters } from '@/components/feed-filters';
import { ArtworkGrid } from '@/components/artwork-grid';
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
  },
  {
    id: '4',
    artworkId: '4',
    artist: {
      id: 'alex',
      name: 'Alex Kim',
      handle: 'alex_kim',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followerCount: 3200,
      followingCount: 180,
      createdAt: new Date('2022-08-15')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Abstract digital art with geometric patterns',
    caption: 'Exploring the intersection of technology and creativity. This piece represents the digital age we live in. #digitalart #geometric #modern',
    likes: 89,
    commentsCount: 15,
    timestamp: '8 hours ago',
    createdAt: Date.now() - 28800000,
    tags: ['digital', 'geometric', 'modern']
  },
  {
    id: '5',
    artworkId: '5',
    artist: {
      id: 'maya',
      name: 'Maya Patel',
      handle: 'maya_art',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followerCount: 1800,
      followingCount: 95,
      createdAt: new Date('2023-02-20')
    },
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    imageAiHint: 'Watercolor painting with soft pastels',
    caption: 'Watercolor has always been my favorite medium. The way colors blend and flow is magical. #watercolor #pastels #painting',
    likes: 156,
    commentsCount: 23,
    timestamp: '10 hours ago',
    createdAt: Date.now() - 36000000,
    tags: ['watercolor', 'pastels', 'painting']
  },
  {
    id: '6',
    artworkId: '6',
    artist: {
      id: 'david',
      name: 'David Chen',
      handle: 'david_chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followerCount: 4200,
      followingCount: 220,
      createdAt: new Date('2022-05-10')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Oil painting with dramatic lighting',
    caption: 'Working on a new series about urban landscapes. The contrast between light and shadow fascinates me. #oilpainting #urban #lighting',
    likes: 203,
    commentsCount: 31,
    timestamp: '12 hours ago',
    createdAt: Date.now() - 43200000,
    tags: ['oil', 'urban', 'lighting']
  },
  {
    id: '7',
    artworkId: '7',
    artist: {
      id: 'luna',
      name: 'Luna Rodriguez',
      handle: 'luna_art',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followerCount: 2100,
      followingCount: 140,
      createdAt: new Date('2023-01-05')
    },
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    imageAiHint: 'Mixed media collage with textures',
    caption: 'Mixed media allows for such interesting textures and layers. This piece took weeks to complete. #mixedmedia #collage #texture',
    likes: 78,
    commentsCount: 12,
    timestamp: '14 hours ago',
    createdAt: Date.now() - 50400000,
    tags: ['mixedmedia', 'collage', 'texture']
  },
  {
    id: '8',
    artworkId: '8',
    artist: {
      id: 'james',
      name: 'James Wilson',
      handle: 'james_wilson',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followerCount: 3500,
      followingCount: 195,
      createdAt: new Date('2022-09-12')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Photography with dramatic composition',
    caption: 'Street photography is all about capturing the moment. This shot took patience and perfect timing. #photography #street #composition',
    likes: 134,
    commentsCount: 18,
    timestamp: '16 hours ago',
    createdAt: Date.now() - 57600000,
    tags: ['photography', 'street', 'composition']
  },
  {
    id: '9',
    artworkId: '9',
    artist: {
      id: 'zoe',
      name: 'Zoe Anderson',
      handle: 'zoe_art',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followerCount: 2800,
      followingCount: 160,
      createdAt: new Date('2022-11-30')
    },
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    imageAiHint: 'Sculpture with organic forms',
    caption: 'Sculpture is about working in three dimensions. This piece explores the relationship between form and space. #sculpture #organic #form',
    likes: 167,
    commentsCount: 25,
    timestamp: '18 hours ago',
    createdAt: Date.now() - 64800000,
    tags: ['sculpture', 'organic', 'form']
  },
  {
    id: '10',
    artworkId: '10',
    artist: {
      id: 'ryan',
      name: 'Ryan Taylor',
      handle: 'ryan_taylor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followerCount: 1900,
      followingCount: 110,
      createdAt: new Date('2023-03-25')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Digital illustration with vibrant colors',
    caption: 'Digital art opens up so many possibilities. The colors you can achieve are incredible. #digital #illustration #vibrant',
    likes: 92,
    commentsCount: 14,
    timestamp: '20 hours ago',
    createdAt: Date.now() - 72000000,
    tags: ['digital', 'illustration', 'vibrant']
  },
  {
    id: '11',
    artworkId: '11',
    artist: {
      id: 'sophie',
      name: 'Sophie Brown',
      handle: 'sophie_brown',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followerCount: 2400,
      followingCount: 175,
      createdAt: new Date('2022-12-08')
    },
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    imageAiHint: 'Abstract expressionist painting',
    caption: 'Abstract art is about emotion and feeling. This piece came from a very personal place. #abstract #expressionist #emotion',
    likes: 145,
    commentsCount: 21,
    timestamp: '22 hours ago',
    createdAt: Date.now() - 79200000,
    tags: ['abstract', 'expressionist', 'emotion']
  },
  {
    id: '12',
    artworkId: '12',
    artist: {
      id: 'mike',
      name: 'Mike Johnson',
      handle: 'mike_johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followerCount: 3100,
      followingCount: 200,
      createdAt: new Date('2022-07-18')
    },
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    imageAiHint: 'Minimalist design with clean lines',
    caption: 'Sometimes less is more. This minimalist piece focuses on clean lines and negative space. #minimalist #clean #design',
    likes: 198,
    commentsCount: 28,
    timestamp: '1 day ago',
    createdAt: Date.now() - 86400000,
    tags: ['minimalist', 'clean', 'design']
  }
];

// Function to generate more mock posts
const generateMorePosts = (startId: number, count: number): Post[] => {
  const artists = [
    { name: 'Emma Wilson', handle: 'emma_wilson', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { name: 'Liam Davis', handle: 'liam_davis', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { name: 'Olivia Martinez', handle: 'olivia_martinez', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { name: 'Noah Anderson', handle: 'noah_anderson', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { name: 'Ava Thompson', handle: 'ava_thompson', avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { name: 'William Garcia', handle: 'william_garcia', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { name: 'Sophia Lee', handle: 'sophia_lee', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { name: 'James Wilson', handle: 'james_wilson', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
  ];

  const artworks = [
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop'
  ];

  const captions = [
    'Just finished this piece! The colors really came together beautifully. What do you think? #abstract #art #painting',
    'Working on a new digital series. This is the first piece - exploring themes of urban isolation and connection. #digitalart #cityscape #futuristic',
    'My latest ceramic piece is finally fired and glazed! The process took weeks but I\'m so happy with how it turned out. #ceramics #sculpture #art',
    'Exploring the intersection of technology and creativity. This piece represents the digital age we live in. #digitalart #geometric #modern',
    'Watercolor has always been my favorite medium. The way colors blend and flow is magical. #watercolor #pastels #painting',
    'Working on a new series about urban landscapes. The contrast between light and shadow fascinates me. #oilpainting #urban #lighting',
    'Mixed media allows for such interesting textures and layers. This piece took weeks to complete. #mixedmedia #collage #texture',
    'Street photography is all about capturing the moment. This shot took patience and perfect timing. #photography #street #composition'
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    const artist = artists[id % artists.length];
    const artwork = artworks[id % artworks.length];
    const caption = captions[id % captions.length];
    const hoursAgo = Math.floor(Math.random() * 48) + 1;
    
    return {
      id: id.toString(),
      artworkId: id.toString(),
      artist: {
        id: artist.handle,
        name: artist.name,
        handle: artist.handle,
        avatarUrl: artist.avatarUrl,
        followerCount: Math.floor(Math.random() * 5000) + 500,
        followingCount: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      },
      imageUrl: artwork,
      imageAiHint: 'Artwork image',
      caption: caption,
      likes: Math.floor(Math.random() * 500) + 10,
      commentsCount: Math.floor(Math.random() * 100) + 1,
      timestamp: hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`,
      createdAt: Date.now() - (hoursAgo * 60 * 60 * 1000),
      tags: ['art', 'creative', 'inspiration']
    };
  });
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPosts = generateMorePosts(posts.length + 1, 9);
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    
    // Simulate reaching end after 5 pages (45 posts total)
    if (posts.length >= 36) {
      setHasMore(false);
    }
    
    setIsLoading(false);
  }, [isLoading, hasMore, posts.length]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMorePosts();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
        <FeedFilters />
          </div>
        </div>

        {/* Posts */}
        <ArtworkGrid posts={posts} />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Loading more posts...</span>
            </div>
          </div>
        )}

        {/* End of Content */}
        {!hasMore && !isLoading && (
          <div className="flex justify-center py-8">
            <span className="text-muted-foreground">You've reached the end of the feed</span>
        </div>
        )}

        {/* Manual Load More Button (fallback) */}
        {hasMore && !isLoading && (
        <div className="flex justify-center">
            <button 
              onClick={loadMorePosts}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
            Load More Posts
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

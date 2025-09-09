'use client';

import React, { useState, useEffect } from 'react';
import { ArtworkCard } from '@/components/artwork-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Search, Filter, Grid, List, Star, TrendingUp, Clock } from 'lucide-react';
import { Artwork } from '@/lib/types';

// Mock data for discover page
const mockArtworks: Artwork[] = [
  {
    id: '1',
    artist: {
      id: 'elena',
      name: 'Elena Vance',
      handle: 'elena_vance',
      avatarUrl: '/avatars/elena.jpg',
      followerCount: 1250,
      followingCount: 89,
      createdAt: new Date('2023-01-15')
    },
    title: 'Abstract Harmony',
    description: 'A vibrant abstract piece exploring the relationship between color and emotion.',
    imageUrl: '/artworks/abstract-1.jpg',
    imageAiHint: 'Abstract painting with vibrant colors',
    discussionId: 'discussion-1',
    tags: ['abstract', 'color', 'emotion'],
    price: 250,
    currency: 'USD',
    isForSale: true,
    category: 'Abstract',
    medium: 'Oil on Canvas',
    dimensions: { width: 24, height: 30, unit: 'in' },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    views: 156,
    likes: 42,
    isAI: false,
    aiAssistance: 'none'
  },
  {
    id: '2',
    artist: {
      id: 'marcus',
      name: 'Marcus Chen',
      handle: 'marcus_chen',
      avatarUrl: '/avatars/marcus.jpg',
      followerCount: 2100,
      followingCount: 156,
      createdAt: new Date('2022-11-20')
    },
    title: 'Digital Dreams',
    description: 'A futuristic cityscape rendered in digital art, exploring themes of urban isolation.',
    imageUrl: '/artworks/digital-1.jpg',
    imageAiHint: 'Digital artwork featuring futuristic cityscape',
    discussionId: 'discussion-2',
    tags: ['digital', 'cityscape', 'futuristic'],
    price: 150,
    currency: 'USD',
    isForSale: true,
    category: 'Digital Art',
    medium: 'Digital',
    dimensions: { width: 1920, height: 1080, unit: 'px' },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    views: 89,
    likes: 23,
    isAI: true,
    aiAssistance: 'assisted'
  },
  {
    id: '3',
    artist: {
      id: 'sophia',
      name: 'Sophia Rodriguez',
      handle: 'sophia_art',
      avatarUrl: '/avatars/sophia.jpg',
      followerCount: 890,
      followingCount: 234,
      createdAt: new Date('2023-03-10')
    },
    title: 'Ceramic Contemplation',
    description: 'A hand-crafted ceramic sculpture representing the beauty of human contemplation.',
    imageUrl: '/artworks/sculpture-1.jpg',
    imageAiHint: 'Ceramic sculpture of a woman in contemplation',
    discussionId: 'discussion-3',
    tags: ['ceramic', 'sculpture', 'contemplation'],
    price: 500,
    currency: 'USD',
    isForSale: true,
    category: 'Sculpture',
    medium: 'Ceramic',
    dimensions: { width: 12, height: 18, unit: 'in' },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    views: 67,
    likes: 15,
    isAI: false,
    aiAssistance: 'none'
  }
];

const categories = [
  'All',
  'Abstract',
  'Digital Art',
  'Photography',
  'Sculpture',
  'Painting',
  'Mixed Media',
  'NFTs'
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
];

export default function DiscoverPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(mockArtworks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeArtFilter, setActiveArtFilter] = useState('all');

  useEffect(() => {
    filterAndSortArtworks();
  }, [artworks, searchTerm, selectedCategory, sortBy]);

  const filterAndSortArtworks = () => {
    let filtered = [...artworks];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(artwork =>
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory);
    }

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return (b.likes || 0) - (a.likes || 0);
        case 'trending':
          return (b.views || 0) - (a.views || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    setFilteredArtworks(filtered);
  };

  const handleArtworkClick = (artwork: Artwork) => {
    if (artwork.discussionId) {
      router.push(`/discussion/${artwork.discussionId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Discover Art</h1>
          <p className="text-muted-foreground">
            Explore amazing artworks from talented artists around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks, artists, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeArtFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveArtFilter('all')}
          >
            All
          </Button>
          <Button
            variant={activeArtFilter === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveArtFilter('trending')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </Button>
          <Button
            variant={activeArtFilter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveArtFilter('new')}
          >
            <Clock className="h-4 w-4 mr-1" />
            New
          </Button>
          <Button
            variant={activeArtFilter === 'featured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveArtFilter('featured')}
          >
            <Star className="h-4 w-4 mr-1" />
            Featured
          </Button>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters applied</span>
          </div>
        </div>

        {/* Artworks Grid/List */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={`${activeArtFilter}-${artwork.id}-${Math.random()}`}
                artwork={artwork}
                onClick={() => handleArtworkClick(artwork)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredArtworks.length > 0 && (
          <div className="flex justify-center">
            <Button variant="outline" size="lg">
              Load More Artworks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

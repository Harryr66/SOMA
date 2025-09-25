'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FeaturedHero } from '@/components/featured-hero';
import { ContentRow } from '@/components/content-row';
import { DocuseriesCard } from '@/components/docuseries-card';
import { EpisodeCard } from '@/components/episode-card';
import { useWatchlist } from '@/providers/watchlist-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  mockFeaturedContent, 
  mockContinueWatching, 
  mockTrendingNow, 
  mockNewReleases, 
  mockByCategory,
  mockDocuseries 
} from '@/lib/streaming-data';
import { Docuseries, Episode } from '@/lib/types';
import { Filter, X } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES = [
  { id: 'all', name: 'All Styles', count: mockDocuseries.length },
  // Artistic Styles
  { id: 'Abstract', name: 'Abstract', count: 0 },
  { id: 'Realism', name: 'Realism', count: 0 },
  { id: 'Impressionism', name: 'Impressionism', count: 0 },
  { id: 'Expressionism', name: 'Expressionism', count: 0 },
  { id: 'Surrealism', name: 'Surrealism', count: 0 },
  { id: 'Minimalism', name: 'Minimalism', count: 0 },
  { id: 'Pop Art', name: 'Pop Art', count: 0 },
  { id: 'Street Art', name: 'Street Art', count: 0 },
  // Traditional Art Forms
  { id: 'Traditional Art', name: 'Traditional Art', count: mockByCategory['Traditional Art'].length },
  { id: 'Digital Art', name: 'Digital Art', count: mockByCategory['Digital Art'].length },
  { id: 'Sculpture', name: 'Sculpture', count: mockByCategory['Sculpture'].length },
  { id: 'Mixed Media', name: 'Mixed Media', count: mockByCategory['Mixed Media'].length },
  // Mediums
  { id: 'Oil Painting', name: 'Oil Painting', count: 0 },
  { id: 'Acrylic', name: 'Acrylic', count: 0 },
  { id: 'Watercolor', name: 'Watercolor', count: 0 },
  { id: 'Charcoal', name: 'Charcoal', count: 0 },
  { id: 'Pencil', name: 'Pencil', count: 0 },
  { id: 'Ink', name: 'Ink', count: 0 },
  { id: 'Pastel', name: 'Pastel', count: 0 },
  { id: 'Gouache', name: 'Gouache', count: 0 },
  { id: 'Collage', name: 'Collage', count: 0 },
  { id: 'Photography', name: 'Photography', count: 0 },
  { id: 'Printmaking', name: 'Printmaking', count: 0 },
  { id: 'Ceramics', name: 'Ceramics', count: 0 },
  { id: 'Textiles', name: 'Textiles', count: 0 },
  { id: 'Wood', name: 'Wood', count: 0 },
  { id: 'Metal', name: 'Metal', count: 0 },
  { id: 'Stone', name: 'Stone', count: 0 },
  { id: 'Glass', name: 'Glass', count: 0 },
  { id: 'Digital', name: 'Digital', count: 0 },
  { id: '3D Modeling', name: '3D Modeling', count: 0 },
  { id: 'Animation', name: 'Animation', count: 0 },
];

export default function FeedPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [realEpisodes, setRealEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist, getContinueWatching, isInWatchlist, getWatchProgress } = useWatchlist();

  // Fetch real episodes from database
  useEffect(() => {
    const q = query(
      collection(db, 'episodes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const episodes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Episode[];
      setRealEpisodes(episodes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePlay = (item: Docuseries | Episode) => {
    console.log('Playing:', item.title);
    setIsPlaying(true);
  };

  const handleAddToWatchlist = (docuseriesId: string) => {
    addToWatchlist(docuseriesId);
  };

  const handleShowInfo = () => {
    console.log('Show more info');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const filteredContent = useMemo(() => {
    if (selectedCategory === 'all') {
      return {
        trending: mockTrendingNow,
        newReleases: mockNewReleases,
        mostLoved: mockDocuseries.sort((a, b) => b.rating - a.rating).slice(0, 6)
      };
    }
    
    // Check if it's one of the original categories
    const originalCategoryContent = mockByCategory[selectedCategory as keyof typeof mockByCategory];
    if (originalCategoryContent) {
      return {
        trending: originalCategoryContent,
        newReleases: originalCategoryContent,
        mostLoved: originalCategoryContent.sort((a, b) => b.rating - a.rating)
      };
    }
    
    // For new styles and mediums, filter by tags or category field
    const filteredDocuseries = mockDocuseries.filter(docuseries => {
      const tags = docuseries.tags.map(tag => tag.toLowerCase());
      const categoryLower = docuseries.category.toLowerCase();
      const selectedLower = selectedCategory.toLowerCase();
      
      return tags.includes(selectedLower) || 
             categoryLower.includes(selectedLower) ||
             docuseries.title.toLowerCase().includes(selectedLower);
    });
    
    return {
      trending: filteredDocuseries,
      newReleases: filteredDocuseries,
      mostLoved: filteredDocuseries.sort((a, b) => b.rating - a.rating)
    };
  }, [selectedCategory]);

  const activeFiltersCount = selectedCategory !== 'all' ? 1 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Featured Hero Section */}
      <FeaturedHero
        docuseries={mockFeaturedContent}
        isPlaying={isPlaying}
        onPlay={() => handlePlay(mockFeaturedContent)}
        onAddToWatchlist={() => handleAddToWatchlist(mockFeaturedContent.id)}
        onShowInfo={handleShowInfo}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
      />

      {/* Category Filters */}
    <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter by Style</span>
              <span className="sm:hidden">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')} className="text-sm">
                <X className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            )}
          </div>
          {selectedCategory !== 'all' && (
            <div className="text-sm text-muted-foreground">
              Showing content from: <span className="font-medium text-foreground">{selectedCategory}</span>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-card">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
        </div>

      {/* Content Rows */}
      <div className="space-y-8 pb-16">
        {/* Continue Watching */}
        <ContentRow
          title="Continue Watching"
          subtitle="Pick up where you left off"
          items={getContinueWatching()}
          type="episodes"
          variant="compact"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
          getWatchProgress={getWatchProgress}
        />

        {/* Admin Uploaded Videos */}
        {realEpisodes.length > 0 && (
          <ContentRow
            title="Latest Episodes"
            subtitle="New videos from SOMA"
            items={realEpisodes}
            type="episodes"
            variant="default"
            onItemClick={handlePlay}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
            getWatchProgress={getWatchProgress}
          />
        )}

        {/* Trending Now */}
        {filteredContent.trending.length > 0 && (
          <ContentRow
            title="Trending Now"
            subtitle="What's popular this week"
            items={filteredContent.trending}
            type="docuseries"
            variant="default"
            onItemClick={handlePlay}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}

        {/* New Releases */}
        {filteredContent.newReleases.length > 0 && (
          <ContentRow
            title="New Releases"
            subtitle="Fresh content just added"
            items={filteredContent.newReleases}
            type="docuseries"
            variant="default"
            onItemClick={handlePlay}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}

        {/* Most Loved */}
        {filteredContent.mostLoved.length > 0 && (
          <ContentRow
            title="Most Loved"
            subtitle="Highest rated docuseries"
            items={filteredContent.mostLoved}
            type="docuseries"
            variant="default"
            onItemClick={handlePlay}
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}
      </div>
    </div>
  );
}

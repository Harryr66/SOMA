'use client';

import React, { useState, useMemo } from 'react';
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

const CATEGORIES = [
  { id: 'all', name: 'All Styles', count: mockDocuseries.length },
  { id: 'Traditional Art', name: 'Traditional Art', count: mockByCategory['Traditional Art'].length },
  { id: 'Digital Art', name: 'Digital Art', count: mockByCategory['Digital Art'].length },
  { id: 'Sculpture', name: 'Sculpture', count: mockByCategory['Sculpture'].length },
  { id: 'Mixed Media', name: 'Mixed Media', count: mockByCategory['Mixed Media'].length },
];

export default function FeedPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { addToWatchlist, getContinueWatching, isInWatchlist, getWatchProgress } = useWatchlist();

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
    
    const categoryContent = mockByCategory[selectedCategory as keyof typeof mockByCategory] || [];
    return {
      trending: categoryContent,
      newReleases: categoryContent,
      mostLoved: categoryContent.sort((a, b) => b.rating - a.rating)
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter by Style
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
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

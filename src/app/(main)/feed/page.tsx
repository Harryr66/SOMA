'use client';

import React, { useState } from 'react';
import { FeaturedHero } from '@/components/featured-hero';
import { ContentRow } from '@/components/content-row';
import { DocuseriesCard } from '@/components/docuseries-card';
import { EpisodeCard } from '@/components/episode-card';
import { 
  mockFeaturedContent, 
  mockContinueWatching, 
  mockTrendingNow, 
  mockNewReleases, 
  mockByCategory 
} from '@/lib/streaming-data';
import { Docuseries, Episode } from '@/lib/types';

export default function FeedPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlay = (item: Docuseries | Episode) => {
    console.log('Playing:', item.title);
    setIsPlaying(true);
  };

  const handleAddToWatchlist = (docuseriesId: string) => {
    console.log('Added to watchlist:', docuseriesId);
  };

  const handleShowInfo = () => {
    console.log('Show more info');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

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

      {/* Content Rows */}
      <div className="space-y-8 pb-16">
        {/* Continue Watching */}
        <ContentRow
          title="Continue Watching"
          subtitle="Pick up where you left off"
          items={mockContinueWatching}
          type="episodes"
          variant="compact"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* Trending Now */}
        <ContentRow
          title="Trending Now"
          subtitle="What's popular this week"
          items={mockTrendingNow}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* New Releases */}
        <ContentRow
          title="New Releases"
          subtitle="Fresh content just added"
          items={mockNewReleases}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* Traditional Art */}
        <ContentRow
          title="Traditional Art"
          subtitle="Classic techniques and timeless beauty"
          items={mockByCategory['Traditional Art']}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* Digital Art */}
        <ContentRow
          title="Digital Art"
          subtitle="The future of artistic expression"
          items={mockByCategory['Digital Art']}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* Sculpture */}
        <ContentRow
          title="Sculpture"
          subtitle="Three-dimensional artistry"
          items={mockByCategory['Sculpture']}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />

        {/* Mixed Media */}
        <ContentRow
          title="Mixed Media"
          subtitle="Breaking boundaries and conventions"
          items={mockByCategory['Mixed Media']}
          type="docuseries"
          variant="default"
          onItemClick={handlePlay}
          onAddToWatchlist={handleAddToWatchlist}
        />
      </div>
    </div>
  );
}

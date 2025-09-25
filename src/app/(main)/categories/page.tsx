'use client';

import React, { useState } from 'react';
import { ContentRow } from '@/components/content-row';
import { DocuseriesCard } from '@/components/docuseries-card';
import { useWatchlist } from '@/providers/watchlist-provider';
import { mockDocuseries, mockByCategory } from '@/lib/streaming-data';
import { Docuseries } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Categories', count: mockDocuseries.length },
  { id: 'Traditional Art', name: 'Traditional Art', count: mockByCategory['Traditional Art'].length },
  { id: 'Digital Art', name: 'Digital Art', count: mockByCategory['Digital Art'].length },
  { id: 'Sculpture', name: 'Sculpture', count: mockByCategory['Sculpture'].length },
  { id: 'Mixed Media', name: 'Mixed Media', count: mockByCategory['Mixed Media'].length },
];

const GENRES = [
  { id: 'all', name: 'All Genres', count: mockDocuseries.length },
  { id: 'Documentary', name: 'Documentary', count: mockDocuseries.filter(ds => ds.genre === 'Documentary').length },
  { id: 'Behind the Scenes', name: 'Behind the Scenes', count: mockDocuseries.filter(ds => ds.genre === 'Behind the Scenes').length },
  { id: 'Tutorial', name: 'Tutorial', count: mockDocuseries.filter(ds => ds.genre === 'Tutorial').length },
  { id: 'Process', name: 'Process', count: mockDocuseries.filter(ds => ds.genre === 'Process').length },
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const handlePlay = (docuseries: Docuseries) => {
    console.log('Playing:', docuseries.title);
  };

  const handleAddToWatchlist = (docuseriesId: string) => {
    addToWatchlist(docuseriesId);
  };

  const filteredDocuseries = mockDocuseries.filter(ds => {
    const matchesCategory = selectedCategory === 'all' || ds.category === selectedCategory;
    const matchesGenre = selectedGenre === 'all' || ds.genre === selectedGenre;
    return matchesCategory && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
          <p className="text-muted-foreground text-lg">
            Discover docuseries organized by category and genre
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Categories
            </h3>
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

          {/* Genre Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Button
                  key={genre.id}
                  variant={selectedGenre === genre.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGenre(genre.id)}
                  className="flex items-center gap-2"
                >
                  {genre.name}
                  <Badge variant="secondary" className="ml-1">
                    {genre.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredDocuseries.length} docuseries found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredDocuseries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">No docuseries found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more content.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuseries.map((docuseries) => (
              <DocuseriesCard
                key={docuseries.id}
                docuseries={docuseries}
                variant="default"
                onPlay={handlePlay}
                onAddToWatchlist={handleAddToWatchlist}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuseries.map((docuseries) => (
              <div key={docuseries.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={docuseries.thumbnailUrl}
                  alt={docuseries.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{docuseries.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {docuseries.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{docuseries.category}</Badge>
                    <Badge variant="outline">{docuseries.genre}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {docuseries.totalEpisodes} episodes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePlay(docuseries)}
                  >
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToWatchlist(docuseries.id)}
                  >
                    {isInWatchlist(docuseries.id) ? 'In List' : 'Add to List'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { EpisodeCard } from '@/components/episode-card';
import { DocuseriesCard } from '@/components/docuseries-card';
import { useWatchlist } from '@/providers/watchlist-provider';
import { mockDocuseries, mockEpisodes } from '@/lib/streaming-data';
import { Docuseries, Episode } from '@/lib/types';
import { Search, Filter, X, Clock, Star, Eye } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'duration', label: 'Duration' },
];

const DURATION_FILTERS = [
  { value: 'all', label: 'Any Duration' },
  { value: 'short', label: 'Under 10 min' },
  { value: 'medium', label: '10-30 min' },
  { value: 'long', label: 'Over 30 min' },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'docuseries' | 'episodes'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  const { addToWatchlist, isInWatchlist, getWatchProgress } = useWatchlist();

  const allContent = useMemo(() => {
    const docuseriesWithType = mockDocuseries.map(ds => ({ ...ds, type: 'docuseries' as const }));
    const episodesWithType = mockEpisodes.map(ep => ({ ...ep, type: 'episodes' as const }));
    return [...docuseriesWithType, ...episodesWithType];
  }, []);

  const filteredContent = useMemo(() => {
    let filtered = allContent.filter(item => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item as any).tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Type filter
      const matchesType = selectedType === 'all' || item.type === selectedType;

      // Category filter (for docuseries)
      const matchesCategory = selectedCategory === 'all' || 
        (item.type === 'docuseries' && (item as Docuseries).category === selectedCategory);

      // Genre filter (for docuseries)
      const matchesGenre = selectedGenre === 'all' || 
        (item.type === 'docuseries' && (item as Docuseries).genre === selectedGenre);

      // Duration filter (for episodes)
      const matchesDuration = selectedDuration === 'all' || 
        (item.type === 'episodes' && (() => {
          const episode = item as Episode;
          const durationMinutes = episode.duration / 60;
          switch (selectedDuration) {
            case 'short': return durationMinutes < 10;
            case 'medium': return durationMinutes >= 10 && durationMinutes <= 30;
            case 'long': return durationMinutes > 30;
            default: return true;
          }
        })());

      return matchesSearch && matchesType && matchesCategory && matchesGenre && matchesDuration;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating':
          return (b as any).rating - (a as any).rating;
        case 'views':
          return (b as any).viewCount - (a as any).viewCount;
        case 'duration':
          if (a.type === 'episodes' && b.type === 'episodes') {
            return (b as Episode).duration - (a as Episode).duration;
          }
          return 0;
        default: // relevance
          return 0;
      }
    });

    return filtered;
  }, [allContent, searchQuery, selectedType, selectedCategory, selectedGenre, selectedDuration, sortBy]);

  const handlePlay = (item: Docuseries | Episode) => {
    console.log('Playing:', item.title);
  };

  const handleAddToWatchlist = (docuseriesId: string) => {
    addToWatchlist(docuseriesId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedGenre('all');
    setSelectedDuration('all');
    setSortBy('relevance');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedType !== 'all',
    selectedCategory !== 'all',
    selectedGenre !== 'all',
    selectedDuration !== 'all',
    sortBy !== 'relevance'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Search</h1>
          <p className="text-muted-foreground text-lg">
            Find docuseries and episodes that inspire you
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for docuseries, episodes, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredContent.length} results
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="docuseries">Docuseries</SelectItem>
                      <SelectItem value="episodes">Episodes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Traditional Art">Traditional Art</SelectItem>
                      <SelectItem value="Digital Art">Digital Art</SelectItem>
                      <SelectItem value="Sculpture">Sculpture</SelectItem>
                      <SelectItem value="Mixed Media">Mixed Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="Documentary">Documentary</SelectItem>
                      <SelectItem value="Behind the Scenes">Behind the Scenes</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Process">Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_FILTERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((item) => (
              <div key={`${item.type}-${item.id}`}>
                {item.type === 'docuseries' ? (
                  <DocuseriesCard
                    docuseries={item as Docuseries}
                    variant="default"
                    onPlay={handlePlay}
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                ) : (
                  <EpisodeCard
                    episode={item as Episode}
                    docuseries={mockDocuseries.find(ds => ds.id === (item as Episode).docuseriesId)}
                    variant="default"
                    showProgress={true}
                    progress={getWatchProgress((item as Episode).id)}
                    onPlay={handlePlay}
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArtworkCard } from '@/components/artwork-card';
import { ArtistCard } from '@/components/artist-card';
import { EventCard } from '@/components/event-card';
import { artists, eventsData } from '@/lib/data';
import { Users, Tag, X, Loader2 } from 'lucide-react';
import { type Artwork, type Artist, type Event } from '@/lib/types';
import { ExpandedArtworkView } from '@/components/expanded-artwork-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExpandedEventView } from '@/components/expanded-event-view';

import { cn } from '@/lib/utils';

const suggestedTagCategories = {
  "Popular Subjects": ["portrait", "landscape", "abstract", "still life", "figurative", "animal", "nude", "cityscape", "seascape", "botanical", "mythology"],
  "Art Styles": ["impressionism", "surrealism", "cubism", "pop art", "minimalism", "fantasy", "realism", "expressionism", "futurism", "art nouveau", "street art", "photorealism", "conceptual"],
  "Mediums": ["oil painting", "watercolor", "sculpture", "photography", "digital art", "charcoal", "ink", "gouache", "mixed media", "collage", "linocut", "bronze"],
};


export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Using mock data instead of useContent
  const allArtworks: any[] = []; // Mock data - replace with actual data if needed
  const [activeTab, setActiveTab] = useState('discover');
  const [discoverSubTab, setDiscoverSubTab] = useState('art');
  const [activeArtFilter, setActiveArtFilter] = useState('trending');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // State for randomized data
  const [recommendedArtworks, setRecommendedArtworks] = useState<Artwork[]>([]);
  const [savedBasedArtworks, setSavedBasedArtworks] = useState<Artwork[]>([]);
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);

  // New states for endless scroll
  const [displayedArtworks, setDisplayedArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 9;

  // Mock different data for each filter
  const trendingArtworks = allArtworks;

  // Randomize data on client-side mount to prevent hydration errors
  useEffect(() => {
    if (allArtworks.length > 0) {
      setRecommendedArtworks([...allArtworks].sort(() => 0.5 - Math.random()));
      setSavedBasedArtworks([...allArtworks].sort(() => Math.random() - 0.5));
    }
    setRecommendedArtists([...artists].sort(() => 0.5 - Math.random()).slice(0, 4));
  }, [allArtworks]);

  
  const sourceArtworks = useMemo(() => {
    let sourceList: Artwork[];
    switch (activeArtFilter) {
      case 'recommended':
        sourceList = recommendedArtworks;
        break;
      case 'saved':
        sourceList = savedBasedArtworks;
        break;
      case 'tags':
        if (filterTags.length === 0) {
          sourceList = allArtworks;
        } else {
          sourceList = allArtworks.filter(artwork =>
            filterTags.every(tag => artwork.tags?.map((t: any) => t.toLowerCase()).includes(tag.toLowerCase()))
          );
        }
        break;
      case 'trending':
      default:
        sourceList = trendingArtworks;
    }
    return sourceList;
  }, [activeArtFilter, filterTags, recommendedArtworks, savedBasedArtworks, trendingArtworks, allArtworks]);

  // Effect to reset the artworks when the filter changes
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    const initialArtworks = sourceArtworks.slice(0, PAGE_SIZE);
    setDisplayedArtworks(initialArtworks);
    setHasMore(initialArtworks.length > 0 && sourceArtworks.length > initialArtworks.length);
    setIsLoading(false);
  }, [sourceArtworks]);

  const loadMoreArtworks = () => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const nextPage = page + 1;
      const newArtworks = sourceArtworks.slice(page * PAGE_SIZE, nextPage * PAGE_SIZE);
      
      setDisplayedArtworks(prev => [...prev, ...newArtworks]);
      setPage(nextPage);
      setHasMore(sourceArtworks.length > nextPage * PAGE_SIZE);
      setIsLoading(false);
    }, 1000);
  };
  
  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreArtworks();
        }
      },
      { threshold: 0.8 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, isLoading, sourceArtworks]);


  const trendingArtists = artists.slice(0, 4);
  const newArtists = artists.slice(4, 8);


  const handleAddTag = (tag: string) => {
    const newTag = tag.trim().toLowerCase();
    if (newTag && !filterTags.includes(newTag)) {
        setFilterTags([...filterTags, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setFilterTags(filterTags.filter(t => t !== tagToRemove));
  };


  if (selectedArtwork) {
    return <ExpandedArtworkView artwork={selectedArtwork} onBack={() => setSelectedArtwork(null)} />;
  }

  if (selectedEvent) {
    return <ExpandedEventView event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Discover</h1>
        <p className="text-muted-foreground text-lg">
          Explore new art, connect with artists, and find upcoming events.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="events">Events & Auctions</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-8">
          <Tabs value={discoverSubTab} onValueChange={setDiscoverSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-4">
                <TabsTrigger value="art">Art</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
            </TabsList>
            <TabsContent value="art" className="mt-8">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Button
                  variant="outline"
                  className={cn(
                    'hover:gradient-border',
                    activeArtFilter === 'trending' && 'gradient-border'
                  )}
                  onClick={() => setActiveArtFilter('trending')}
                  size="sm"
                >
                  Trending
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    'hover:gradient-border',
                    activeArtFilter === 'recommended' && 'gradient-border'
                  )}
                  onClick={() => setActiveArtFilter('recommended')}
                  size="sm"
                >
                  For you
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    'hover:gradient-border',
                    activeArtFilter === 'saved' && 'gradient-border'
                  )}
                  onClick={() => setActiveArtFilter('saved')}
                  size="sm"
                >
                  Inspired by Saved
                </Button>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setActiveArtFilter('tags')}
                      size="sm"
                      className={cn(
                        "relative hover:gradient-border",
                        activeArtFilter === 'tags' && 'gradient-border'
                      )}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Tags
                       {filterTags.length > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {filterTags.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96">
                     <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filter by Tags</h4>
                        <p className="text-sm text-muted-foreground">
                          Add tags to narrow your discovery.
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="e.g. abstract"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag(tagInput);
                              }
                            }}
                            className="focus-visible:ring-teal-500"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddTag(tagInput)}
                            className="bg-teal-600 text-primary-foreground hover:bg-teal-600/90"
                          >
                            Add
                          </Button>
                        </div>
                         {filterTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {filterTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="pl-2 pr-1">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-background/20">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                       <div className="pt-2 space-y-4">
                        {Object.entries(suggestedTagCategories).map(([category, suggested]) => (
                            <div key={category}>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggested
                                        .filter(tag => !filterTags.includes(tag.toLowerCase()))
                                        .slice(0, 7) // Show a limited number of suggestions
                                        .map(tag => (
                                            <Badge 
                                                key={tag} 
                                                variant="outline"
                                                className="cursor-pointer hover:bg-muted"
                                                onClick={() => handleAddTag(tag)}
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(tag)}
                                            >
                                                {tag}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {displayedArtworks.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {displayedArtworks.map((artwork) => (
                      <ArtworkCard 
                          key={`${activeArtFilter}-${artwork.id}-${Math.random()}`} // Add random key to ensure re-render on filter change
                          artwork={artwork} 
                          displayMode="tile"
                          onClick={() => {
                            if (artwork.discussionId) {
                              router.push(`/discussion/${artwork.discussionId}`);
                            } else {
                              setSelectedArtwork(artwork);
                            }
                          }}
                      />
                    ))}
                  </div>
                  <div ref={observerRef} className="h-20 flex items-center justify-center">
                    {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                    {!hasMore && !isLoading && <p className="text-muted-foreground">You've reached the end.</p>}
                  </div>
                </>
              ) : (
                !isLoading && (
                  <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                      <h3 className="font-headline text-2xl text-card-foreground">No Art Found</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your filters or explore trending art.</p>
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="artists" className="mt-6">
                <>
                   <section>
                    <h2 className="font-headline text-2xl font-semibold mb-4">Trending Artists</h2>
                    {trendingArtists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trendingArtists.map((artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-card rounded-lg border border-dashed flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-headline text-xl text-card-foreground">No Trending Artists Yet</h3>
                          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">Popular artists will be featured here as the community grows.</p>
                      </div>
                    )}
                  </section>

                  <section className="mt-12">
                    <h2 className="font-headline text-2xl font-semibold mb-4">Recommended for You</h2>
                    {recommendedArtists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedArtists.map((artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-card rounded-lg border border-dashed flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-headline text-xl text-card-foreground">Engage to Get Recommendations</h3>
                          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">Follow and like artists to discover new creators we think you'll love.</p>
                      </div>
                    )}
                  </section>

                   <section className="mt-12">
                    <h2 className="font-headline text-2xl font-semibold mb-4">New to SOMA</h2>
                    {newArtists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArtists.map((artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-card rounded-lg border border-dashed flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-headline text-xl text-card-foreground">Discover New Talent</h3>
                          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">New artists who join SOMA will appear in this section.</p>
                      </div>
                    )}
                  </section>
                </>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {eventsData.length > 0 ? (
            <section>
              <h2 className="font-headline text-2xl font-semibold mb-4">Upcoming Events & Auctions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </section>
          ) : (
             <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <h3 className="font-headline text-2xl text-card-foreground">No Upcoming Events</h3>
                <p className="text-muted-foreground mt-2">Check back later for new events and auctions.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

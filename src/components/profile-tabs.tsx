'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Users, Calendar, Gavel, Package, Play, Bookmark, UserPlus, Clock, Heart } from 'lucide-react';
import { ArtworkCard } from './artwork-card';
import { ProductCard } from './shop/product-card';
import { EventCard } from './event-card';
import { CommunityCard } from './community/community-card';
import { CreateCommunityDialog } from './community/create-community-dialog';
import { EpisodeCard } from './episode-card';
import { DocuseriesCard } from './docuseries-card';
import { useWatchlist } from '@/providers/watchlist-provider';
import { useFollow } from '@/providers/follow-provider';
import { mockDocuseries, mockEpisodes } from '@/lib/streaming-data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
  isProfessional: boolean;
  onTabChange?: (tab: string) => void;
}

export function ProfileTabs({ userId, isOwnProfile, isProfessional, onTabChange }: ProfileTabsProps) {
  const [showCreateCommunity, setShowCommunity] = useState(false);
  const { watchlist, watchHistory, getContinueWatching, isInWatchlist, getWatchProgress } = useWatchlist();
  const { followedArtists, unfollowArtist } = useFollow();

  if (isProfessional) {
    return (
      <Tabs defaultValue="portfolio" className="w-full" onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Artwork Portfolio</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* TODO: Replace with actual artwork data */}
            <ArtworkCard 
              artwork={{
                id: '1',
                title: 'Sample Artwork',
                imageUrl: '/placeholder-art.jpg',
                imageAiHint: 'Sample artwork description',
                artist: { 
                  id: '1',
                  name: 'Artist Name', 
                  handle: 'artist',
                  followerCount: 0,
                  followingCount: 0,
                  createdAt: new Date()
                },
                price: 299,
                currency: 'USD',
                isForSale: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: []  // Add required tags field
              }}
            />
          </div>

          {/* Empty State */}
          <Card className="p-8 text-center">
            <CardContent>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No artwork yet</CardTitle>
              <CardDescription className="mb-4">
                {isOwnProfile 
                  ? "Start building your portfolio by uploading your first artwork."
                  : "This artist hasn't uploaded any artwork yet."
                }
              </CardDescription>
              {isOwnProfile && (
                <Button asChild variant="gradient">
                  <a href="/upload">Upload Artwork</a>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-4">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="auctions">Active Auctions</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            {/* Products Sub-tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Products for Sale</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* TODO: Replace with actual product data */}
              </div>

              <Card className="p-8 text-center">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No products yet</CardTitle>
                  <CardDescription className="mb-4">
                    {isOwnProfile 
                      ? "Start selling your artwork by listing your first product."
                      : "This artist doesn't have any products for sale yet."
                    }
                  </CardDescription>
                  {isOwnProfile && (
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      List an Item
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Auctions Sub-tab */}
            <TabsContent value="auctions" className="space-y-4">
              <Card className="p-8 text-center">
                <CardContent>
                  <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">Auctions Coming Soon</CardTitle>
                  <CardDescription>
                    Live auction functionality will be available soon.
                  </CardDescription>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Sub-tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Hosted Events</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TODO: Replace with actual event data */}
              </div>

              <Card className="p-8 text-center">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No events yet</CardTitle>
                  <CardDescription className="mb-4">
                    {isOwnProfile 
                      ? "Host your first event to connect with your community."
                      : "This artist hasn't hosted any events yet."
                    }
                  </CardDescription>
                  {isOwnProfile && (
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Community</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TODO: Replace with actual community data */}
          </div>

          <Card className="p-8 text-center">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No community yet</CardTitle>
              <CardDescription className="mb-4">
                {isOwnProfile 
                  ? "Create a community to connect with your followers and fans."
                  : "This artist hasn't created a community yet."
                }
              </CardDescription>
              {isOwnProfile && (
                <Button 
                  variant="gradient"
                  onClick={() => setShowCommunity(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Start Community
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }

  // Regular user tabs
  return (
    <Tabs defaultValue="watchlist" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>

      {/* Watchlist Tab - Previously Watched */}
      <TabsContent value="watchlist" className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Continue Watching</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getContinueWatching().map((episode) => (
            episode && (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                docuseries={mockDocuseries.find(ds => ds.id === episode.docuseriesId)}
                variant="default"
                showProgress={true}
                progress={getWatchProgress(episode.id)}
                onPlay={() => console.log('Play episode:', episode.title)}
              />
            )
          ))}
        </div>

        {getContinueWatching().length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No watch history yet</CardTitle>
              <CardDescription className="mb-4">
                Start watching docuseries to see your continue watching list here.
              </CardDescription>
              <Button asChild variant="gradient">
                <a href="/feed">Start Watching</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Bookmarks Tab - Saved Episodes */}
      <TabsContent value="bookmarks" className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Bookmarked Episodes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            item.docuseries && (
              <DocuseriesCard
                key={item.id}
                docuseries={item.docuseries}
                variant="default"
                onPlay={() => console.log('Play docuseries:', item.docuseries.title)}
                onAddToWatchlist={() => console.log('Already in watchlist')}
              />
            )
          ))}
        </div>

        {watchlist.length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No bookmarks yet</CardTitle>
              <CardDescription className="mb-4">
                Save docuseries you want to watch later by adding them to your watchlist.
              </CardDescription>
              <Button asChild variant="gradient">
                <a href="/feed">Browse Content</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Following Tab - Followed Artists */}
      <TabsContent value="following" className="space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Following Artists</h3>
          <Badge variant="secondary">{followedArtists.length}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artist.avatarUrl || undefined} alt={artist.name} />
                    <AvatarFallback>{artist.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{artist.name}</h4>
                      {artist.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">@{artist.handle}</p>
                    <p className="text-xs text-muted-foreground">
                      {artist.followerCount.toLocaleString()} followers
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unfollowArtist(artist.id)}
                  >
                    Unfollow
                  </Button>
                </div>
                {artist.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {artist.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {followedArtists.length === 0 && (
          <Card className="p-8 text-center">
            <CardContent>
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">Not following anyone yet</CardTitle>
              <CardDescription className="mb-4">
                Follow artists you love to see their latest content and updates.
              </CardDescription>
              <Button asChild variant="gradient">
                <a href="/discover">Discover Artists</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Create Community Dialog */}
      {showCreateCommunity && (
        <CreateCommunityDialog 
          onClose={() => setShowCommunity(false)} 
        />
      )}
    </Tabs>
  );
}

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Users, Calendar, Gavel, Package } from 'lucide-react';
import { ArtworkCard } from './artwork-card';
import { ProductCard } from './shop/product-card';
import { EventCard } from './event-card';
import { CommunityCard } from './community/community-card';
import { CreateCommunityDialog } from './community/create-community-dialog';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
  isProfessional: boolean;
}

export function ProfileTabs({ userId, isOwnProfile, isProfessional }: ProfileTabsProps) {
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);

  if (isProfessional) {
    return (
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Artwork Portfolio</h3>
            {isOwnProfile && (
              <Button asChild variant="gradient">
                <a href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Artwork
                </a>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TODO: Replace with actual artwork data */}
            <ArtworkCard 
              artwork={{
                id: '1',
                title: 'Sample Artwork',
                imageUrl: '/placeholder-art.jpg',
                artist: { name: 'Artist Name', handle: 'artist' },
                price: 299,
                currency: 'USD',
                isForSale: true,
                createdAt: new Date(),
                updatedAt: new Date()
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
                {isOwnProfile && (
                  <Button variant="gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    List an Item
                  </Button>
                )}
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
                {isOwnProfile && (
                  <Button variant="gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                )}
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
            {isOwnProfile && (
              <Button 
                variant="gradient"
                onClick={() => setShowCreateCommunity(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Start Community
              </Button>
            )}
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
                  onClick={() => setShowCreateCommunity(true)}
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
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="feed">My Feed</TabsTrigger>
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
      </TabsList>

      {/* My Feed Tab */}
      <TabsContent value="feed" className="space-y-4">
        <h3 className="text-lg font-semibold">My Feed</h3>
        
        <div className="space-y-4">
          {/* TODO: Replace with actual feed data */}
        </div>

        <Card className="p-8 text-center">
          <CardContent>
            <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📱</div>
            <CardTitle className="mb-2">Your feed is empty</CardTitle>
            <CardDescription className="mb-4">
              Discover amazing art and follow artists to see their posts in your feed.
            </CardDescription>
            <Button asChild variant="gradient">
              <a href="/discover">Discover Art</a>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Watchlist Tab */}
      <TabsContent value="watchlist" className="space-y-4">
        <h3 className="text-lg font-semibold">Watchlist</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TODO: Replace with actual watchlist data */}
        </div>

        <Card className="p-8 text-center">
          <CardContent>
            <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">👀</div>
            <CardTitle className="mb-2">No saved items yet</CardTitle>
            <CardDescription className="mb-4">
              Save artworks you love to your watchlist to view them later.
            </CardDescription>
            <Button asChild variant="gradient">
              <a href="/discover">Discover Art</a>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Create Community Dialog */}
      {showCreateCommunity && (
        <CreateCommunityDialog 
          onClose={() => setShowCreateCommunity(false)} 
        />
      )}
    </Tabs>
  );
}

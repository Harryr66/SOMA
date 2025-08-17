
'use client';

import { ArtPost } from '@/components/art-post';
import { ArtworkCard } from '@/components/artwork-card';
import { ProfileHeader } from '@/components/profile-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenSquare, Users, ShoppingBag, Heart, Star, DollarSign, Gavel, Upload, Calendar, PlusCircle, Repeat } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useContent } from '@/providers/content-provider';
import { artworkData } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { type Artwork } from '@/lib/types';

export default function ProfilePage() {
  const { user, isProfessional } = useAuth();
  const { toast } = useToast();
  const { posts, artworks } = useContent();
  const router = useRouter();

  const userPortfolio = artworks.filter(artwork => artwork.artist.id === user?.uid);
  const products = artworkData.slice(6, 10);
  const watchlistItems = artworkData.slice(2, 5);
  
  const [isOwnProfile] = useState(true); 
  const [community, setCommunity] = useState<{ created: boolean; isPaid: boolean; price: number; name: string } | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    const savedCommunity = localStorage.getItem('soma-community');
    if (savedCommunity) {
      setCommunity(JSON.parse(savedCommunity));
    }
  }, []);

  const handleCreateCommunity = () => {
    if (!communityName.trim()) {
        toast({
            variant: 'destructive',
            title: 'Community Name Required',
            description: 'Please enter a name for your community.',
        });
        return;
    }
    const priceValue = parseFloat(price);
    if (isPaid && (isNaN(priceValue) || priceValue <= 0)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Price',
            description: 'Please enter a valid price for the subscription.',
        });
        return;
    }

    const newCommunity = {
        created: true,
        isPaid: isPaid,
        price: isPaid ? priceValue : 0,
        name: communityName.trim(),
    };

    setCommunity(newCommunity);
    localStorage.setItem('soma-community', JSON.stringify(newCommunity));

    toast({
        title: 'Community Created!',
        description: isPaid ? `Your community "${newCommunity.name}" is now live with a $${priceValue}/month subscription.` : `Your free community "${newCommunity.name}" is now live!`,
    });
  };

  const renderCommunityContent = () => {
    if (isOwnProfile) { // Artist's own view
      if (community?.created) {
        return (
            <div className="text-center py-20 bg-card rounded-lg border">
                <h3 className="font-headline text-2xl font-semibold">Welcome to {community.name}</h3>
                <p className="text-muted-foreground mt-1 mb-6">Manage your members, posts, and settings.</p>
                 <Button asChild variant="default">
                    <Link href="/community">Manage Community</Link>
                </Button>
            </div>
        );
      } else { // Artist has not created a community yet
        return (
            <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-headline text-2xl mt-4 font-semibold">Start Your Community</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">Create a dedicated space for your followers to connect, share, and engage with your work.</p>
                <Dialog>
                    <DialogTrigger asChild>
                         <Button className="mt-6 font-semibold" variant="default">Start Community</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Up Your Community</DialogTitle>
                            <DialogDescription>
                                Give your community a name and choose if it will be free or require a paid subscription.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                             <div className="space-y-2">
                                <Label htmlFor="community-name">Community Name</Label>
                                <Input id="community-name" placeholder="e.g. Elena's Art Club" value={communityName} onChange={(e) => setCommunityName(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="is-paid-switch">Charge a subscription fee</Label>
                                <Switch id="is-paid-switch" checked={isPaid} onCheckedChange={setIsPaid} />
                            </div>
                            {isPaid && (
                                <div className="space-y-2">
                                    <Label htmlFor="price">Monthly Price (USD)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="price" type="number" placeholder="5.00" className="pl-8" value={price} onChange={(e) => setPrice(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                           <Button onClick={handleCreateCommunity} variant="default">Create Community</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
      }
    } else { // Visitor's view
      if (community?.created) {
         return (
            <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-headline text-2xl mt-4 font-semibold">Join {community.name}</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">Become part of the inner circle and get exclusive updates, behind-the-scenes content, and more.</p>
                <Button asChild className="mt-6 font-semibold" variant="default">
                    <Link href="/community">
                        {community.isPaid ? `Subscribe to Join ($${community.price}/mo)` : 'Join Community'}
                    </Link>
                </Button>
            </div>
        );
      } else {
        return (
            <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-headline text-2xl mt-4 font-semibold">Community Coming Soon</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">This artist hasn't started their community yet. Join the waitlist to be notified when it launches.</p>
                <Button className="mt-6 font-semibold" onClick={() => toast({title: "You're on the list!", description: "We'll notify you when this community launches."})} variant="default">Join Waitlist</Button>
            </div>
        );
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader />

      {isProfessional ? (
        <Tabs defaultValue="portfolio" className="mt-8">
          <TabsList className="bg-card border grid grid-cols-3 h-auto">
            <TabsTrigger value="portfolio" className="py-2"><PenSquare className="w-4 h-4 mr-2" />Portfolio</TabsTrigger>
            <TabsTrigger value="shop" className="py-2"><ShoppingBag className="w-4 h-4 mr-2" />Shop</TabsTrigger>
            <TabsTrigger value="community" className="py-2"><Users className="w-4 h-4 mr-2" />Community</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            {userPortfolio.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userPortfolio.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} onClick={() => artwork.discussionId && router.push(`/discussion/${artwork.discussionId}`)} />
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-lg border border-dashed col-span-full">
                    <PenSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-headline text-2xl mt-4 font-semibold">
                        {isOwnProfile ? "Your Portfolio is Empty" : "Portfolio is Empty"}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                        {isOwnProfile ? "Upload your first piece to start building your portfolio." : "This artist hasn't uploaded any work yet."}
                    </p>
                    {isOwnProfile && isProfessional && <Button className="mt-4 gradient-border text-foreground" asChild><Link href="/upload"><Upload className="mr-2 h-4 w-4" />Upload Artwork</Link></Button>}
                </div>
            )}
          </TabsContent>

          <TabsContent value="shop" className="mt-6">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="auctions">Active Auctions</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              <TabsContent value="products" className="mt-6">
                 {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="font-headline text-2xl mt-4 font-semibold">
                          {isOwnProfile ? "Your Shop is Empty" : "Shop is Empty"}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {isOwnProfile ? "List an item for sale to start your shop." : "This artist hasn't listed any products for sale."}
                        </p>
                         {isOwnProfile && isProfessional && <Button className="mt-4 gradient-border text-foreground" asChild><Link href="/upload"><Upload className="mr-2 h-4 w-4" />List an Item</Link></Button>}
                    </div>
                )}
              </TabsContent>
              <TabsContent value="auctions" className="mt-6">
                <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
                  <Gavel className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-6 font-headline text-3xl font-semibold text-card-foreground">The Auction House is Being Built</h3>
                  <p className="mt-3 max-w-md mx-auto text-muted-foreground">This artist's auctions will appear here when the feature launches. Get ready for the thrill of the auction!</p>
                </div>
              </TabsContent>
              <TabsContent value="events" className="mt-6">
                <EventsTabContent isOwnProfile={isOwnProfile} />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="community" className="mt-6">
            {renderCommunityContent()}
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="feed" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed"><Repeat className="w-4 h-4 mr-2" />My Feed</TabsTrigger>
            <TabsTrigger value="watchlist"><Star className="w-4 h-4 mr-2" />Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            {(() => {
                const userFeedPosts = posts
                .filter(p => p.resharedBy?.id === user?.uid || p.artist.id === user?.uid)
                .sort((a, b) => b.createdAt - a.createdAt);

                if (userFeedPosts.length > 0) {
                return (
                    <div className="space-y-8 max-w-2xl mx-auto">
                    {userFeedPosts.map((post) => (
                        <ArtPost key={post.id} post={post} />
                    ))}
                    </div>
                );
                } else {
                return (
                    <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                        <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="font-headline text-2xl mt-4 font-semibold">Your Feed is Empty</h3>
                        <p className="text-muted-foreground mt-1">Reshare posts from other artists to see them here.</p>
                        <Button className="mt-4" variant="outline" asChild><Link href="/discover">Discover Art</Link></Button>
                    </div>
                );
                }
            })()}
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
             {watchlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {watchlistItems.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                </div>
             ) : (
                 <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                    <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-headline text-2xl mt-4 font-semibold">Your Watchlist is Empty</h3>
                    <p className="text-muted-foreground mt-1">Add art for sale and auctions to your watchlist to keep track of them.</p>
                     <Button className="mt-4" variant="outline" asChild><Link href="/discover">Discover Art</Link></Button>
                </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}


function EventsTabContent({ isOwnProfile }: { isOwnProfile: boolean }) {
  const [events, setEvents] = useState<any[]>([]); // In a real app, you'd fetch this
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle form data from the event target
    toast({
      title: 'Event Created!',
      description: 'Your new event has been added to your profile.',
    });
    setIsDialogOpen(false);
  };
  
  if (events.length > 0) {
    // When events exist, you would map over them and render EventCards
    // For now, this part remains unseen as we start with an empty array.
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <p>Your events would show here.</p>
        {/* {events.map(event => <EventCard key={event.id} event={event} />)} */}
      </div>
    );
  }

  // Creator's view when they have no events
  if (isOwnProfile) {
    return (
      <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="font-headline text-2xl mt-4 font-semibold">No Upcoming Events</h3>
        <p className="text-muted-foreground mt-1 mb-4">Post and manage your galleries, charity events, and more.</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Event</DialogTitle>
              <DialogDescription>
                Fill out the details below to promote your event.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4 py-4">
              <div>
                <Label htmlFor="event-title">Event Title</Label>
                <Input id="event-title" placeholder="e.g. Summer Gallery Opening" />
              </div>
              <div>
                <Label htmlFor="event-date">Date</Label>
                <Input id="event-date" type="date" />
              </div>
              <div>
                <Label htmlFor="event-desc">Description</Label>
                <Textarea id="event-desc" placeholder="Tell everyone about your event..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default">Add Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Follower's view when the artist has no events
  return (
    <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="font-headline text-2xl mt-4 font-semibold">No Upcoming Events</h3>
      <p className="text-muted-foreground mt-1">This artist has not scheduled any events yet. Check back soon!</p>
    </div>
  );
}

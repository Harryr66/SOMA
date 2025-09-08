
'use client';

import { ArtworkCard } from '@/components/artwork-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatMessages, exclusiveContentData, discussionsData } from '@/lib/data';
import { type ChatMessage, type Discussion, type Artist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SendHorizonal, PlusCircle, Trash2, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DiscussionCard } from '@/components/discussion-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';


function ChatInterface({ messages }: { messages: ChatMessage[] }) {
    const [input, setInput] = React.useState('');
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send the message to a backend service.
        console.log('Sending message:', input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-[80vh] bg-card border rounded-lg">
            <div className="p-4 border-b">
                <h2 className="font-headline text-xl">Community Chat</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn('flex items-start gap-3', msg.isOwnMessage && 'flex-row-reverse')}>
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} data-ai-hint="artist portrait" />
                                <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2", msg.isOwnMessage ? 'bg-foreground text-background' : 'bg-muted')}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs text-right opacity-70 mt-1">{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..." 
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <SendHorizonal className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

const linkFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  url: z.string().url("Please enter a valid URL."),
});

// New component for Links Tab
function LinksTabContent() {
  const { toast } = useToast();
  const [links, setLinks] = useState<{ id: number; title: string; url: string; }[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<z.infer<typeof linkFormSchema>>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: { title: '', url: '' },
  });

  function onSubmit(data: z.infer<typeof linkFormSchema>) {
    setLinks([...links, { id: Date.now(), ...data }]);
    toast({
      title: 'Link Added!',
      description: `The link "${data.title}" has been added to your community.`,
    });
    form.reset();
    setIsAdding(false);
  }
  
  function removeLink(id: number) {
    setLinks(links.filter(link => link.id !== id));
    toast({
      title: 'Link Removed',
      description: 'The link has been removed from your community.'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Community Links</CardTitle>
        <CardDescription>Add or remove affiliate links, social profiles, and other important URLs to share with your community.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {links.map(link => (
            <div key={link.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
              <div className="flex items-center gap-3">
                 <LinkIcon className="h-4 w-4 text-muted-foreground" />
                 <div>
                    <p className="font-semibold">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate">{link.url}</a>
                 </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeLink(link.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
           {links.length === 0 && (
             <div className="text-center py-10 text-sm text-muted-foreground">
                No links have been added yet.
            </div>
          )}
        </div>
        
        {isAdding ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. My Portfolio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Add Link</Button>
              </div>
            </form>
          </Form>
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Link
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Updated component for Discussions Tab
function DiscussionsTabContent() {
  const { toast } = useToast();
  // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const isProfessional = false;
  const loading = false;
  const signOut = () => {};
  const [discussions, setDiscussions] = useState<Discussion[]>(discussionsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedDiscussions = React.useMemo(() => {
    return [...discussions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;
      return scoreB - scoreA;
    });
  }, [discussions]);

  // For demonstration, we'll assume the current user is the creator.
  const isCreator = true;

  const discussionFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    content: z.string().min(10, 'Content is required.'),
  });

  const form = useForm<z.infer<typeof discussionFormSchema>>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: { title: '', content: '' },
  });

  function onSubmit(data: z.infer<typeof discussionFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }

    const currentUserArtist: Artist = {
      id: user.id,
      name: user.displayName || 'Anonymous User',
      handle: user.email?.split('@')[0] || 'anonymous',
      avatarUrl: undefined,
    };

    const newDiscussion: Discussion = {
      id: `d-${Date.now()}`,
      title: data.title,
      content: data.content,
      author: currentUserArtist,
      timestamp: 'Just now',
      upvotes: 0,
      downvotes: 0,
      isPinned: false,
      replyCount: 0,
    };

    setDiscussions((prev) => [newDiscussion, ...prev]);
    toast({
      title: 'Discussion Started!',
      description: 'Your new discussion has been posted.',
    });
    form.reset();
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start a New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Share your thoughts, ask a question, or start a conversation with the community.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="What's the topic?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share more details here..." {...field} rows={5}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Post Discussion</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {sortedDiscussions.map((discussion) => (
          <DiscussionCard key={discussion.id} discussion={discussion} isCreator={isCreator} />
        ))}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [communityName, setCommunityName] = useState("Community Hub");
  const router = useRouter();

  useEffect(() => {
    const savedCommunity = localStorage.getItem('soma-community');
    if (savedCommunity) {
      const communityData = JSON.parse(savedCommunity);
      if (communityData.name) {
          setCommunityName(`${communityData.name}`);
      } else {
          setCommunityName(`Elena Vance's Community Hub`);
      }
    } else {
        setCommunityName(`Elena Vance's Community Hub`);
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 hidden md:inline-flex">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">{communityName}</h1>
        <p className="text-muted-foreground text-lg">
          Welcome! Here you can find exclusive content and chat with other members.
        </p>
      </header>

      <Tabs defaultValue="chat" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-max pb-2">
            <TabsTrigger value="chat">Group Chat</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="content">Exclusive Content</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
        <TabsContent value="chat" className="mt-6">
            <ChatInterface messages={chatMessages} />
        </TabsContent>
        <TabsContent value="discussions" className="mt-6">
            <DiscussionsTabContent />
        </TabsContent>
        <TabsContent value="content" className="mt-6">
            {exclusiveContentData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {exclusiveContentData.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                    <h3 className="font-headline text-2xl">No Exclusive Content Yet</h3>
                    <p className="text-muted-foreground mt-2">The artist hasn't posted any exclusive content for the community.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="links" className="mt-6">
          <LinksTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

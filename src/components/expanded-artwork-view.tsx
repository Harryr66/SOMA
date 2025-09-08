
'use client';

import { type Artwork, type Discussion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Repeat, Send, Bookmark, Info, Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { GradientHeart } from './gradient-heart';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/providers/content-provider';
import { useAuth } from '@/providers/auth-provider';
import { DiscussionCard } from './discussion-card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { DiscussionThread } from './discussion-thread';

interface ExpandedArtworkViewProps {
  artwork: Artwork;
  onBack: () => void;
}

export function ExpandedArtworkView({ artwork, onBack }: ExpandedArtworkViewProps) {
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const { user } = useAuth();
    const { discussions } = useContent();

    const discussion = useMemo(() => discussions.find((d) => d.id === artwork.discussionId), [artwork.discussionId, discussions]);
    
    const isCreator = useMemo(() => {
        if (!user || !discussion) return false;
        return (user.uid || "demo-user") === discussion.author.id;
    }, [user, discussion]);

    const handleLike = () => setIsLiked(!isLiked);
    const handleSave = () => {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        toast({
            title: newSavedState ? 'Saved to collection' : 'Removed from collection',
        });
    };
    const handleReshare = () => toast({ title: 'Reshared!' });
    const handleSend = () => toast({ title: 'Sent!' });

    const renderDiscussion = () => {
        if (!artwork.discussionId) {
            return (
                 <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
                    <div>
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No Discussion Available</h3>
                        <p>There is no discussion thread associated with this artwork.</p>
                    </div>
                </div>
            );
        }

        if (discussions.length > 0 && !discussion) {
            return (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
                    <div>
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">Discussion Not Found</h3>
                    </div>
                </div>
            );
        }

        if (!discussion) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        return (
             <div className="space-y-2">
                <DiscussionCard discussion={discussion} isCreator={isCreator} isExpanded={true} />
                <Separator />
                <DiscussionThread discussion={discussion} />
            </div>
        )
    };

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden animate-in fade-in-25">
            <div className="flex h-full flex-col md:flex-row">
                <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8 relative">
                    <div className="absolute top-4 left-4 z-10">
                        <Button variant="ghost" size="icon" onClick={onBack} className="bg-background/50 hover:bg-background/80 rounded-full h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back to Discover</span>
                        </Button>
                    </div>
                    <div className="flex-grow flex flex-col bg-card rounded-lg p-4 border overflow-hidden">
                        <div className="relative flex-grow">
                             <Image src={artwork.imageUrl} alt={artwork.title} fill style={{objectFit: "contain"}} data-ai-hint={artwork.imageAiHint} />
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h2 className="font-headline text-2xl font-semibold">{artwork.title}</h2>
                            <div className="flex items-center mt-2 -ml-3">
                                <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleLike}>
                                    {isLiked ? <GradientHeart className="w-7 h-7" /> : <Heart className="w-7 h-7" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleReshare}>
                                    <Repeat className="h-7 h-7" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleSend}>
                                    <Send className="h-7 h-7" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleSave}>
                                    <Bookmark className={`w-7 h-7 transition-colors ${isSaved ? 'text-primary fill-current' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block w-full md:w-1/2 p-4 md:p-8 overflow-y-auto no-scrollbar space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <Link href={`/profile/${artwork.artist.id}`} className="flex items-center gap-3 group" onClick={(e) => e.stopPropagation()}>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={artwork.artist.avatarUrl} alt={artwork.artist.name} data-ai-hint="artist portrait" />
                                <AvatarFallback>{artwork.artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg group-hover:underline">{artwork.artist.name}</p>
                                <p className="text-sm text-muted-foreground">{artwork.artist.handle}</p>
                            </div>
                        </Link>
                        <Button asChild size="sm">
                           <Link href={`/profile/${artwork.artist.id}`} onClick={(e) => e.stopPropagation()}>View Profile</Link>
                        </Button>
                    </div>
                    <Separator />
                    {renderDiscussion()}
                </div>
            </div>
        </div>
    );
}

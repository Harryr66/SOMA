
'use client';

import { type Event, type Discussion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Info, Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { useContent } from '@/providers/content-provider';
import { useAuth } from '@/providers/auth-provider';
import { DiscussionCard } from './discussion-card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { DiscussionThread } from './discussion-thread';

interface ExpandedEventViewProps {
  event: Event;
  onBack: () => void;
}

export function ExpandedEventView({ event, onBack }: ExpandedEventViewProps) {
    const { discussions } = useContent();
    const { user } = useAuth();

    const discussion = useMemo(() => discussions.find((d) => d.id === event.discussionId), [event.discussionId, discussions]);

    const isCreator = useMemo(() => {
        if (!user || !discussion) return false;
        return (user.uid || "demo-user") === discussion.author.id;
    }, [user, discussion]);

    const renderDiscussion = () => {
        if (!event.discussionId) {
            return (
                 <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
                    <div>
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No Discussion Available</h3>
                        <p>There is no discussion thread associated with this event.</p>
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
            <div className="space-y-6">
                <DiscussionCard discussion={discussion} isCreator={isCreator} isExpanded={true}/>
                <Separator />
                <DiscussionThread discussion={discussion} />
            </div>
        );
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
                             <Image src={event.imageUrl} alt={event.title} fill style={{objectFit: "cover"}} data-ai-hint={event.imageAiHint} />
                        </div>
                        <div className="mt-4 pt-4 border-t space-y-2">
                            <h2 className="font-headline text-2xl font-semibold">{event.title}</h2>
                            <p className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> {event.date}</p>
                            <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> {event.locationType}{event.locationType === 'In-person' && event.locationName && event.locationAddress && `: ${event.locationName}, ${event.locationAddress}`}</p>
                            <p className="text-foreground/90 pt-2">{event.description}</p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block w-full md:w-1/2 p-4 md:p-8 overflow-y-auto no-scrollbar space-y-4">
                     <div className="flex items-center justify-between gap-4">
                        <Link href={`/profile/${event.artist.id}`} className="flex items-center gap-3 group" onClick={(e) => e.stopPropagation()}>
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={event.artist.avatarUrl} alt={event.artist.name} data-ai-hint="artist portrait" />
                                <AvatarFallback>{event.artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg group-hover:underline">{event.artist.name}</p>
                                <p className="text-sm text-muted-foreground">{event.artist.handle}</p>
                            </div>
                        </Link>
                        <Button asChild variant="outline" size="sm">
                           <Link href={`/profile/${event.artist.id}`} onClick={(e) => e.stopPropagation()}>View Profile</Link>
                        </Button>
                    </div>
                    <Separator />
                    {renderDiscussion()}
                </div>
            </div>
        </div>
    );
}


'use client';

import { DiscussionCard } from '@/components/discussion-card';
import { type Discussion } from '@/lib/types';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { DiscussionThread } from '@/components/discussion-thread';

export default function DiscussionPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const isProfessional = false;
  const loading = false;
  const signOut = () => {};
    // Using mock data instead of useContent
  const discussions: any[] = [];
  const posts: any[] = []; // Mock data - replace with actual data if needed

    const discussion = useMemo(() => discussions.find((d) => d.id === id), [id, discussions]);
    const post = useMemo(() => posts.find((p) => p.discussionId === id), [id, posts]);
    
    const isCreator = useMemo(() => {
        if (!user || !discussion) return false;
        return user.id === discussion.author.id;
    }, [user, discussion]);

    if (discussions.length > 0 && !discussion) {
        notFound();
    }

    if (!discussion) {
        return (
            <div className="flex h-full min-h-[calc(100vh-10rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            
            {post && (
                <div className="mb-6 rounded-lg overflow-hidden border">
                    <Image
                        src={post.imageUrl}
                        alt={post.caption}
                        width={800}
                        height={600}
                        className="object-cover w-full"
                        data-ai-hint={post.imageAiHint}
                    />
                </div>
            )}

            <div className="mb-6">
                 <DiscussionCard discussion={discussion} isCreator={isCreator} isExpanded={true} />
            </div>

            <Separator className="my-8" />
            
            <DiscussionThread discussion={discussion} />
        </div>
    );
}

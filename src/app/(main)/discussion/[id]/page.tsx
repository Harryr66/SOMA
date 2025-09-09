'use client';

import React, { useState, useEffect } from 'react';
import { DiscussionCard } from '@/components/discussion-card';
import { DiscussionThread } from '@/components/discussion-thread';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';
import { Discussion } from '@/lib/types';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DiscussionPageProps {
  params: {
    id: string;
  };
}

export default function DiscussionPage({ params }: DiscussionPageProps) {
  const { user } = useAuth();
  const { discussions } = useContent();
  const router = useRouter();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundDiscussion = discussions.find(d => d.id === params.id);
    if (foundDiscussion) {
      setDiscussion(foundDiscussion);
    }
    setLoading(false);
  }, [discussions, params.id]);

  const isCreator = user?.id === discussion?.author.id;

  const handleLike = (discussionId: string) => {
    // Handle like logic
    console.log('Like discussion:', discussionId);
  };

  const handleDislike = (discussionId: string) => {
    // Handle dislike logic
    console.log('Dislike discussion:', discussionId);
  };

  const handleReply = (discussionId: string) => {
    // Handle reply logic
    console.log('Reply to discussion:', discussionId);
  };

  const handlePin = (discussionId: string) => {
    // Handle pin logic
    console.log('Pin discussion:', discussionId);
  };

  const handleLock = (discussionId: string) => {
    // Handle lock logic
    console.log('Lock discussion:', discussionId);
  };

  const handleReport = (report: any) => {
    // Handle report logic
    console.log('Report discussion:', report);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Discussion Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The discussion you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Discussion</h1>
        </div>

        {/* Discussion */}
        <div className="mb-6">
          <DiscussionCard 
            discussion={discussion} 
            onLike={handleLike}
            onDislike={handleDislike}
            onReply={handleReply}
            onPin={handlePin}
            onLock={handleLock}
            onReport={handleReport}
          />
        </div>

        <Separator className="my-8" />

        {/* Discussion Thread */}
        <DiscussionThread discussion={discussion} />
      </div>
    </div>
  );
}

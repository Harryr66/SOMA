'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReportDialog } from '@/components/report-dialog';
import { Discussion } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Pin, 
  Lock, 
  Flag, 
  MoreHorizontal 
} from 'lucide-react';

interface DiscussionCardProps {
  discussion: Discussion;
  onLike?: (discussionId: string) => void;
  onDislike?: (discussionId: string) => void;
  onReply?: (discussionId: string) => void;
  onPin?: (discussionId: string) => void;
  onLock?: (discussionId: string) => void;
  onReport?: (report: any) => void;
}

export function DiscussionCard({ 
  discussion, 
  onLike, 
  onDislike, 
  onReply, 
  onPin, 
  onLock, 
  onReport 
}: DiscussionCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const isCreator = user?.id === discussion.author.id;

  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    setIsLiked(!isLiked);
    onLike?.(discussion.id);
  };

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
    onDislike?.(discussion.id);
  };

  const handleReply = () => {
    onReply?.(discussion.id);
  };

  const handlePin = () => {
    onPin?.(discussion.id);
  };

  const handleLock = () => {
    onLock?.(discussion.id);
  };

  const handleReport = (report: any) => {
    onReport?.(report);
    setIsReportDialogOpen(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.name} />
              <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{discussion.title}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>by {discussion.author.name}</span>
                <span>•</span>
                <span>{discussion.timestamp}</span>
                {discussion.isPinned && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  </>
                )}
                {discussion.isLocked && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCreator && (
              <>
                <Button variant="ghost" size="sm" onClick={handlePin}>
                  <Pin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLock}>
                  <Lock className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm leading-relaxed mb-4">{discussion.content}</p>
        
        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {discussion.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-blue-600' : ''}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {discussion.upvotes}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDislike}
              className={isDisliked ? 'text-red-600' : ''}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {discussion.downvotes}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReply}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {discussion.replyCount} replies
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <ReportDialog
              contentId={discussion.id}
              contentType="Discussion"
              content={discussion.title}
              offenderId={discussion.author.id}
              offenderHandle={discussion.author.handle}
              onReport={handleReport}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

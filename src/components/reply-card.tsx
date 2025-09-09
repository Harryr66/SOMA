'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReportDialog } from '@/components/report-dialog';
import { Reply } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { formatDistanceToNow } from 'date-fns';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Reply as ReplyIcon, 
  Flag, 
  MoreHorizontal 
} from 'lucide-react';

interface ReplyCardProps {
  reply: Reply;
  onLike?: (replyId: string) => void;
  onDislike?: (replyId: string) => void;
  onReply?: (replyId: string) => void;
  onReport?: (report: any) => void;
}

export function ReplyCard({ 
  reply, 
  onLike, 
  onDislike, 
  onReply, 
  onReport 
}: ReplyCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const isCreator = user?.id === reply.author.id;

  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    setIsLiked(!isLiked);
    onLike?.(reply.id);
  };

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
    onDislike?.(reply.id);
  };

  const handleReply = () => {
    onReply?.(reply.id);
  };

  const handleReport = (report: any) => {
    onReport?.(report);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
            <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">{reply.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {reply.timestamp}
              </span>
              {reply.isPinned && (
                <Badge variant="outline" className="text-xs">
                  Pinned
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-3">{reply.content}</p>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'text-blue-600' : ''}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {reply.upvotes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDislike}
                  className={isDisliked ? 'text-red-600' : ''}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  {reply.downvotes}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReply}>
                  <ReplyIcon className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <ReportDialog
                  contentId={reply.id}
                  contentType="Reply"
                  content={reply.content}
                  offenderId={reply.author.id}
                  offenderHandle={reply.author.handle}
                  onReport={handleReport}
                />
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { type Discussion } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Pin, MessageSquare, Flag } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ReportDialog } from './report-dialog';

interface DiscussionCardProps {
  discussion: Discussion;
  isCreator: boolean; // To control pinning
  isExpanded?: boolean;
}

export function DiscussionCard({ discussion, isCreator, isExpanded = false }: DiscussionCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [votes, setVotes] = useState(discussion.upvotes - discussion.downvotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [isPinned, setIsPinned] = useState(discussion.isPinned);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleVote = (type: 'up' | 'down') => {
    // In a real app, this would be a server action.
    // This logic provides a basic optimistic update for the UI.
    let voteChange = 0;
    
    if (voteStatus === type) { // Undoing vote
      voteChange = type === 'up' ? -1 : 1;
      setVoteStatus(null);
    } else { // Voting or changing vote
      if (voteStatus === 'up') voteChange = -1;
      else if (voteStatus === 'down') voteChange = 1;
      
      voteChange += type === 'up' ? 1 : -1;
      setVoteStatus(type);
    }
    setVotes(currentVotes => currentVotes + voteChange);
  };

  const handlePin = () => {
    // This would also be a server action
    setIsPinned(!isPinned);
  };

  const navigateToDiscussion = () => {
    if (!isExpanded) {
        router.push(`/discussion/${discussion.id}`);
    }
  };

  return (
    <Card className={cn("flex border-foreground/20 transition-colors", !isExpanded && "cursor-pointer hover:border-foreground/50")} onClick={navigateToDiscussion}>
      <div className="p-2 sm:p-4 flex flex-col items-center justify-start space-y-1 bg-muted/50 border-r rounded-l-lg">
        <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", voteStatus === 'up' && 'text-foreground bg-muted')}
            onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="font-bold text-base sm:text-lg">{votes}</span>
        <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", voteStatus === 'down' && 'text-destructive bg-destructive/10')}
            onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1">
        <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.name} data-ai-hint="artist portrait" />
                        <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Posted by {discussion.author.handle}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{discussion.timestamp}</span>
                </div>
                 {isPinned && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Pin className="h-4 w-4" />
                        <span>Pinned</span>
                    </div>
                 )}
            </div>
          <CardTitle className={cn("text-lg sm:text-xl font-headline pt-2", !isExpanded && "hover:underline")}>{discussion.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 py-2">
          <p className={cn("text-muted-foreground text-sm sm:text-base", !isExpanded && "line-clamp-2")}>{discussion.content}</p>
        </CardContent>
        <CardFooter className="p-3 sm:p-4 py-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>{discussion.replyCount} Comments</span>
                </div>
                {isCreator && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePin(); }} className="px-2 h-8">
                        <Pin className="mr-2 h-4 w-4" />
                        {isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                )}
                 <ReportDialog
                    open={isReportDialogOpen}
                    onOpenChange={setIsReportDialogOpen}
                    contentId={discussion.id}
                    contentType="Discussion"
                    contentTitle={discussion.title}
                    offenderId={discussion.author.id}
                    offenderHandle={discussion.author.handle}
                 >
                    <Button asChild variant="ghost" className="flex items-center gap-1.5 px-2 h-8" onClick={(e) => e.stopPropagation()}>
                       <Flag className="h-4 w-4" />
                       <span>Report</span>
                    </Button>
                 </ReportDialog>
            </div>
        </CardFooter>
      </div>
    </Card>
  );
}

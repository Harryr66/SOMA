
'use client';

import { type Reply } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Pin, Flag, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ReportDialog } from './report-dialog';

const nestedReplySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty."),
});

interface ReplyCardProps {
  reply: Reply;
  isDiscussionCreator: boolean;
  isNested?: boolean;
  onPin: (replyId: string) => void;
  onAddReply: (content: string, parentId: string) => void;
}

export function ReplyCard({ reply, isDiscussionCreator, isNested = false, onPin, onAddReply }: ReplyCardProps) {
  const { toast } = useToast();
  const [votes, setVotes] = useState(reply.upvotes - reply.downvotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof nestedReplySchema>>({
    resolver: zodResolver(nestedReplySchema),
    defaultValues: { content: '' },
  });

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    let voteChange = 0;
    
    if (voteStatus === type) {
      voteChange = type === 'up' ? -1 : 1;
      setVoteStatus(null);
    } else {
      if (voteStatus === 'up') voteChange = -1;
      else if (voteStatus === 'down') voteChange = 1;
      
      voteChange += type === 'up' ? 1 : -1;
      setVoteStatus(type);
    }
    setVotes(currentVotes => currentVotes + voteChange);
  };
  
  const handleReplySubmit = (data: z.infer<typeof nestedReplySchema>) => {
    onAddReply(data.content, reply.id);
    setShowReplyForm(false);
    form.reset();
  };
  
  const hasReplies = reply.replies && reply.replies.length > 0;
  const replyCount = reply.replies?.length || 0;

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} data-ai-hint="artist portrait"/>
                  <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground">{reply.author.handle}</span>
              <span>•</span>
              <span>{reply.timestamp}</span>
          </div>
          {reply.isPinned && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2 flex-shrink-0">
                <Pin className="h-3 w-3" />
                <span>Pinned</span>
            </div>
          )}
        </div>
        <p className="text-sm sm:text-base text-foreground/90">{reply.content}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
                <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-full", voteStatus === 'up' && 'bg-muted text-foreground')} onClick={(e) => handleVote(e, 'up')}>
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm min-w-[1.5rem] text-center">{votes}</span>
                <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-full", voteStatus === 'down' && 'bg-destructive/10 text-destructive')} onClick={(e) => handleVote(e, 'down')}>
                    <ArrowDown className="h-4 w-4" />
                </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-auto px-1.5 py-1 text-xs" onClick={(e) => { e.stopPropagation(); setShowReplyForm(p => !p); }}>
                <MessageSquare className="mr-1.5 h-3 w-3"/>
                Reply
            </Button>
            {isDiscussionCreator && !isNested && (
                 <Button variant="ghost" size="sm" className="h-auto px-1.5 py-1 text-xs" onClick={(e) => { e.stopPropagation(); onPin(reply.id); }}>
                    <Pin className="mr-1.5 h-3 w-3" />
                    {reply.isPinned ? 'Unpin Reply' : 'Pin Reply'}
                 </Button>
            )}
             <ReportDialog
                open={isReportDialogOpen}
                onOpenChange={setIsReportDialogOpen}
                contentId={reply.id}
                contentType="Reply"
                contentTitle={`Reply by ${reply.author.handle}`}
                offenderId={reply.author.id}
                offenderHandle={reply.author.handle}
              >
                <Button asChild variant="ghost" size="sm" className="h-auto px-1.5 py-1 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                  <span><Flag className="mr-1.5 h-3 w-3" />Report</span>
                </Button>
            </ReportDialog>
             {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-1.5 py-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded
                  ? 'Hide Replies'
                  : `View ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}
              </Button>
            )}
        </div>
        
        {showReplyForm && (
            <div className="mt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleReplySubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder={`Replying to ${reply.author.handle}...`} {...field} rows={3}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
                            <Button type="submit" size="sm" variant="gradient">Post Reply</Button>
                        </div>
                    </form>
                </Form>
            </div>
        )}

        {hasReplies && isExpanded && (
            <div className="mt-6 ml-4 space-y-6 border-l-2 pl-4">
                {reply.replies!.map(nestedReply => (
                    <ReplyCard
                        key={nestedReply.id}
                        reply={nestedReply}
                        isDiscussionCreator={isDiscussionCreator}
                        onPin={() => {}} // Can't pin nested replies
                        onAddReply={onAddReply}
                        isNested={true}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

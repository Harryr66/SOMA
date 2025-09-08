
'use client';

import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { type Discussion, type Reply, type Artist } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ReplyCard } from './reply-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useContent } from '@/providers/content-provider';

const replyFormSchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty.'),
});

interface DiscussionThreadProps {
    discussion: Discussion;
}

export function DiscussionThread({ discussion }: DiscussionThreadProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { updateDiscussion } = useContent();

    const isDiscussionCreator = user?.uid === discussion.author.id;

    const form = useForm<z.infer<typeof replyFormSchema>>({
        resolver: zodResolver(replyFormSchema),
        defaultValues: { content: '' },
    });

    const addReplyToTree = (replies: Reply[], parentId: string, newReply: Reply): Reply[] => {
        return replies.map(reply => {
            if (reply.id === parentId) {
                const updatedNestedReplies = [...(reply.replies || []), newReply];
                return {
                    ...reply,
                    replies: updatedNestedReplies,
                };
            }
            if (reply.replies && reply.replies.length > 0) {
                return { ...reply, replies: addReplyToTree(reply.replies, parentId, newReply) };
            }
            return reply;
        });
    };
    
    const countTotalReplies = (replies: Reply[]): number => {
        let count = replies.length;
        for (const reply of replies) {
            if (reply.replies) {
                count += countTotalReplies(reply.replies);
            }
        }
        return count;
    };


    const handleAddReply = (content: string, parentId?: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to reply.' });
            return;
        }

        const currentUserArtist: Artist = {
            id: user.id,
            name: user.displayName || 'Anonymous User',
            handle: user.email?.split('@')[0] || 'anonymous',
            avatarUrl: undefined,
        };
        
        const newReply: Reply = {
            id: `r-${Date.now()}`,
            author: currentUserArtist,
            content: content,
            timestamp: 'Just now',
            upvotes: 0,
            downvotes: 0,
            isPinned: false,
        };

        const updatedDiscussion = { ...discussion };

        if (parentId) {
             updatedDiscussion.replies = addReplyToTree(updatedDiscussion.replies || [], parentId, newReply);
        } else {
            updatedDiscussion.replies = [newReply, ...(updatedDiscussion.replies || [])];
        }
        
        updatedDiscussion.replyCount = countTotalReplies(updatedDiscussion.replies);

        updateDiscussion(updatedDiscussion);
        toast({ title: 'Reply posted!' });
        form.reset();
    };

    const handleTopLevelSubmit = (data: z.infer<typeof replyFormSchema>) => {
        handleAddReply(data.content);
    };

    const handlePinReply = (replyId: string) => {
        const updatedReplies = (discussion.replies || []).map(reply => 
            reply.id === replyId ? { ...reply, isPinned: !reply.isPinned } : reply
        );
        
        const newDiscussionState = { ...discussion, replies: updatedReplies };
        updateDiscussion(newDiscussionState);

        toast({
            title: updatedReplies.find(r => r.id === replyId)?.isPinned ? 'Reply Pinned!' : 'Reply Unpinned',
        });
    };

    const sortedReplies = useMemo(() => {
        if (!discussion?.replies) return [];
        return [...discussion.replies].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            return 0; // Keep original order for same-score items
        });
    }, [discussion?.replies]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-headline mb-4">{discussion.replyCount} Replies</h2>
            
            <Alert className="mb-8">
                <Info className="h-4 w-4" />
                <AlertTitle>Community Guidelines</AlertTitle>
                <AlertDescription>
                    All discussions must adhere to the Soma platform rules, which prohibit rude or malicious commenting. Please treat all users with respect and approach any critiques politely and constructively.
                </AlertDescription>
            </Alert>

            <div className="mb-8">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleTopLevelSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Your Reply</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Add to the discussion..." {...field} rows={4}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="flex justify-end">
                            <Button variant="gradient" type="submit">Post Reply</Button>
                        </div>
                    </form>
                </Form>
            </div>

            <div className="space-y-8">
                {sortedReplies.map(reply => (
                    <ReplyCard 
                        key={reply.id} 
                        reply={reply}
                        isDiscussionCreator={isDiscussionCreator}
                        onPin={handlePinReply}
                        onAddReply={handleAddReply}
                    />
                ))}
            </div>
        </div>
    );
}

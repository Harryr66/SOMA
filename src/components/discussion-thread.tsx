'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Discussion, Reply } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Reply as ReplyIcon, Pin, Lock } from 'lucide-react';

const replyFormSchema = z.object({
    content: z.string().min(1, 'Reply cannot be empty').max(1000, 'Reply is too long'),
});

interface DiscussionThreadProps {
    discussion: Discussion;
}

export function DiscussionThread({ discussion }: DiscussionThreadProps) {
    const { user } = useAuth();
    const { updateDiscussion } = useContent();
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isDiscussionCreator = user?.id === discussion.author.id;

    const form = useForm<z.infer<typeof replyFormSchema>>({
        resolver: zodResolver(replyFormSchema),
        defaultValues: {
            content: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof replyFormSchema>) => {
        if (!user) return;

        const newReply: Reply = {
            id: `reply-${Date.now()}`,
            author: {
                id: user.id,
                name: user.displayName,
                handle: user.username,
                avatarUrl: user.avatarUrl,
                followerCount: user.followerCount,
                followingCount: user.followingCount,
                createdAt: user.createdAt
            },
            timestamp: formatDistanceToNow(new Date(), { addSuffix: true }),
            content: data.content,
            upvotes: 0,
            downvotes: 0,
        };

        const updatedDiscussion = {
            ...discussion,
            replies: [...(discussion.replies || []), newReply],
            replyCount: (discussion.replyCount || 0) + 1,
        };

        await updateDiscussion(updatedDiscussion);
        form.reset();
        setShowReplyForm(false);
    };

    const handleVote = async (replyId: string, type: 'upvote' | 'downvote') => {
        if (!user) return;

        const updatedReplies = discussion.replies?.map(reply => {
            if (reply.id === replyId) {
                return {
                    ...reply,
                    upvotes: type === 'upvote' ? reply.upvotes + 1 : reply.upvotes,
                    downvotes: type === 'downvote' ? reply.downvotes + 1 : reply.downvotes,
                };
            }
            return reply;
        }) || [];

        const updatedDiscussion = {
            ...discussion,
            replies: updatedReplies,
        };

        await updateDiscussion(updatedDiscussion);
    };

    return (
        <div className="space-y-6">
            {/* Main Discussion */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={discussion.author.avatarUrl ?? undefined} alt={discussion.author.name} />
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
                        {isDiscussionCreator && (
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                    Pin
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed">{discussion.content}</p>
                    
                    {/* Discussion Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {discussion.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                {discussion.downvotes}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                            >
                                <ReplyIcon className="h-4 w-4 mr-1" />
                                Reply
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {discussion.replyCount} replies
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reply Form */}
            {showReplyForm && user && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Add a Reply</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Textarea
                                placeholder="Write your reply..."
                                {...form.register('content')}
                                className="min-h-[100px]"
                            />
                            {form.formState.errors.content && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.content.message}
                                </p>
                            )}
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReplyForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Post Reply
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Replies */}
            {discussion.replies && discussion.replies.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Replies ({discussion.replies.length})</h3>
                    {discussion.replies.map((reply) => (
                        <Card key={reply.id}>
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
                                        </div>
                                        <p className="text-sm leading-relaxed mb-3">{reply.content}</p>
                                        <div className="flex items-center space-x-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleVote(reply.id, 'upvote')}
                                            >
                                                <ThumbsUp className="h-3 w-3 mr-1" />
                                                {reply.upvotes}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleVote(reply.id, 'downvote')}
                                            >
                                                <ThumbsDown className="h-3 w-3 mr-1" />
                                                {reply.downvotes}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessagingService, UserService } from '@/lib/database';
import { Conversation, User } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Plus } from 'lucide-react';

interface ConversationListProps {
  userId: string;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateNew: () => void;
}

export function ConversationList({ userId, onSelectConversation, onCreateNew }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userConversations = await MessagingService.getConversations(userId);
        setConversations(userConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [userId]);

  const getOtherParticipant = async (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== userId);
    if (!otherUserId) return null;
    return await UserService.getUser(otherUserId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Button onClick={onCreateNew} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                userId={userId}
                onClick={() => onSelectConversation(conversation)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  userId: string;
  onClick: () => void;
}

function ConversationItem({ conversation, userId, onClick }: ConversationItemProps) {
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOtherUser = async () => {
      const otherUserId = conversation.participants.find(id => id !== userId);
      if (otherUserId) {
        const user = await UserService.getUser(otherUserId);
        setOtherUser(user);
      }
      setLoading(false);
    };

    loadOtherUser();
  }, [conversation, userId]);

  if (loading || !otherUser) {
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer">
        <div className="animate-pulse bg-muted rounded-full h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="animate-pulse bg-muted h-4 w-3/4 rounded"></div>
          <div className="animate-pulse bg-muted h-3 w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  const unreadCount = conversation.unreadCount?.[userId] || 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatarUrl} alt={otherUser.displayName} />
          <AvatarFallback>{otherUser.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        {otherUser.isActive && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{otherUser.displayName}</h3>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage?.text || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Community } from '@/lib/types';
import { Users, MessageSquare, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  isJoined?: boolean;
  isOwner?: boolean;
}

export function CommunityCard({ 
  community, 
  onJoin, 
  onLeave, 
  isJoined = false, 
  isOwner = false 
}: CommunityCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={community.avatarUrl} alt={community.name} />
              <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Users className="h-4 w-4" />
                <span>{community.memberCount} members</span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {community.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {community.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{community.postCount} posts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(community.createdAt, { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOwner ? (
              <Badge variant="outline">Owner</Badge>
            ) : isJoined ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onLeave(community.id)}
              >
                Leave
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => onJoin(community.id)}
              >
                Join
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

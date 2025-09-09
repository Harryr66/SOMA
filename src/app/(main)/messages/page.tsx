'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messaging/conversation-list';
import { ChatInterface } from '@/components/messaging/chat-interface';
import { MessagingService, UserService } from '@/lib/database';
import { Conversation, User } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await UserService.searchUsers(term);
      setSearchResults(results.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const existingConversations = await MessagingService.getConversations(user.id);
      const existingConversation = existingConversations.find(conv => 
        conv.participants.includes(otherUserId)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        // Create new conversation
        const conversationId = await MessagingService.createConversation([user.id, otherUserId]);
        const newConversation: Conversation = {
          id: conversationId,
          participants: [user.id, otherUserId],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          unreadCount: {}
        };
        setSelectedConversation(newConversation);
      }

      setShowNewConversation(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations Sidebar */}
        <div className="lg:w-80 border rounded-lg bg-card">
          <ConversationList
            userId={user.id}
            onSelectConversation={setSelectedConversation}
            onCreateNew={() => setShowNewConversation(true)}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 border rounded-lg bg-card">
          {selectedConversation ? (
            <ChatInterface
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">Choose a conversation to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => handleStartConversation(user.id)}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{user.displayName.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && !searching && searchResults.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

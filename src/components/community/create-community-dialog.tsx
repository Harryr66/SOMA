'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CommunityService } from '@/lib/database';
import { Community } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users } from 'lucide-react';

interface CreateCommunityDialogProps {
  onCommunityCreated: (community: Community) => void;
}

export function CreateCommunityDialog({ onCommunityCreated }: CreateCommunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    isPublic: true
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setLoading(true);
    try {
      const communityId = await CommunityService.createCommunity({
        name: formData.name,
        description: formData.description,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        isPublic: formData.isPublic,
        ownerId: 'current-user-id', // This should come from auth context
        avatarUrl: undefined,
        coverImageUrl: undefined,
        memberCount: 0,
        postCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newCommunity: Community = {
        id: communityId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        isPublic: formData.isPublic,
        ownerId: 'current-user-id',
        avatarUrl: undefined,
        coverImageUrl: undefined,
        memberCount: 0,
        postCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onCommunityCreated(newCommunity);
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: '',
        isPublic: true
      });

      toast({
        title: "Community Created!",
        description: "Your community has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to create community. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Create New Community</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter community name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your community"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Art, Photography, Digital"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., abstract, modern, digital (comma separated)"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isPublic">Public community</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface CreateCommunityDialogProps {
  onClose: () => void;
}

const COMMUNITY_TYPES = [
  {
    id: 'free',
    name: 'Free Community',
    description: 'Open to all followers',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    id: 'premium',
    name: 'Premium Community',
    description: 'Monthly subscription required',
    icon: Crown,
    color: 'bg-purple-500'
  }
];

export function CreateCommunityDialog({ onClose }: CreateCommunityDialogProps) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'free' as 'free' | 'premium',
    monthlyPrice: 0,
    maxMembers: 1000
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!user || !formData.name.trim()) return;

    setIsCreating(true);
    try {
      const communityId = `${user.id}_${Date.now()}`;
      const communityData = {
        id: communityId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        monthlyPrice: formData.type === 'premium' ? formData.monthlyPrice : 0,
        maxMembers: formData.maxMembers,
        ownerId: user.id,
        memberCount: 1,
        createdAt: new Date(),
        isActive: true,
        rules: [],
        tags: []
      };

      // Create community document
      await setDoc(doc(db, 'communities', communityId), communityData);

      // Add owner as first member
      await setDoc(doc(db, 'communities', communityId, 'members', user.id), {
        userId: user.id,
        role: 'owner',
        joinedAt: new Date(),
        isActive: true
      });

      // Update user profile to reference community
      await setDoc(doc(db, 'userProfiles', user.id), {
        communityId: communityId
      }, { merge: true });

      toast({
        title: "Community created",
        description: `Your community "${formData.name}" has been created successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Creation failed",
        description: "There was an error creating your community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Community
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Community Type Selection */}
          <div className="space-y-3">
            <Label>Community Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMMUNITY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      formData.type === type.id
                        ? 'ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    )}
                    onClick={() => handleInputChange('type', type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg text-white', type.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        {formData.type === type.id && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Community Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter community name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your community..."
                rows={3}
              />
            </div>

            {formData.type === 'premium' && (
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Maximum Members</Label>
              <Input
                id="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 1000)}
                placeholder="1000"
                min="1"
                max="10000"
              />
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>How your community will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-white',
                  formData.type === 'free' ? 'bg-green-500' : 'bg-purple-500'
                )}>
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {formData.name || 'Community Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || 'Community description'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {formData.type === 'free' ? 'Free' : `$${formData.monthlyPrice}/month`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Max {formData.maxMembers} members
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || isCreating}
              className="flex-1"
              variant="gradient"
            >
              {isCreating ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
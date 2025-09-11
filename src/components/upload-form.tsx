'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, Video, FileText } from 'lucide-react';

export function UploadForm() {
  const { user, avatarUrl } = useAuth();
  const { addContent } = useContent();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    medium: '',
    dimensions: { width: '', height: '', unit: 'cm' },
    tags: '',
    isForSale: false,
    price: '',
    currency: 'USD',
    isAI: false,
    aiAssistance: 'none' as 'none' | 'assisted' | 'generated'
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    try {
      // Create artwork object
      const artwork = {
        id: `artwork-${Date.now()}`,
        artist: {
          id: user.id,
          name: user.displayName,
          handle: user.username,
          avatarUrl: user.avatarUrl,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          createdAt: user.createdAt
        },
        title: formData.title,
        description: formData.description,
        imageUrl: preview || '',
        imageAiHint: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: formData.isForSale ? parseFloat(formData.price) : undefined,
        currency: formData.currency,
        isForSale: formData.isForSale,
        category: formData.category,
        medium: formData.medium,
        dimensions: {
          width: parseFloat(formData.dimensions.width),
          height: parseFloat(formData.dimensions.height),
          unit: formData.dimensions.unit as 'cm' | 'in' | 'px'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        isAI: formData.isAI,
        aiAssistance: formData.aiAssistance
      };

      // Create post object
      const post = {
        id: `post-${Date.now()}`,
        artworkId: artwork.id,
        artist: artwork.artist,
        imageUrl: artwork.imageUrl,
        imageAiHint: artwork.imageAiHint,
        caption: formData.description,
        likes: 0,
        commentsCount: 0,
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
        tags: artwork.tags
      };

      await addContent(post, artwork);
      router.push('/feed');
    } catch (error) {
      console.error('Error uploading artwork:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Please log in to upload artwork.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Artwork</CardTitle>
        <CardDescription>
          Share your creative work with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Artwork File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload your artwork</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF, MP4 up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter artwork title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your artwork..."
              rows={3}
            />
          </div>

          {/* Category and Medium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="digital">Digital Art</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="sculpture">Sculpture</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="mixed">Mixed Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input
                id="medium"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                placeholder="e.g., Oil on Canvas, Digital"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label>Dimensions</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Width"
                value={formData.dimensions.width}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { ...formData.dimensions, width: e.target.value }
                })}
              />
              <Input
                placeholder="Height"
                value={formData.dimensions.height}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { ...formData.dimensions, height: e.target.value }
                })}
              />
              <Select 
                value={formData.dimensions.unit} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  dimensions: { ...formData.dimensions, unit: value as 'cm' | 'in' | 'px' }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                  <SelectItem value="px">px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* AI Assistance */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAI"
                checked={formData.isAI}
                onCheckedChange={(checked) => setFormData({ ...formData, isAI: checked })}
              />
              <Label htmlFor="isAI">AI Assisted</Label>
            </div>

            {formData.isAI && (
              <div className="space-y-2">
                <Label htmlFor="aiAssistance">AI Assistance Level</Label>
                <Select 
                  value={formData.aiAssistance} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    aiAssistance: value as 'none' | 'assisted' | 'generated'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="assisted">AI Assisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Sale Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isForSale"
                checked={formData.isForSale}
                onCheckedChange={(checked) => setFormData({ ...formData, isForSale: checked })}
              />
              <Label htmlFor="isForSale">Make this artwork available for sale</Label>
            </div>

            {formData.isForSale && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload Artwork'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

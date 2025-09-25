'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, Edit, Save, X, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';

interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  year: string;
  tags: string[];
  createdAt: Date;
}

export function PortfolioManager() {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    medium: '',
    dimensions: '',
    year: '',
    tags: ''
  });

  useEffect(() => {
    if (user?.portfolio) {
      setPortfolioItems(user.portfolio);
    }
  }, [user]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const imageRef = ref(storage, `portfolio/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, compressedFile);
      const imageUrl = await getDownloadURL(imageRef);

      const portfolioItem: PortfolioItem = {
        id: Date.now().toString(),
        imageUrl,
        title: newItem.title || 'Untitled',
        description: newItem.description,
        medium: newItem.medium,
        dimensions: newItem.dimensions,
        year: newItem.year,
        tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date()
      };

      // Update user profile with new portfolio item
      await updateDoc(doc(db, 'userProfiles', user.id), {
        portfolio: arrayUnion(portfolioItem),
        updatedAt: serverTimestamp()
      });

      setPortfolioItems(prev => [...prev, portfolioItem]);
      setNewItem({
        title: '',
        description: '',
        medium: '',
        dimensions: '',
        year: '',
        tags: ''
      });
      setShowAddForm(false);

      toast({
        title: "Portfolio updated",
        description: "New artwork added to your portfolio.",
      });
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload artwork. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateItem = async (item: PortfolioItem) => {
    if (!user) return;

    try {
      // Remove old item and add updated item
      const updatedItems = portfolioItems.map(p => p.id === item.id ? item : p);
      
      await updateDoc(doc(db, 'userProfiles', user.id), {
        portfolio: updatedItems,
        updatedAt: serverTimestamp()
      });

      setPortfolioItems(updatedItems);
      setEditingItem(null);

      toast({
        title: "Portfolio updated",
        description: "Artwork details have been updated.",
      });
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: "Update failed",
        description: "Failed to update artwork. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (item: PortfolioItem) => {
    if (!user) return;

    try {
      // Delete image from storage
      const imageRef = ref(storage, item.imageUrl);
      await deleteObject(imageRef);

      // Remove from user profile
      await updateDoc(doc(db, 'userProfiles', user.id), {
        portfolio: arrayRemove(item),
        updatedAt: serverTimestamp()
      });

      setPortfolioItems(prev => prev.filter(p => p.id !== item.id));

      toast({
        title: "Artwork deleted",
        description: "Artwork has been removed from your portfolio.",
      });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete artwork. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user?.isProfessional) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="text-muted-foreground">Manage your artwork portfolio</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isUploading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Artwork
        </Button>
      </div>

      {/* Add New Artwork Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Artwork</CardTitle>
            <CardDescription>Upload a new piece to your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-image">Artwork Image *</Label>
              <Input
                id="portfolio-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-sm text-muted-foreground">Uploading image...</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Artwork title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Input
                  id="medium"
                  value={newItem.medium}
                  onChange={(e) => setNewItem(prev => ({ ...prev, medium: e.target.value }))}
                  placeholder="Oil on canvas, Digital, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={newItem.dimensions}
                  onChange={(e) => setNewItem(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="24 x 30 inches"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={newItem.year}
                  onChange={(e) => setNewItem(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your artwork..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={newItem.tags}
                onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="abstract, painting, modern (comma-separated)"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No artworks yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your portfolio by adding your first artwork.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Artwork
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                {item.medium && (
                  <p className="text-sm text-muted-foreground mb-2">{item.medium}</p>
                )}
                {item.dimensions && (
                  <p className="text-sm text-muted-foreground mb-2">{item.dimensions}</p>
                )}
                {item.year && (
                  <p className="text-sm text-muted-foreground mb-2">{item.year}</p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Edit Artwork
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-medium">Medium</Label>
                <Input
                  id="edit-medium"
                  value={editingItem.medium}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, medium: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dimensions">Dimensions</Label>
                <Input
                  id="edit-dimensions"
                  value={editingItem.dimensions}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, dimensions: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  value={editingItem.year}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, year: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingItem.description}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={editingItem.tags.join(', ')}
                onChange={(e) => setEditingItem(prev => prev ? { 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                } : null)}
                placeholder="abstract, painting, modern (comma-separated)"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => editingItem && handleUpdateItem(editingItem)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

const PROFILE_RING_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48', '#a855f7', '#0ea5e9', '#22c55e'
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
      name: '',
      handle: '',
    bio: '',
      website: '',
      artistType: '',
    location: '',
    isProfessional: false,
    isTipJarEnabled: false,
    profileRingColor: '#3b82f6',
    socialLinks: {
      instagram: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    if (user) {
      // Check for offline changes first
      const offlineChanges = localStorage.getItem(`profile_offline_changes_${user.id}`);
      if (offlineChanges) {
        try {
          const changes = JSON.parse(offlineChanges);
          setFormData({
            name: changes.name || user.displayName || '',
            handle: changes.handle || user.username || '',
            bio: changes.bio || user.bio || '',
            website: changes.website || user.website || '',
            artistType: changes.artistType || user.artistType || '',
            location: changes.location || user.location || '',
            isProfessional: changes.isProfessional || user.isProfessional || false,
            isTipJarEnabled: changes.isTipJarEnabled || user.isTipJarEnabled || false,
            profileRingColor: changes.profileRingColor || user.profileRingColor || '#3b82f6',
            socialLinks: {
              instagram: changes.socialLinks?.instagram || user.socialLinks?.instagram || '',
              twitter: changes.socialLinks?.twitter || user.socialLinks?.twitter || '',
              website: changes.socialLinks?.website || user.socialLinks?.website || ''
            }
          });
          
          if (changes.avatarUrl && changes.avatarUrl !== user.avatarUrl) {
            setPreviewImage(changes.avatarUrl);
          }
          
          console.log('Applied offline changes to form');
        } catch (error) {
          console.error('Error applying offline changes:', error);
        }
      } else {
        setFormData({
          name: user.displayName || '',
          handle: user.username || '',
          bio: user.bio || '',
          website: user.website || '',
          artistType: user.artistType || '',
          location: user.location || '',
          isProfessional: user.isProfessional || false,
          isTipJarEnabled: user.isTipJarEnabled || false,
          profileRingColor: user.profileRingColor || '#3b82f6',
          socialLinks: {
            instagram: user.socialLinks?.instagram || '',
            twitter: user.socialLinks?.twitter || '',
            website: user.socialLinks?.website || ''
          }
        });
      }
    }
  }, [user]);

  // Helper function to add timeout to Firestore operations
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  };

  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle === user?.username) {
      setHandleAvailable(null);
        return;
    }

    setIsCheckingHandle(true);
    try {
      const handleDoc = await withTimeout(getDoc(doc(db, 'handles', handle)), 5000);
      setHandleAvailable(!handleDoc.exists());
    } catch (error) {
      console.error('Error checking handle:', error);
      setHandleAvailable(null);
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'handle') {
      checkHandleAvailability(value);
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side compression
    const compressedFile = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressedFile);
    setPreviewImage(previewUrl);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 400;
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
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = () => {
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (formData.handle !== user.username && handleAvailable !== true) {
                toast({
        title: "Handle not available",
        description: "Please choose a different handle.",
        variant: "destructive"
                });
                return;
            }
            
    setIsLoading(true);
    
    // Test connection before attempting save
    try {
      await withTimeout(getDoc(doc(db, 'userProfiles', user.id)), 3000);
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    try {
      let avatarUrl = user.avatarUrl;

      // Upload new image if preview exists
      if (previewImage) {
        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        
        if (file) {
          const compressedFile = await compressImage(file);
          const imageRef = ref(storage, `avatars/${user.id}`);
          await uploadBytes(imageRef, compressedFile);
          avatarUrl = await getDownloadURL(imageRef);
        }
      }

      // Update user profile - filter out undefined values
      const userRef = doc(db, 'userProfiles', user.id);
      const updateData: any = {
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio,
        website: formData.website,
        artistType: formData.artistType,
        location: formData.location,
        isProfessional: formData.isProfessional,
        isTipJarEnabled: formData.isTipJarEnabled,
        profileRingColor: formData.profileRingColor,
        socialLinks: formData.socialLinks,
        updatedAt: new Date()
      };

      // Only include avatarUrl if it's not undefined
      if (avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl;
      }

      // Update user profile with timeout
      await withTimeout(updateDoc(userRef, updateData), 10000);

      // Update handle mapping if changed
      if (formData.handle !== user.username) {
        // Remove old handle
        if (user.username) {
          await withTimeout(updateDoc(doc(db, 'handles', user.username), { userId: null }), 5000);
        }
        // Add new handle
        await withTimeout(updateDoc(doc(db, 'handles', formData.handle), { userId: user.id }), 5000);
      }

      await withTimeout(refreshUser(), 5000);
      
      // Clear offline changes after successful save
      localStorage.removeItem(`profile_offline_changes_${user.id}`);

        toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        });

      router.push(`/profile/${user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Check for specific Firebase errors
      if ((error as any)?.code === 'unavailable' || (error as any)?.message?.includes('offline')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Your changes will be saved locally and synced when connection is restored.",
          variant: "destructive"
        });
        
        // Store changes in localStorage for offline mode
        try {
          const offlineChanges = {
            ...formData,
            avatarUrl: previewImage || user.avatarUrl,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(`profile_offline_changes_${user.id}`, JSON.stringify(offlineChanges));
          console.log('Profile changes saved offline');
        } catch (storageError) {
          console.error('Error saving offline changes:', storageError);
        }
      } else if ((error as any)?.message?.includes('timed out') || (error as any)?.message?.includes('timeout')) {
        toast({
          title: "Request Timeout",
          description: "The server is taking too long to respond. Please check your connection and try again.",
          variant: "destructive"
        });
      } else if ((error as any)?.message?.includes('undefined')) {
          toast({
          title: "Update failed",
          description: "There was an issue with the profile data. Please try again.",
          variant: "destructive"
          });
      } else {
          toast({
          title: "Update failed",
          description: `Unable to save changes: ${(error as any)?.message || 'Connection error'}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

    return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <Card>
            <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a new profile picture. Click to change or remove.
            </CardDescription>
            </CardHeader>
            <CardContent>
                   <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={previewImage || user.avatarUrl} 
                    alt={formData.name} 
                  />
                  <AvatarFallback className="text-xl">
                    {formData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                {previewImage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                                </Button>
                            )}
                          </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Picture
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {user.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                  >
                                      Remove Picture
                                  </Button>
                              )}
                            </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                            </div>
              
              <div className="space-y-2">
                <Label htmlFor="handle">Handle *</Label>
                <div className="relative">
                  <Input
                    id="handle"
                    value={formData.handle}
                    onChange={(e) => handleInputChange('handle', e.target.value)}
                    required
                    className="pr-10"
                  />
                  {isCheckingHandle && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  {handleAvailable === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {handleAvailable === false && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {handleAvailable === false && (
                  <p className="text-sm text-red-500">This handle is already taken</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
                                    </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
                            </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Ring Color */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Ring Color</CardTitle>
            <CardDescription>
              Choose a color for your profile picture border
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PROFILE_RING_COLORS.map((color) => (
                <button
                                    key={color}
                                    type="button"
                                    className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    formData.profileRingColor === color
                      ? 'border-foreground scale-110'
                      : 'border-muted hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('profileRingColor', color)}
                />
                            ))}
                        </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Professional Artist Account</Label>
                            <p className="text-sm text-muted-foreground">
                  Enable additional features like shop, community, and tip jar
                            </p>
                        </div>
                        <Switch
                checked={formData.isProfessional}
                onCheckedChange={(checked) => handleInputChange('isProfessional', checked)}
                        />
                </div>

            {formData.isProfessional && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tip Jar</Label>
                                    <p className="text-sm text-muted-foreground">
                    Allow followers to send you tips
                                    </p>
                                </div>
                                <Switch 
                  checked={formData.isTipJarEnabled}
                  onCheckedChange={(checked) => handleInputChange('isTipJarEnabled', checked)}
                                />
                            </div>
                )}
            </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="@username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={isLoading || handleAvailable === false}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
            </form>
    </div>
  );
}
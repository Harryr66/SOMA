'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { toast } from '@/hooks/use-toast';

interface StoryUploaderProps {
  onClose: () => void;
}

export function StoryUploader({ onClose }: StoryUploaderProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const uploadStory = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      // Upload file to Firebase Storage
      const storyRef = ref(storage, `stories/${user.id}/${Date.now()}`);
      await uploadBytes(storyRef, selectedFile);
      const downloadURL = await getDownloadURL(storyRef);

      // Save story metadata to Firestore
      const storyData = {
        userId: user.id,
        imageUrl: downloadURL,
        createdAt: new Date(),
        duration: 5000, // Default 5 seconds for images
        isActive: true
      };

      await updateDoc(doc(db, 'userProfiles', user.id), {
        hasActiveStory: true,
        lastStoryAt: new Date()
      });

      // Add story to stories collection
      await updateDoc(doc(db, 'stories', `${user.id}_${Date.now()}`), storyData);

      toast({
        title: "Story uploaded",
        description: "Your story has been successfully uploaded.",
      });

      onClose();
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upload Story</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Share a moment with your followers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!preview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleCameraCapture}
                className="h-24 flex-col gap-2"
              >
                <Camera className="h-6 w-6" />
                Camera
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGallerySelect}
                className="h-24 flex-col gap-2"
              >
                <ImageIcon className="h-6 w-6" />
                Gallery
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Select from camera or gallery</p>
              <p className="text-xs mt-1">Max file size: 50MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="absolute top-2 right-2 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={removeFile}
                className="flex-1"
              >
                Remove
              </Button>
              <Button
                onClick={uploadStory}
                disabled={isUploading}
                className="flex-1"
                variant="gradient"
              >
                {isUploading ? 'Uploading...' : 'Upload Story'}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
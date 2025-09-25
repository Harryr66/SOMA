'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ArtistRequest, Episode, AdvertisingApplication } from '@/lib/types';
import { Check, X, Eye, Clock, User, Calendar, ExternalLink, Upload, Video, Plus, Megaphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [artistRequests, setArtistRequests] = useState<ArtistRequest[]>([]);
  const [advertisingApplications, setAdvertisingApplications] = useState<AdvertisingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ArtistRequest | null>(null);
  const [selectedAdApplication, setSelectedAdApplication] = useState<AdvertisingApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Video upload states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoTags, setVideoTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const artistRequestsQuery = query(
      collection(db, 'artistRequests'),
      orderBy('submittedAt', 'desc')
    );

    const advertisingQuery = query(
      collection(db, 'advertisingApplications'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribeArtistRequests = onSnapshot(artistRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArtistRequest[];
      setArtistRequests(requests);
    });

    const unsubscribeAdvertising = onSnapshot(advertisingQuery, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdvertisingApplication[];
      setAdvertisingApplications(applications);
      setLoading(false);
    });

    return () => {
      unsubscribeArtistRequests();
      unsubscribeAdvertising();
    };
  }, []);

  const handleApprove = async (request: ArtistRequest) => {
    setIsProcessing(true);
    try {
      // Update the artist request status
      await updateDoc(doc(db, 'artistRequests', request.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin', // In a real app, this would be the admin user ID
        notes: adminNotes
      });

      // Update the user's profile to make them a professional artist
      await updateDoc(doc(db, 'userProfiles', request.userId), {
        isProfessional: true,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Request approved",
        description: `${request.user.displayName} is now a professional artist.`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (request: ArtistRequest) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'artistRequests', request.id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin',
        rejectionReason: rejectionReason.trim(),
        notes: adminNotes
      });

      toast({
        title: "Request rejected",
        description: `Request from ${request.user.displayName} has been rejected.`,
      });

      setSelectedRequest(null);
      setRejectionReason('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveAdApplication = async (application: AdvertisingApplication) => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'advertisingApplications', application.id), {
        status: 'approved',
        reviewedBy: 'admin',
        reviewedAt: serverTimestamp(),
        updatedAt: new Date()
      });

      toast({
        title: "Application approved",
        description: `Advertising application from ${application.companyName} has been approved.`,
      });

      setSelectedAdApplication(null);
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAdApplication = async (application: AdvertisingApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'advertisingApplications', application.id), {
        status: 'rejected',
        rejectionReason: rejectionReason,
        reviewedBy: 'admin',
        reviewedAt: serverTimestamp(),
        updatedAt: new Date()
      });

      toast({
        title: "Application rejected",
        description: `Advertising application from ${application.companyName} has been rejected.`,
      });

      setSelectedAdApplication(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Video upload functions
  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !videoTags.includes(newTag.trim())) {
      setVideoTags([...videoTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setVideoTags(videoTags.filter(tag => tag !== tagToRemove));
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !videoTitle.trim() || !videoDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a video file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload video to Firebase Storage
      const videoRef = ref(storage, `episodes/${Date.now()}_${videoFile.name}`);
      await uploadBytes(videoRef, videoFile);
      const videoUrl = await getDownloadURL(videoRef);

      // Create episode document in Firestore
      const episodeData: Omit<Episode, 'id'> = {
        title: videoTitle,
        description: videoDescription,
        videoUrl,
        thumbnailUrl: '', // Will be generated later
        duration: parseInt(videoDuration) || 0,
        viewCount: 0,
        likes: 0,
        commentsCount: 0,
        tags: videoTags,
        docuseriesId: 'admin-episodes',
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: new Date(),
        isPublished: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        artist: {
          id: 'admin',
          name: 'SOMA Admin',
          handle: 'soma-admin',
          avatarUrl: '',
          isProfessional: true,
          followerCount: 0,
          followingCount: 0,
          createdAt: new Date(),
          isVerified: true
        }
      };

      await addDoc(collection(db, 'episodes'), episodeData);

      toast({
        title: "Video Uploaded",
        description: "Video has been successfully uploaded to the home feed.",
      });

      // Reset form
      setVideoFile(null);
      setVideoTitle('');
      setVideoDescription('');
      setVideoDuration('');
      setVideoTags([]);
      setNewTag('');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pendingRequests = artistRequests.filter(req => req.status === 'pending');
  const approvedRequests = artistRequests.filter(req => req.status === 'approved');
  const rejectedRequests = artistRequests.filter(req => req.status === 'rejected');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage artist account requests</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Pending</span>
            <span className="sm:hidden">Pending</span>
            <span className="ml-1">({pendingRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Approved</span>
            <span className="sm:hidden">Approved</span>
            <span className="ml-1">({approvedRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Rejected</span>
            <span className="sm:hidden">Rejected</span>
            <span className="ml-1">({rejectedRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="advertising" className="text-xs sm:text-sm">
            <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Advertising</span>
            <span className="sm:hidden">Ads</span>
            <span className="ml-1">({advertisingApplications.filter(app => app.status === 'pending').length})</span>
          </TabsTrigger>
          <TabsTrigger value="video-upload" className="text-xs sm:text-sm">
            <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload Video</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">All artist requests have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.user.avatarUrl || undefined} alt={request.user.displayName} />
                          <AvatarFallback>{request.user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.user.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Portfolio Images</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {request.portfolioImages.slice(0, 3).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                          {request.portfolioImages.length > 3 && (
                            <div className="flex items-center justify-center bg-muted rounded text-sm">
                              +{request.portfolioImages.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Artist Statement</Label>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {request.artistStatement}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Submitted {request.submittedAt instanceof Date ? request.submittedAt.toLocaleDateString() : (request.submittedAt as any).toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No approved requests</h3>
                  <p className="text-muted-foreground">No artist requests have been approved yet.</p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.user.avatarUrl || undefined} alt={request.user.displayName} />
                          <AvatarFallback>{request.user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.user.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Approved {request.reviewedAt instanceof Date ? request.reviewedAt.toLocaleDateString() : (request.reviewedAt as any)?.toDate().toLocaleDateString()}
                      </div>
                      {request.reviewedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          By {request.reviewedBy}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <X className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No rejected requests</h3>
                  <p className="text-muted-foreground">No artist requests have been rejected yet.</p>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.user.avatarUrl || undefined} alt={request.user.displayName} />
                          <AvatarFallback>{request.user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.user.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {request.rejectionReason && (
                        <div>
                          <Label className="text-sm font-medium">Rejection Reason</Label>
                          <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Rejected {request.reviewedAt instanceof Date ? request.reviewedAt.toLocaleDateString() : (request.reviewedAt as any)?.toDate().toLocaleDateString()}
                        </div>
                        {request.reviewedBy && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            By {request.reviewedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="video-upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Upload Video to Home Feed
              </CardTitle>
              <CardDescription>
                Upload videos that will appear in the main home episodes feed for all SOMA users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video File Upload */}
              <div className="space-y-2">
                <Label htmlFor="video-upload">Video File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">Click to upload video</span>
                        <p className="text-xs text-muted-foreground">MP4, MOV, AVI up to 100MB</p>
                      </div>
                    </div>
                  </Label>
                  {videoFile && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">Selected: {videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Title */}
              <div className="space-y-2">
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title..."
                />
              </div>

              {/* Video Description */}
              <div className="space-y-2">
                <Label htmlFor="video-description">Description *</Label>
                <Textarea
                  id="video-description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter video description..."
                  rows={4}
                />
              </div>

              {/* Video Duration */}
              <div className="space-y-2">
                <Label htmlFor="video-duration">Duration (seconds)</Label>
                <Input
                  id="video-duration"
                  type="number"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="Enter duration in seconds..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {videoTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {videoTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleVideoUpload}
                disabled={isUploading || !videoFile || !videoTitle.trim() || !videoDescription.trim()}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video to Home Feed
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertising" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Advertising Applications</h2>
              <div className="text-sm text-muted-foreground">
                {advertisingApplications.length} total applications
              </div>
            </div>

            {advertisingApplications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="mb-2">No advertising applications</CardTitle>
                  <CardDescription>
                    No advertising applications have been submitted yet.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {advertisingApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{application.companyName}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Contact:</strong> {application.contactName}</p>
                              <p><strong>Email:</strong> {application.email}</p>
                              {application.phone && <p><strong>Phone:</strong> {application.phone}</p>}
                              {application.website && <p><strong>Website:</strong> <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.website}</a></p>}
                            </div>
                            <div>
                              <p><strong>Type:</strong> {application.advertisingType}</p>
                              {application.budget && <p><strong>Budget:</strong> {application.budget}</p>}
                              <p><strong>Submitted:</strong> {application.submittedAt instanceof Date ? application.submittedAt.toLocaleDateString() : (application.submittedAt as any)?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                            </div>
                          </div>
                          {application.targetAudience && (
                            <div className="mt-3">
                              <p className="text-sm"><strong>Target Audience:</strong> {application.targetAudience}</p>
                            </div>
                          )}
                          {application.campaignGoals && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Campaign Goals:</strong> {application.campaignGoals}</p>
                            </div>
                          )}
                          {application.message && (
                            <div className="mt-2">
                              <p className="text-sm"><strong>Additional Message:</strong> {application.message}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAdApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveAdApplication(application)}
                                disabled={isProcessing}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdApplication(application);
                                  setRejectionReason('');
                                }}
                                disabled={isProcessing}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <AlertDialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Artist Request Review</AlertDialogTitle>
              <AlertDialogDescription>
                Review the artist request from {selectedRequest.user.displayName}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedRequest.user.avatarUrl || undefined} alt={selectedRequest.user.displayName} />
                  <AvatarFallback className="text-lg">{selectedRequest.user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRequest.user.displayName}</h3>
                  <p className="text-muted-foreground">@{selectedRequest.user.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.user.email}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Portfolio Images */}
              <div>
                <Label className="text-lg font-semibold">Portfolio Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {selectedRequest.portfolioImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Artist Statement */}
              <div>
                <Label className="text-lg font-semibold">Artist Statement</Label>
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{selectedRequest.artistStatement}</p>
              </div>

              {/* Experience */}
              {selectedRequest.experience && (
                <div>
                  <Label className="text-lg font-semibold">Experience & Background</Label>
                  <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{selectedRequest.experience}</p>
                </div>
              )}

              {/* Social Links */}
              {selectedRequest.socialLinks && (
                <div>
                  <Label className="text-lg font-semibold">Social Media Links</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedRequest.socialLinks.instagram && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">Instagram: {selectedRequest.socialLinks.instagram}</span>
                      </div>
                    )}
                    {selectedRequest.socialLinks.twitter && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">Twitter: {selectedRequest.socialLinks.twitter}</span>
                      </div>
                    )}
                    {selectedRequest.socialLinks.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">Website: {selectedRequest.socialLinks.website}</span>
                      </div>
                    )}
                    {selectedRequest.socialLinks.tiktok && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">TikTok: {selectedRequest.socialLinks.tiktok}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this request..."
                  rows={3}
                />
              </div>

              {/* Rejection Reason (only for pending requests) */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedRequest(null)}>
                Close
              </AlertDialogCancel>
              {selectedRequest.status === 'pending' && (
                <>
                  <AlertDialogAction
                    onClick={() => handleReject(selectedRequest)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Rejecting...' : 'Reject'}
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Approving...' : 'Approve'}
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}

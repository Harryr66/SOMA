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
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArtistRequest } from '@/lib/types';
import { Check, X, Eye, Clock, User, Calendar, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [artistRequests, setArtistRequests] = useState<ArtistRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ArtistRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'artistRequests'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArtistRequest[];
      setArtistRequests(requests);
      setLoading(false);
    });

    return () => unsubscribe();
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
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


"use client";

import Image from 'next/image';
import { type Artwork } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Heart, MoreHorizontal, Edit, Trash2, Bookmark, Repeat, Send, Flag } from 'lucide-react';
import { useState } from 'react';
import { GradientHeart } from './gradient-heart';
import { GradientRepeat } from './gradient-repeat';
import { GradientSend } from './gradient-send';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useContent } from '@/providers/content-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { connections } from '@/lib/data';
import { GradientBookmark } from './gradient-bookmark';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick?: () => void;
  displayMode?: 'full' | 'tile';
}

export function ArtworkCard({ artwork, onClick, displayMode = 'full' }: ArtworkCardProps) {
  if (displayMode === 'tile') {
    return (
      <Card
        className="overflow-hidden group cursor-pointer rounded-none"
        onClick={onClick}
      >
        <div className="relative aspect-square">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={artwork.imageAiHint}
          />
        </div>
      </Card>
    );
  }

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReshared, setIsReshared] = useState(false);
  const { user } = useAuth();
  const { deleteContentByArtworkId, updateArtworkTitle } = useContent();
  const { toast } = useToast();
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(artwork.title);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);


  const isAuthor = user?.uid === artwork.artist.id;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    toast({
      title: newSavedState ? "Post Saved!" : "Post Unsaved",
      description: newSavedState
        ? `"${artwork.title}" was added to your saved posts.`
        : `"${artwork.title}" was removed from your saved posts.`,
    });
  };

  const handleDelete = () => {
    deleteContentByArtworkId(artwork.id);
    toast({
        title: "Content Deleted",
        description: "The content has been permanently removed.",
    });
  };

  const handleSaveEdit = () => {
    updateArtworkTitle(artwork.id, editedTitle);
    setIsEditDialogOpen(false);
    toast({
        title: "Title Updated",
        description: "The artwork title has been successfully updated.",
    });
  };
  
  const handleReshare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newResharedState = !isReshared;
    setIsReshared(newResharedState);
    toast({
      title: newResharedState ? "Post Reshared!" : "Reshare Removed",
      description: newResharedState ? `You've reshared "${artwork.title}".` : `Your reshare has been removed.`
    });
  };

  const handleSend = (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    setIsSendDialogOpen(false);
    toast({
      title: "Artwork Shared!",
      description: `You sent "${artwork.title}" to ${artistName}.`,
    });
  };
  
  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
        title: "Content Reported",
        description: "Thank you for your feedback. We will review this content."
    });
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden group flex flex-col h-full"
      )}
    >
      <CardContent className="p-0 relative">
        <div 
          className={cn("aspect-square w-full overflow-hidden", onClick && "cursor-pointer")}
          onClick={onClick}
        >
         <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={artwork.imageAiHint}
          />
        </div>
      </CardContent>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <h3 className="font-headline text-lg font-semibold leading-tight">{artwork.title}</h3>
        </div>
        <div className="flex items-center w-full mt-2">
            <div className="flex items-center space-x-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:text-foreground no-focus-outline" onClick={handleLikeClick}>
                    {isLiked ? <GradientHeart className="w-5 h-5" /> : <Heart className="w-5 h-5 text-foreground"/>}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:text-foreground no-focus-outline" onClick={handleReshare}>
                    {isReshared ? <GradientRepeat className="w-5 h-5" /> : <Repeat className="w-5 h-5 text-foreground"/>}
                </Button>
                <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-foreground hover:text-foreground no-focus-outline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isSendDialogOpen ? <GradientSend className="w-5 h-5" /> : <Send className="w-5 h-5 text-foreground" />}
                        </Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                        <DialogTitle>Share Post</DialogTitle>
                        <DialogDescription>
                            Send this artwork to one of your connections.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-2 max-h-[40vh] overflow-y-auto">
                        {connections.map((artist) => (
                            <div key={artist.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                <AvatarImage src={artist.avatarUrl || 'https://placehold.co/40x40.png'} alt={artist.name} data-ai-hint="artist portrait" />
                                <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                <p className="font-semibold text-sm">{artist.name}</p>
                                <p className="text-xs text-muted-foreground">{artist.handle}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={(e) => handleSend(e, artist.name)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                            </Button>
                            </div>
                        ))}
                        </div>
                    </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:text-foreground no-focus-outline" onClick={handleSaveClick}>
                    {isSaved ? <GradientBookmark className="w-5 h-5" /> : <Bookmark className="w-5 h-5 text-foreground" />}
                </Button>
            </div>
            <div className="flex-1" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-foreground hover:text-foreground no-focus-outline" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {isAuthor && (
                    <>
                        <DropdownMenuItem onClick={() => { setIsEditDialogOpen(true); setEditedTitle(artwork.title); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Title</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Post</span>
                            </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the post from your profile and the feed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuSeparator />
                    </>
                )}
                 <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={handleReport}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report Content</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
            <DialogTitle>Edit Artwork Title</DialogTitle>
            <DialogDescription>
                Make changes to your artwork's title here. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                        Title
                    </Label>
                    <Input
                        id="title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSaveEdit}>Save changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

    

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DollarSign, Heart, Plus, PenSquare, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useContent } from "@/providers/content-provider";
import { StoryUploader } from "./story-uploader";
import { type Artist, type StoryItem } from "@/lib/types";
import { StoryViewer } from "./story-viewer";


export function ProfileHeader() {
  const { user, isTipJarEnabled, avatarUrl, profileRingColor } = useAuth();
  const { storyItems } = useContent();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bioLines, setBioLines] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [isProcessingTip, setIsProcessingTip] = useState(false);
  const presetTipAmounts = [5, 10, 25];

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const hasActiveStory = useMemo(() => {
    if (!user) return false;
    return storyItems.some(item => item.artistId === user.uid);
  }, [storyItems, user]);

  useEffect(() => {
    if (user) {
      const savedProfile = JSON.parse(localStorage.getItem(`userProfile-${user.uid}`) || '{}');

      setDisplayName(user.displayName || savedProfile.displayName || "New Artist");
      const handleFromStorage = savedProfile.handle || user.email?.split('@')[0] || "newartist";
      setHandle(handleFromStorage.replace(/^@/, ''));

      const loadedBioLines = [
        savedProfile.bio1,
        savedProfile.bio2,
        savedProfile.bio3,
        savedProfile.bio4,
      ].filter(Boolean);

      setBioLines(loadedBioLines);
      setWebsiteUrl(savedProfile.website || null);
    }
  }, [user]);

  const handleSendTip = async () => {
    const numericAmount = parseFloat(tipAmount);
    if (!tipAmount || isNaN(numericAmount) || numericAmount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid positive number for the tip.',
        });
        return;
    }
    setIsProcessingTip(true);

    // In a real app, you would integrate with a payment provider like Stripe here.
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessingTip(false);
    setIsTipDialogOpen(false); // Close the dialog
    setTipAmount(''); // Reset the amount

    toast({
        title: 'Tip Sent!',
        description: `Thank you for sending a $${numericAmount.toFixed(2)} tip to ${displayName}!`,
    });
  };

  const currentUserArtist: Artist | null = user ? {
    id: user.uid,
    name: displayName,
    handle: handle,
    avatarUrl: avatarUrl || undefined,
  } : null;
  
  const ringStyle = !hasActiveStory && profileRingColor ? { borderColor: profileRingColor } : {};
  const ringClassName = cn(
    "p-1 rounded-full",
    {
      'story-gradient-border': hasActiveStory,
      'border-2': !hasActiveStory && !!profileRingColor,
      'border-2 border-border': !hasActiveStory && !profileRingColor
    }
  );

  return (
    <header className="bg-card p-6 rounded-lg border border-muted">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
               <div className={ringClassName} style={ringStyle}>
                <div className="bg-background p-0.5 rounded-full">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} data-ai-hint="artist portrait" />
                    <AvatarFallback>
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full text-muted-foreground"
                      >
                        <path
                          d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 10c-3.309 0-6 2.691-6 6v2h12v-2c0-3.309-2.691-6-6-6z"
                          fill="currentColor"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-8 w-8 text-white" />
              </div>
            </div>
          </DialogTrigger>
           <DialogContent className={cn(
              hasActiveStory 
                ? "bg-transparent border-none p-0 w-screen h-screen max-w-full sm:max-w-full" 
                : "max-h-[95vh] overflow-y-auto"
            )}>
            {hasActiveStory && currentUserArtist ? (
              <StoryViewer artist={currentUserArtist} onClose={() => setIsStoryDialogOpen(false)} />
            ) : (
              <StoryUploader onClose={() => setIsStoryDialogOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-headline text-4xl font-semibold">{displayName}</h1>
          <p className="text-muted-foreground">@{handle}</p>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-6">
            <div className="text-center">
                <p className="font-bold text-lg">{followers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center cursor-pointer">
                <p className="font-bold text-lg">{following.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
          <div className="mt-2 max-w-prose space-y-1">
            {bioLines.map((line, index) => (
                <p key={index}>{line}</p>
            ))}
            {websiteUrl && (
              <a 
                href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-semibold inline-flex items-center gap-2 pt-1"
              >
                <LinkIcon className="h-4 w-4" />
                {websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          
          <div className="mt-4 flex justify-center md:justify-start items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/profile/edit">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Edit Profile
                </Link>
            </Button>
            <Button variant="outline">Share</Button>
            
            {isTipJarEnabled && (
              <Dialog open={isTipDialogOpen} onOpenChange={setIsTipDialogOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline">
                          <Heart className="mr-2 h-4 w-4" /> Tip
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Send a Tip to {displayName}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                          <div className="space-y-2">
                              <Label>Select an amount</Label>
                              <div className="flex gap-2">
                                  {presetTipAmounts.map(amount => (
                                      <Button
                                          key={amount}
                                          variant={tipAmount === String(amount) ? 'default' : 'outline'}
                                          onClick={() => setTipAmount(String(amount))}
                                      >
                                          ${amount}
                                      </Button>
                                  ))}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="custom-tip">Or enter a custom amount (USD)</Label>
                              <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                      id="custom-tip" 
                                      type="number" 
                                      placeholder="5.00" 
                                      className="pl-8" 
                                      value={tipAmount}
                                      onChange={(e) => setTipAmount(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>
                      <DialogFooter>
                          <DialogClose asChild>
                              <Button variant="ghost" disabled={isProcessingTip}>Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleSendTip} disabled={isProcessingTip || !tipAmount}>
                              {isProcessingTip && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Send Tip
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

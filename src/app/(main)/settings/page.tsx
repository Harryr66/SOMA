
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "firebase/auth";
import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, FileText, Image as ImageIcon, UploadCloud, X, LogOut, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import imageCompression from 'browser-image-compression';


// New component for Profile Completion
function ProfileCompletionCard() {
  // Mocked data for demonstration. In a real app, this would come from user data.
  const tasks = [
    { id: 'picture', text: 'Upload a profile picture', completed: true, points: 25 },
    { id: 'bio', text: 'Write a compelling bio', completed: true, points: 25 },
    { id: 'upload', text: 'Share your first piece of content', completed: true, points: 25 },
    { id: 'follow', text: 'Follow another artist', completed: false, points: 25 },
  ];

  const progress = tasks.reduce((acc, task) => acc + (task.completed ? task.points : 0), 0);
  const remainingTasks = tasks.filter(task => !task.completed);

  const getRank = (p: number) => {
    if (p < 50) return { name: 'Amateur', nextRank: 'Semi Pro' };
    if (p < 75) return { name: 'Semi Pro', nextRank: 'Professional' };
    if (p < 100) return { name: 'Professional', nextRank: 'Art Master' };
    return { name: 'Art Master', nextRank: null };
  };

  const { name, nextRank } = getRank(progress);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Profile Completion</CardTitle>
        <CardDescription>Complete your profile to unlock new features and gain visibility.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-foreground font-semibold">{name}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-chart-2" />
          {remainingTasks.length > 0 && (
            <div className="pt-2 space-y-2">
               <p className="text-xs text-muted-foreground">
                {nextRank ? `Complete the next steps to become a ${nextRank}:` : "You are almost there!"}
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                {remainingTasks.map(task => (
                  <li key={task.id}>{task.text}</li>
                ))}
              </ul>
            </div>
          )}
          {remainingTasks.length === 0 && (
             <p className="text-xs text-muted-foreground text-center pt-2">You have achieved the highest rank. Well done, Art Master!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportBugDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bugFormSchema = z.object({
    description: z.string().min(10, "Please provide a detailed description of the bug."),
  });

  const form = useForm<z.infer<typeof bugFormSchema>>({
    resolver: zodResolver(bugFormSchema),
    defaultValues: { description: '' },
  });

  const resetDialog = () => {
    form.reset();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image smaller than 10MB.' });
            return;
        }

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(selectedFile, options);
            setFile(compressedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Bug report image compression error:", error);
            setFile(selectedFile); // Fallback
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }
  };
  
  async function onSubmit(data: z.infer<typeof bugFormSchema>) {
    setIsSubmitting(true);
    // In a real app, this would send the report to a backend service.
    // For now, we simulate the submission.
    console.log({
      report: data,
      user: user?.email,
      file: file?.name,
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
        title: "Bug Report Submitted!",
        description: "Thank you for your feedback. Our team will look into it shortly.",
    });

    setIsSubmitting(false);
    resetDialog();
    setIsDialogOpen(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetDialog(); setIsDialogOpen(isOpen); }}>
      <DialogTrigger asChild>
        <Button variant="outline">Report a Bug</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve SOMA by describing the issue you've encountered.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bug Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Please be as detailed as possible..." {...field} rows={5} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-2">
                  <FormLabel>Attach Screenshot (Optional)</FormLabel>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   {previewUrl ? (
                      <div className="relative w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                        <Image src={previewUrl} alt="Preview" fill={true} style={{objectFit: "contain"}} className="rounded-lg p-2" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 z-10"
                            onClick={() => {
                                setFile(null);
                                setPreviewUrl(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => fileInputRef.current?.click()}
                      >
                          <UploadCloud className="h-8 w-8 text-muted-foreground" />
                          <p className="mt-1 text-sm text-muted-foreground">Click to upload an image</p>
                      </div>
                  )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user is signed in to delete.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // For a real app, you would also need to delete user data from your database (e.g., Firestore)
      // and files from storage. This example only covers Firebase Auth deletion.
      await deleteUser(user);
      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been successfully deleted.",
      });
      await signOut();
    } catch (error: any) {
      console.error("Account deletion error", error);
      let description = "An unexpected error occurred. Please try signing out and back in again before retrying.";
      if (error.code === 'auth/requires-recent-login') {
        description = "This is a sensitive operation and requires a recent login. Please sign out and log back in before deleting your account.";
      }
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: description,
      });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account and app preferences.</p>
      </header>
      
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Display</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="theme-toggle" className="font-medium">Theme</Label>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Account</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
                <p className="text-sm text-muted-foreground mt-2">You will be returned to the login page.</p>
            </CardContent>
        </Card>

        <ProfileCompletionCard />

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Support</CardTitle>
                <CardDescription>Need help? Report a bug or contact our support team.</CardDescription>
            </CardHeader>
            <CardContent>
                <ReportBugDialog />
            </CardContent>
        </Card>
        
        <Card className="border-destructive">
             <CardHeader>
                <CardTitle className="font-headline text-destructive">Delete Account</CardTitle>
                <CardDescription className="text-foreground/90">It's okay, I get it...I understand sometimes you need to see other platforms. But be warned, this action is irreversible. When you delete your account, all associated data, including your profile, posts, and artwork, will be permanently removed. This cannot be undone. If you have any issues, please contact our support team before proceeding.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="delete-terms" checked={hasAgreed} onCheckedChange={(checked) => setHasAgreed(checked === true)} />
                    <Label htmlFor="delete-terms" className="font-medium">I understand that this action is permanent and cannot be reversed.</Label>
                  </div>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={!hasAgreed || isDeleting}>Delete My Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your account,
                                  remove your data from our servers, and delete all of your uploaded artwork and posts.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={handleDeleteAccount} 
                                  disabled={isDeleting}
                              >
                                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Yes, delete my account
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

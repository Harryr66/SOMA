
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PenSquare, ShoppingBag, Star, BarChart4, PlusCircle, UploadCloud, X, ArrowLeft, Gavel, Smile, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type EmojiClickData } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { idbSetAvatar, idbDeleteAvatar } from '@/lib/idb';
import imageCompression from 'browser-image-compression';
import { type Artist } from '@/lib/types';

const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  handle: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  bio1: z.string().max(20, "Each line cannot exceed 20 characters.").optional(),
  bio2: z.string().max(20, "Each line cannot exceed 20 characters.").optional(),
  bio3: z.string().max(20, "Each line cannot exceed 20 characters.").optional(),
  bio4: z.string().max(20, "Each line cannot exceed 20 characters.").optional(),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  artistType: z.string().optional(),
});

const productFormSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  description: z.string().min(10, "Please provide a short description."),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Please enter a valid price.",
  }),
  productType: z.enum(['digital', 'physical'], {
    required_error: 'You need to select a product type.',
  }),
});

export default function ManageProfilePage() {
  // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const isProfessional = false;
  const loading = false;
  const signOut = () => {};
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      handle: '',
      bio1: '',
      bio2: '',
      bio3: '',
      bio4: '',
      website: '',
      artistType: '',
    },
  });

  useEffect(() => {
    if (user) {
      const savedProfile = JSON.parse(localStorage.getItem(`userProfile-${user.uid}`) || '{}');
      form.reset({
        name: user.displayName || '',
        handle: (savedProfile.handle || user.email?.split('@')[0] || ''),
        bio1: savedProfile.bio1 || '',
        bio2: savedProfile.bio2 || '',
        bio3: savedProfile.bio3 || '',
        bio4: savedProfile.bio4 || '',
        website: savedProfile.website || '',
        artistType: savedProfile.artistType || '',
      });
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !auth.currentUser) {
        toast({
            variant: 'destructive',
            title: 'Not Authenticated',
            description: 'You must be logged in to update your profile.',
        });
        return;
    }

    try {
        const oldProfile = JSON.parse(localStorage.getItem(`userProfile-${user.uid}`) || '{}');
        const oldHandle = oldProfile.handle || '';
        const newHandle = values.handle;

        if (newHandle.toLowerCase() !== oldHandle.toLowerCase()) {
            const usernames = JSON.parse(localStorage.getItem('soma-usernames') || '{}');
            if (Object.values(usernames).some((uid: any) => uid !== user.uid && Object.keys(usernames).find(h => usernames[h] === uid)?.toLowerCase() === newHandle.toLowerCase())) {
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: 'This username is already taken. Please choose another one.',
                });
                return;
            }
            
            // Update username mapping
            const emails = JSON.parse(localStorage.getItem('soma-user-emails') || '{}');
            if (oldHandle) {
              delete usernames[oldHandle];
              delete emails[oldHandle];
            }
            usernames[newHandle] = user.uid;
            if (user.email) {
              emails[newHandle] = user.email;
            }
            localStorage.setItem('soma-usernames', JSON.stringify(usernames));
            localStorage.setItem('soma-user-emails', JSON.stringify(emails));
        }

        if (values.name !== user.displayName) {
            await updateProfile(auth.currentUser, { displayName: values.name });
        }

        const profileData = {
            handle: newHandle,
            bio1: values.bio1,
            bio2: values.bio2,
            bio3: values.bio3,
            bio4: values.bio4,
            website: values.website,
            artistType: values.artistType,
            displayName: values.name,
        };
        localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(profileData));

        // Update user in the global list of searchable users
        const allUsersRaw = localStorage.getItem('soma-all-users');
        if (allUsersRaw) {
            let allUsers: Artist[] = JSON.parse(allUsersRaw);
            const userIndex = allUsers.findIndex(u => u.id === user.uid);
            if (userIndex > -1) {
                allUsers[userIndex].name = values.name;
                allUsers[userIndex].handle = newHandle;
                localStorage.setItem('soma-all-users', JSON.stringify(allUsers));
            }
        }

        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved. They will be visible on your next page load.',
        });
    } catch (error) {
        console.error("Profile update error", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'There was an error updating your profile.',
        });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <Button variant="outline" onClick={router.back} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Manage Profile</h1>
        <p className="text-muted-foreground text-lg">Update your profile information and manage your content.</p>
      </header>

      {isProfessional ? (
        <Tabs defaultValue="edit-profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="edit-profile"><PenSquare className="w-4 h-4 mr-2"/>Edit Profile</TabsTrigger>
            <TabsTrigger value="products"><ShoppingBag className="w-4 h-4 mr-2"/>Products</TabsTrigger>
            <TabsTrigger value="auctions"><Star className="w-4 h-4 mr-2"/>Auctions</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart4 className="w-4 h-4 mr-2"/>Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="edit-profile" className="mt-6">
            <EditProfileForm form={form} onSubmit={onSubmit} />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductsTabContent />
          </TabsContent>
          <TabsContent value="auctions" className="mt-6">
             <AuctionsTabContent />
          </TabsContent>
           <TabsContent value="analytics" className="mt-6">
             <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      ) : (
         <EditProfileForm form={form} onSubmit={onSubmit} />
      )}
    </div>
  );
}

// Helper component for the form to avoid repetition
function EditProfileForm({ form, onSubmit }: { form: any, onSubmit: (values: any) => void }) {
    const { toast } = useToast();
    const { theme } = useTheme();
    // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const isProfessional = false;
  const loading = false;
  const signOut = () => {};
    
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetDialog = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    };
  
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please select an image smaller than 10MB.',
          });
          return;
        }

        const options = {
            maxSizeMB: 0.5, // Avatars can be smaller
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error("Avatar compression error:", error);
            setSelectedFile(file); // Fallback to original
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
      }
    };
  
    const handleUpload = async () => {
      if (!selectedFile || !user || !previewUrl) {
        toast({
          variant: 'destructive',
          title: 'No file selected',
          description: 'Please select an image to upload.',
        });
        return;
      }
      setIsUploading(true);
  
      try {
          await idbSetAvatar(user.uid, selectedFile);
          setAvatarUrl(previewUrl);
          setHasCustomAvatar(true);
          toast({
              title: 'Profile Picture Updated!',
              description: 'Your new picture has been saved.',
          });
      } catch (error) {
          console.error("Avatar upload error", error);
          toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: 'Could not save your new avatar.',
          });
      } finally {
          setIsUploading(false);
          resetDialog();
          setIsAvatarDialogOpen(false);
      }
    };
  
    const handleRemovePicture = async () => {
      if (!user) return;
      try {
          await idbDeleteAvatar(user.uid);
          setAvatarUrl(null);
          setHasCustomAvatar(false);
          resetDialog();
          setIsAvatarDialogOpen(false);
          toast({
              title: 'Profile Picture Removed',
              description: 'Your custom profile picture has been removed.',
          });
      } catch (error) {
           console.error("Avatar removal error", error);
          toast({
              variant: 'destructive',
              title: 'Removal Failed',
              description: 'Could not remove your avatar.',
          });
      }
    };

    const colorPalettes = {
      "Neon": [
        '#00FFFF', // Neon Blue
        '#FFA500', // Neon Orange
        '#FF69B4', // Neon Pink
        '#FF0000', // Neon Red
      ],
      "Natural": [
        '#F4C2C2', // Baby Pink
        '#FFD700', // Natural Yellow
        '#228B22', // Forrest Green
        '#DDA0DD', // Plum
        '#800020', // Burgundy
        '#FFFFFF', // White
      ]
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Your Profile</CardTitle>
                <CardDescription>Update your public-facing information and profile settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                   <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl || undefined} alt={user?.displayName || "User"} data-ai-hint="artist portrait" />
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
                      <Dialog open={isAvatarDialogOpen} onOpenChange={(open) => {
                        setIsAvatarDialogOpen(open);
                        if (!open) {
                          resetDialog();
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Change Picture</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Profile Picture</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                            {previewUrl ? (
                              <div className="flex flex-col items-center gap-4">
                                <Image src={previewUrl} alt="Preview" width={192} height={192} style={{objectFit:"cover"}} className="rounded-full h-48 w-48" />
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                  Change Image
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
                                <p className="text-xs text-muted-foreground">PNG or JPG recommended</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:items-center pt-4">
                            <div>
                              {hasCustomAvatar && (
                                  <Button variant="destructive" onClick={handleRemovePicture} disabled={isUploading}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove Picture
                                  </Button>
                              )}
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-2">
                              <DialogClose asChild>
                                <Button variant="ghost" disabled={isUploading}>Cancel</Button>
                              </DialogClose>
                              <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                </div>

                <Separator className="my-8" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="handle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                     <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                                        <Input placeholder="your_handle" {...field} className="pl-7" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormDescription>
                                Write up to 4 one-line sentences about yourself. Each line is limited to 20 characters.
                            </FormDescription>
                            <div className="space-y-2 pt-2">
                                <FormField control={form.control} name="bio1" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="e.g. I create vibrant abstract landscapes." {...field} className="text-muted-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bio2" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="e.g. My work explores themes of nature and memory." {...field} className="text-muted-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bio3" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="e.g. Inspired by the impressionist masters." {...field} className="text-muted-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bio4" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="e.g. Welcome to my creative journey!" {...field} className="text-muted-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website / Link</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://your-portfolio.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Add a link to your personal website, portfolio, or social media.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="artistType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artist Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Painter, Sculptor" {...field} />
                              </FormControl>
                              <FormDescription>
                                This label will appear on your profile.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button variant="outline" type="submit">Save Changes</Button>
                    </form>
                </Form>
                
                <Separator className="my-8" />
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Profile Ring Color</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize the color of the ring around your profile picture.
                    </p>
                    {Object.entries(colorPalettes).map(([category, colors]) => (
                      <div key={category}>
                        <h4 className="font-semibold mb-3">{category}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                            {colors.map((color) => (
                                <Button
                                    key={color}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-full",
                                        profileRingColor === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                    )}
                                    onClick={() => setProfileRingColor(color)}
                                >
                                    <div className="h-full w-full rounded-full border" style={{ backgroundColor: color }}/>
                                </Button>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>

                <Separator className="my-8" />
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Type</h3>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="professional-account-switch" className="font-normal">
                                Professional Artist Account
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Enable auctions, direct sales, and community features.
                            </p>
                        </div>
                        <Switch
                            id="professional-account-switch"
                            checked={isProfessional}
                            onCheckedChange={setIsProfessional}
                        />
                    </div>
                </div>

                {isProfessional && (
                    <>
                        <Separator className="my-8" />
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Support Settings</h3>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="tip-jar-switch" className="font-normal">
                                        Enable Tip Jar
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow followers to send you tips directly from your profile.
                                    </p>
                                </div>
                                <Switch 
                                    id="tip-jar-switch"
                                    checked={isTipJarEnabled}
                                    onCheckedChange={(checked) => {
                                        setIsTipJarEnabled(checked);
                                        toast({
                                            title: `Tip Jar ${checked ? 'Enabled' : 'Disabled'}`,
                                            description: `Followers can ${checked ? 'now' : 'no longer'} send you tips.`
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// New component for Products Tab
function ProductsTabContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const resetDialog = () => {
    form.reset();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setIsDialogOpen(false);
  };

  function onSubmit(data: z.infer<typeof productFormSchema>) {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file uploaded",
        description: "Please upload a file for your product.",
      });
      return;
    }
    toast({
      title: 'Product Created!',
      description: `Your product "${data.name}" has been added.`,
    });
    console.log({ ...data, fileName: file.name });
    resetDialog();
  }

  return (
    <div className="text-center py-20 bg-card rounded-lg border border-dashed">
      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="font-headline text-2xl mt-4">No Products Yet</h3>
      <p className="text-muted-foreground mt-1 mb-4">Add and manage your digital or physical products for sale.</p>
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) resetDialog(); setIsDialogOpen(isOpen);}}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a New Product</DialogTitle>
            <DialogDescription>
              Fill out the details below to list a new product in your shop.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="space-y-2">
                <Label>Product File/Image</Label>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf,.zip"
                />
                 {previewUrl && file ? (
                    <div className="relative w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <Image 
                          src={previewUrl}
                          alt="Preview"
                          fill={true}
                          style={{objectFit: "contain"}}
                          className="rounded-lg p-2"
                      />
                      <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 z-10"
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
                    <div 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Click to upload a file</p>
                    </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Art Print or Digital Pack" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what your customers will get." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25.00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex pt-2 gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="digital" />
                            </FormControl>
                            <FormLabel className="font-normal">Digital</FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="physical" />
                            </FormControl>
                            <FormLabel className="font-normal">Physical</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="pt-2"/>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={resetDialog}>Cancel</Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// New component for Auctions Tab
function AuctionsTabContent() {
  return (
    <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
      <Gavel className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-6 font-headline text-3xl font-semibold text-card-foreground">The Auction House is Being Built</h3>
      <p className="mt-3 max-w-md mx-auto text-muted-foreground">We're putting the finishing touches on our auction platform. When it's ready, you'll manage your auctions from here.</p>
    </div>
  );
}

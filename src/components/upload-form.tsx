
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleSuggestTags } from "@/lib/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/providers/auth-provider";
import { useContent } from "@/providers/content-provider";
import { useRouter } from "next/navigation";
import { type Post, type Artwork, type Artist } from "@/lib/types";
import imageCompression from 'browser-image-compression';

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  contentPurpose: z.enum(["sale", "public", "exclusive"], {
    required_error: "You must select the purpose of this content.",
  }),
  listingType: z.enum(["for-sale", "for-auction"]).optional(),
  price: z.string().optional(),
  startingBid: z.string().optional(),
  auctionEndDate: z.date().optional(),
  artworkDescription: z.string().min(10, { message: "Description must be at least 10 characters." }),
  artistIntent: z.string().optional(),
  aiAssistance: z.enum(["traditional", "digital", "ai-assisted", "ai-generated"]).optional(),
}).refine(data => {
  if (data.contentPurpose === 'sale') {
    return data.aiAssistance !== undefined;
  }
  return true;
}, {
  message: "You must select an AI transparency level for artwork being sold.",
  path: ["aiAssistance"],
}).refine(data => {
  if (data.contentPurpose === 'sale') {
    return data.listingType !== undefined;
  }
  return true;
}, {
  message: "Please specify if this is for sale or auction.",
  path: ["listingType"],
}).refine(data => {
    if (data.listingType === 'for-sale') {
        return data.price !== undefined && data.price !== '' && !isNaN(Number(data.price)) && Number(data.price) > 0;
    }
    return true;
}, {
    message: "Price is required and must be a positive number.",
    path: ["price"],
}).refine(data => {
    if (data.listingType === 'for-auction') {
        return data.startingBid !== undefined && data.startingBid !== '' && !isNaN(Number(data.startingBid)) && Number(data.startingBid) > 0;
    }
    return true;
}, {
    message: "Starting bid is required and must be a positive number.",
    path: ["startingBid"],
}).refine(data => {
    if (data.listingType === 'for-auction') {
        return data.auctionEndDate !== undefined;
    }
    return true;
}, {
    message: "Auction end date is required.",
    path: ["auctionEndDate"],
});

const suggestedTagCategories = {
  "Popular Subjects": ["portrait", "landscape", "abstract", "still life", "figurative", "animal", "nude", "cityscape", "seascape", "botanical", "mythology"],
  "Art Styles": ["impressionism", "surrealism", "cubism", "pop art", "minimalism", "fantasy", "realism", "expressionism", "futurism", "art nouveau", "street art", "photorealism", "conceptual"],
  "Mediums": ["oil painting", "watercolor", "sculpture", "photography", "digital art", "charcoal", "ink", "gouache", "mixed media", "collage", "linocut", "bronze"],
  "Moods & Colors": ["vibrant", "dark", "pastel", "serene", "energetic", "calm", "ethereal", "melancholy", "joyful", "chaotic", "warm tones", "cool tones"],
  "Color Palettes": ["monochromatic", "complementary", "analogous", "triadic", "tetradic", "split-complementary", "earth tones", "jewel tones", "neon", "grayscale", "achromatic", "polychromatic"],
}


export function UploadForm() {
  const { user, isProfessional, avatarUrl } = useAuth();
  const { addContent } = useContent();
  const router = useRouter();

  const [hasCommunity] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artworkDescription: "",
      artistIntent: "",
    },
  });
  
  const contentPurpose = form.watch("contentPurpose");
  const listingType = form.watch("listingType");


  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
          const options = {
              maxSizeMB: 2, // Allow slightly larger for main posts
              maxWidthOrHeight: 2048,
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
              console.error('Compression error:', error);
              toast({ variant: 'destructive', title: 'Compression Failed' });
              setFile(selectedFile); // Fallback
              const reader = new FileReader();
              reader.onloadend = () => {
                  setPreviewUrl(reader.result as string);
              };
              reader.readAsDataURL(selectedFile);
          }
      } else {
          setFile(selectedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSuggest = async () => {
    const { artworkDescription, artistIntent } = form.getValues();
    if (!artworkDescription) {
      toast({
        variant: "destructive",
        title: "Description needed",
        description: "Please provide an artwork description to get tag suggestions.",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await handleSuggestTags({
        artworkDescription,
        artistIntent: artistIntent || "",
      });
      if (result.tags) {
        setTags((prevTags) => [...new Set([...prevTags, ...result.tags])]);
        toast({
          title: "Tags Suggested!",
          description: "We've added some AI-powered tag suggestions.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not suggest tags. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
  };

  const handleAddTagFromInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file || !previewUrl || !user) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file to upload.",
      });
      return;
    }

    const currentUserArtist: Artist = {
        id: user.id,
        name: user.displayName || 'Anonymous User',
        handle: user.email?.split('@')[0] || 'anonymous',
        avatarUrl: avatarUrl || undefined,
    };

    const newArtwork: Artwork = {
        id: `art-${Date.now()}`,
        artist: currentUserArtist,
        title: values.title,
        imageUrl: previewUrl,
        imageAiHint: 'custom upload',
    };

    const newPost: Post = {
        id: `post-${Date.now()}`,
        artworkId: newArtwork.id,
        artist: currentUserArtist,
        imageUrl: previewUrl,
        imageAiHint: 'custom upload',
        caption: values.artworkDescription,
        likes: 0,
        commentsCount: 0,
        timestamp: 'Just now',
        createdAt: Date.now(),
    };

    addContent(newPost, newArtwork);

    toast({
      title: "Post Live!",
      description: `Your content is now live on the feed and your profile.`,
    });

    router.push('/feed');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-headline">Content File</CardTitle>
                </CardHeader>
                <CardContent>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif, video/mp4, video/webm"
                    />
                     {previewUrl && file ? (
                        <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                              <Image 
                                  src={previewUrl}
                                  alt={file.name}
                                  fill={true}
                                  style={{objectFit: "cover"}}
                                  className="rounded-lg"
                                  data-ai-hint="custom upload"
                              />
                          ) : (
                              <div className="text-center p-4">
                                  <p className="font-semibold">{file.name}</p>
                                  <p className="text-sm text-muted-foreground">Video preview not available</p>
                              </div>
                          )}
                          <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 z-10"
                              onClick={handleRemoveImage}
                          >
                              <X className="h-4 w-4" />
                          </Button>
                        </div>
                    ) : (
                        <div 
                            className="flex items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={handleFileSelectClick}
                        >
                            <p className="text-muted-foreground text-center px-4">Click to select an image or video</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="contentPurpose"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">What is the purpose of this content?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset dependent fields when purpose changes
                        form.reset({
                          ...form.getValues(),
                          contentPurpose: value as any,
                          listingType: undefined,
                          price: '',
                          startingBid: '',
                          auctionEndDate: undefined,
                          aiAssistance: undefined,
                        });
                      }}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="sale" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">Artwork for Sale or Auction</FormLabel>
                            <FormDescription>
                                The content is an artwork you intend to list on the marketplace.
                            </FormDescription>
                        </div>
                      </FormItem>
                      <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">Public Post</FormLabel>
                            <FormDescription>
                                Share an update, work-in-progress, or studio tour to your main feed.
                            </FormDescription>
                        </div>
                      </FormItem>
                       {isProfessional && (
                          <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary md:col-span-2">
                            <FormControl>
                              <RadioGroupItem value="exclusive" disabled={!hasCommunity} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className={cn("font-normal", !hasCommunity && "text-muted-foreground")}>
                                  Exclusive Community Content
                                </FormLabel>
                                <FormDescription>
                                  Post exclusive content like courses, tutorials, or behind-the-scenes videos for your community members.
                                  {!hasCommunity && " You must create a community first on your profile page."}
                                </FormDescription>
                            </div>
                          </FormItem>
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 'Cosmic Dreamscape'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {contentPurpose === 'sale' && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-xl">Listing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-semibold">How would you like to list this?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border bg-background p-4 has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="for-sale" />
                              </FormControl>
                              <FormLabel className="font-normal">List for Sale</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border bg-background p-4 has-[:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value="for-auction" />
                              </FormControl>
                              <FormLabel className="font-normal">Start an Auction</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {listingType === 'for-sale' && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Set Price (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {listingType === 'for-auction' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startingBid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Bid (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="auctionEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col pt-2">
                            <FormLabel>Auction End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="pt-1" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="artworkDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the content, its style, and subject matter..." {...field} rows={4}/>
                  </FormControl>
                  <FormDescription>This will help us suggest relevant tags for you.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artistIntent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">The story behind this piece (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is the story or message behind your content?" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel className="text-lg font-semibold">Tags</FormLabel>
                <FormDescription>
                    Add relevant tags to help your content get discovered. Press Enter to add a tag.
                </FormDescription>
                <div className="flex items-center gap-2 pt-2">
                    <FormControl>
                      <Input 
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleAddTagFromInput}
                      />
                    </FormControl>
                    <Button type="button" onClick={handleSuggest} disabled={isSuggesting}>
                        {isSuggesting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Suggest</span>
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
                    {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-base py-1 pl-3 pr-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 rounded-full hover:bg-background/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                    ))}
                </div>
                <div className="pt-4 space-y-4">
                  {Object.entries(suggestedTagCategories).map(([category, suggested]) => (
                      <div key={category}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                              {suggested
                                  .filter(tag => !tags.includes(tag.toLowerCase()))
                                  .map(tag => (
                                      <Badge 
                                          key={tag} 
                                          variant="outline"
                                          className="cursor-pointer hover:bg-muted"
                                          onClick={() => addTag(tag)}
                                          tabIndex={0}
                                          onKeyDown={(e) => e.key === 'Enter' && addTag(tag)}
                                      >
                                          {tag}
                                      </Badge>
                                  ))
                              }
                          </div>
                      </div>
                  ))}
                </div>
            </FormItem>
            {contentPurpose === 'sale' && (
              <FormField
                control={form.control}
                name="aiAssistance"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">AI Transparency</FormLabel>
                    <FormDescription>
                      Declare if this artwork was created with the assistance of AI. Use of AI or digital technologies in the ideation and conceptualization phase is not required to be labeled, only when it has been used in the creation process.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                      >
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="traditional" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">Traditional</FormLabel>
                              <FormDescription>
                                  No use of generative AI or digital technology to produce this work.
                              </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="digital" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">Digital</FormLabel>
                              <FormDescription>
                                  Created using digital tools (e.g. tablet, software) without generative AI.
                              </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="ai-assisted" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">AI-Assisted</FormLabel>
                              <FormDescription>
                                  Digital technologies and AI were used for some elements of the creation of this piece.
                              </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="ai-generated" />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">AI-Generated</FormLabel>
                              <FormDescription>
                                This work was produced entirely by generative AI.
                              </FormDescription>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        <div className="flex justify-end">
            <Button variant="gradient" type="submit" size="lg" className="font-semibold">Upload Content</Button>
        </div>
      </form>
    </Form>
  );
}

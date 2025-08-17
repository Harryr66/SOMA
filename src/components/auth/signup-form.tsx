
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "../ui/separator";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { type Artist } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  handle: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      handle: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Note: A robust handle uniqueness check should query a dedicated 'handles' collection.
      // This implementation is simplified for the prototype.
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: values.name,
      });

      // Create user document in Firestore
      const newUser: Artist = {
        id: user.uid,
        name: values.name,
        handle: values.handle,
        avatarUrl: user.photoURL || undefined,
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      
      // The local profile is for non-critical data or quick access, but Firestore is the source of truth.
      const profileData = {
          handle: values.handle,
          displayName: values.name,
          bio1: '',
          bio2: '',
          bio3: '',
          bio4: '',
          website: '',
          artistType: '',
      };
      localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(profileData));

      toast({
        title: "Account Created!",
        description: "Welcome! We're redirecting you to your feed.",
      });
      router.push("/feed");

    } catch (error: any) {
      console.error("Sign up error", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another account.";
      } else if (error.message.includes('permission-denied')) {
        errorMessage = "Permission denied. Please check your Firestore security rules to allow user creation.";
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if a user document already exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // This is a new user signing up with Google
            const handle = user.email?.split('@')[0] || `user${Date.now()}`;
            
            const newUser: Artist = {
              id: user.uid,
              name: user.displayName || "Google User",
              handle: handle,
              avatarUrl: user.photoURL || undefined,
            };
            await setDoc(userDocRef, newUser);

            const profileData = {
                handle,
                displayName: user.displayName,
                 bio1: '', bio2: '', bio3: '', bio4: '', website: '', artistType: '',
            };
            localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(profileData));
        }


        toast({
            title: "Sign In Successful!",
            description: "Welcome! Redirecting you to your feed.",
        });
        router.push("/feed");
    } catch (error: any) {
        console.error("Google Sign-in error", error);
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: error.message || "An unknown error occurred. Please try again.",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Elena Vance" {...field} />
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
                <Input placeholder="elena_vance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="gradient" type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
        <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
        </div>
         <Button variant="gradient" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up with Google
        </Button>
      </form>
    </Form>
  );
}

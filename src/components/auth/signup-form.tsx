
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
      // Check if username is already taken
      const userDoc = await getDoc(doc(db, 'users', values.handle));
      if (userDoc.exists()) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: values.name,
      });

      // Create user document in Firestore
      const userData: Artist = {
        id: user.uid,
        displayName: values.name,
        handle: values.handle,
        email: values.email,
        avatarUrl: user.photoURL || null,
        bio: "",
        location: "",
        website: "",
        isProfessional: false,
        followers: [],
        following: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', values.handle), userData);
      await setDoc(doc(db, 'userProfiles', user.uid), userData);

      console.log('User created:', user);
      
      toast({
        title: "Account Created!",
        description: `Welcome to SOMA, ${values.name}! Your account has been created successfully.`,
      });
      
      // Redirect to feed
      router.push('/feed');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = "An error occurred during signup. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
        // Real Google authentication
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        const user = result.user;
        console.log('User signed up with Google:', user);

        // Generate a unique handle from email
        const emailPrefix = user.email?.split('@')[0] || 'user';
        const baseHandle = emailPrefix.replace(/[^a-zA-Z0-9]/g, '');
        let handle = baseHandle;
        let counter = 1;

        // Check if handle is available, if not add numbers
        while (true) {
          const userDoc = await getDoc(doc(db, 'users', handle));
          if (!userDoc.exists()) break;
          handle = `${baseHandle}${counter}`;
          counter++;
        }

        // Create user document in Firestore
        const userData: Artist = {
          id: user.uid,
          displayName: user.displayName || 'User',
          handle: handle,
          email: user.email || '',
          avatarUrl: user.photoURL || null,
          bio: "",
          location: "",
          website: "",
          isProfessional: false,
          followers: [],
          following: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', handle), userData);
        await setDoc(doc(db, 'userProfiles', user.uid), userData);
        
        toast({
            title: "Google Signup Successful!",
            description: `Welcome to SOMA, ${user.displayName || user.email}! Your account has been created successfully.`,
        });
        
        // Redirect to feed
        router.push('/feed');
        
    } catch (error: any) {
        console.error('Google signup error:', error);
        
        let errorMessage = "An error occurred during Google signup. Please try again.";
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-up was cancelled. Please try again.";
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = "Popup was blocked. Please allow popups and try again.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account already exists with this email using a different sign-in method.";
        }
        
        toast({
            title: "Google Signup Failed",
            description: errorMessage,
            variant: "destructive",
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

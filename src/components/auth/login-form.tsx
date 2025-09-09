
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "../ui/separator";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "Username or email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Real Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        values.usernameOrEmail, 
        values.password
      );
      
      const user = userCredential.user;
      console.log('User signed in:', user);
      
      toast({
        title: "Login Successful!",
        description: `Welcome back to SOMA, ${user.displayName || user.email}!`,
      });
      
      // Redirect to feed
      router.push('/feed');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "An error occurred during login. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toast({
        title: "Login Failed",
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
        console.log('User signed in with Google:', user);
        
        toast({
            title: "Google Sign-in Successful!",
            description: `Welcome back to SOMA, ${user.displayName || user.email}!`,
        });
        
        // Redirect to feed
        router.push('/feed');
        
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        
        let errorMessage = "An error occurred during Google sign-in. Please try again.";
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in was cancelled. Please try again.";
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = "Popup was blocked. Please allow popups and try again.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account already exists with this email using a different sign-in method.";
        }
        
        toast({
            title: "Google Sign-in Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="usernameOrEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username or Email</FormLabel>
              <FormControl>
                <Input placeholder="elena_vance or you@example.com" {...field} />
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
              <div className="flex justify-between items-baseline">
                <FormLabel>Password</FormLabel>
                <Button variant="link" type="button" className="p-0 h-auto text-xs text-foreground">Forgot password?</Button>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="gradient" type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
        <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
        </div>
        <Button variant="gradient" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Google
        </Button>
      </form>
    </Form>
  );
}

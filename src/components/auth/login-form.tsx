
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

    let email = values.usernameOrEmail;
    const isEmail = email.includes('@');

    if (!isEmail) {
        const handle = email.replace(/^@/, ''); // Remove '@' if user typed it
        const emails = JSON.parse(localStorage.getItem('soma-user-emails') || '{}');
        const storedEmail = emails[handle];

        if (!storedEmail) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid credentials. Please check your username and password.",
            });
            setIsLoading(false);
            return;
        }
        email = storedEmail;
    }

    try {
      await signInWithEmailAndPassword(auth, email, values.password);
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting you to your feed.",
      });
      router.push("/feed");
    } catch (error: any) {
      console.error("Login error", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/api-key-not-valid':
          errorMessage = "Invalid Firebase API Key. Please check your .env file and ensure you have entered the correct credentials from your Firebase project settings.";
          break;
        case 'auth/configuration-not-found':
          errorMessage = "Email/Password sign-in is not enabled for this project. Please enable it in the Firebase Console under Authentication > Sign-in method.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Invalid credentials. Please check your email and password and try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address you entered is not valid.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This user account has been disabled.";
          break;
        default:
          errorMessage = error.message || "An unknown error occurred. Please check your Firebase configuration and network connection.";
          break;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
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

        // Check if the user is new
        const isNewUser = !localStorage.getItem(`userProfile-${user.uid}`);
        if (isNewUser) {
            // For new Google users, we need to create a profile and handle
            const handle = user.email?.split('@')[0] || `user${Date.now()}`;
            
            const usernames = JSON.parse(localStorage.getItem('soma-usernames') || '{}');
            usernames[handle] = user.uid;
            localStorage.setItem('soma-usernames', JSON.stringify(usernames));

            const emails = JSON.parse(localStorage.getItem('soma-user-emails') || '{}');
            emails[handle] = user.email;
            localStorage.setItem('soma-user-emails', JSON.stringify(emails));

            const profileData = {
                handle,
                bio1: '',
                bio2: '',
                bio3: '',
                bio4: '',
                website: '',
                artistType: '',
                displayName: user.displayName,
            };
            localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(profileData));
        }

        toast({
            title: "Login Successful!",
            description: "Welcome back! Redirecting you to your feed.",
        });
        router.push("/feed");
    } catch (error: any) {
        console.error("Google Sign-in error", error);
        let errorMessage = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/unauthorized-domain') {
          errorMessage = "This domain is not authorized for Google Sign-In. Please add your development domain to the list of authorized domains in your Firebase project's Authentication settings.";
        } else {
          errorMessage = error.message || "An unknown error occurred. Please try again.";
        }
        toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: errorMessage,
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

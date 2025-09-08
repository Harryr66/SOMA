
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
      // DEMO MODE: Simulate successful login
      console.log('Demo login with values:', values);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Login Successful! (Demo Mode)",
        description: "Welcome back to SOMA! This is a demo - no real authentication.",
      });
      
      // Redirect to dashboard in demo mode
      router.push('/feed');
      
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo Error",
        description: "This is demo mode - no real authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
        // DEMO MODE: Simulate Google sign-in
        console.log('Demo Google sign-in');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: "Google Sign-in Successful! (Demo Mode)",
            description: "Welcome back to SOMA! This is a demo - no real Google authentication.",
        });
        
        // Redirect to dashboard in demo mode
        router.push('/dashboard');
        
    } catch (error) {
        console.error('Demo Google sign-in error:', error);
        toast({
            title: "Demo Error",
            description: "This is demo mode - no real Google authentication.",
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

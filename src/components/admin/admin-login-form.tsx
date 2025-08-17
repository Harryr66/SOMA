'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';

const adminLoginFormSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

const ADMIN_PASSWORD = 'Love$exdreams427794';

interface AdminLoginFormProps {
  onSuccess: () => void;
}

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof adminLoginFormSchema>>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: { password: '' },
  });

  function onSubmit(values: z.infer<typeof adminLoginFormSchema>) {
    setIsLoading(true);
    if (values.password === ADMIN_PASSWORD) {
      toast({
        title: 'Access Granted',
        description: 'Welcome to the Admin Dashboard.',
      });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isAdmin', 'true');
      }
      onSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Incorrect password.',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-20rem)] items-center justify-center">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="font-headline text-2xl mt-4">Admin Access Required</CardTitle>
                <CardDescription>Please enter the password to view the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Unlock Dashboard
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

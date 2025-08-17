
'use client';

import { UploadForm } from '@/components/upload-form';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function UploadPage() {
  const { isProfessional, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isProfessional) {
      toast({
        variant: 'destructive',
        title: 'Artist Account Required',
        description:
          'You need a professional artist account to upload content. You can enable it in your settings.',
      });
      router.replace('/settings');
    }
  }, [isProfessional, loading, router, toast]);

  if (loading || !isProfessional) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">
          Upload your content
        </h1>
        <p className="text-muted-foreground text-lg">
          Share your artwork, videos, or updates with the SOMA community.
        </p>
      </header>
      <UploadForm />
    </div>
  );
}

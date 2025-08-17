
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function RootPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center text-center py-24 md:py-32">
          <h1 className="text-5xl md:text-7xl font-headline tracking-tighter dark:text-white">
            Welcome to SOMA
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Connect with artists worldwide on SOMA, discover unique artworks, and be part of the creative journey from studio to collection.
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button asChild variant="gradient" size="lg">
              <Link href="/login?tab=signup">Create a Free Account</Link>
            </Button>
            <Button asChild variant="gradient" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import { ArtworkCard } from '@/components/artwork-card';
import { artworkData } from '@/lib/data';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  // Mock data for saved posts
  const savedPosts = artworkData.slice(5, 9);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Saved Posts</h1>
        <p className="text-muted-foreground text-lg">Your collection of saved and inspirational artwork.</p>
      </header>

      {savedPosts.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {savedPosts.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="font-headline text-2xl mt-4">No Saved Posts Yet</h3>
          <p className="text-muted-foreground mt-1">Click the bookmark icon on a post to save it for later.</p>
        </div>
      )}
    </div>
  );
}

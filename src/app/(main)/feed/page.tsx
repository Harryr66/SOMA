// This is the main page for your application's feed.

// We import the ArtPost component we created earlier.
import { ArtPost } from '@/components/art-post';

// This is "mock" or "fake" data. We are using it to build the UI
// while we bypass the broken sign-up flow. Later, this data will
// come from your Firestore database.
const mockArtworks = [
  {
    id: '1',
    authorName: 'Elena Vance',
    authorHandle: 'elena_vance',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=elena',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2845&auto=format&fit=crop',
    title: 'Ceramic Dreams',
    caption: 'Exploring the flow of color and form. This piece was a journey.',
    likeCount: 142,
    commentCount: 18,
  },
  {
    id: '2',
    authorName: 'Marcus Cole',
    authorHandle: 'mcole_art',
    authorAvatarUrl: 'https://i.pravatar.cc/150?u=marcus',
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2940&auto=format&fit=crop',
    title: 'Studio Sunlight',
    caption: 'The way the light hit the canvas this morning was too perfect not to capture.',
    likeCount: 88,
    commentCount: 12,
  },
];

// This is the main Feed Page component.
export default function FeedPage() {
  return (
    <main className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-4">Feed</h1>
      <div>
        {/* We "map" over our mock data, creating an ArtPost for each item. */}
        {mockArtworks.map((artwork) => (
          <ArtPost key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </main>
  );
}

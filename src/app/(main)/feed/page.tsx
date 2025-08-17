// This is the main page for your application's feed.

// We import the ArtPost component we created earlier.
import { ArtPost } from '@/components/art-post';
import { type Post } from '@/lib/types';

// This is "mock" or "fake" data. We are using it to build the UI
// while we bypass the broken sign-up flow. Later, this data will
// come from your Firestore database.
const mockArtworks: Post[] = [
  {
    id: '1',
    artworkId: '1',
    artist: {
      id: 'elena',
      name: 'Elena Vance',
      handle: 'elena_vance',
      avatarUrl: 'https://i.pravatar.cc/150?u=elena'
    },
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2845&auto=format&fit=crop',
    imageAiHint: '',
    caption: 'Exploring the flow of color and form. This piece was a journey.',
    likes: 142,
    commentsCount: 18,
    timestamp: '2 hours ago',
    createdAt: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: '2',
    artworkId: '2',
    artist: {
      id: 'marcus',
      name: 'Marcus Cole',
      handle: 'mcole_art',
      avatarUrl: 'https://i.pravatar.cc/150?u=marcus'
    },
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2940&auto=format&fit=crop',
    imageAiHint: '',
    caption: 'The way the light hit the canvas this morning was too perfect not to capture.',
    likes: 88,
    commentsCount: 12,
    timestamp: '4 hours ago',
    createdAt: Date.now() - 14400000, // 4 hours ago
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
          <ArtPost key={artwork.id} post={artwork} />
        ))}
      </div>
    </main>
  );
}

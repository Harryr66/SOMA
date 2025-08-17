
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ArtistCard } from '@/components/artist-card';
import { type Artist } from '@/lib/types';
import { Search as SearchIcon, Users } from 'lucide-react';
import { artists as initialArtists } from '@/lib/data';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [allUsers, setAllUsers] = useState<Artist[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();

    // Load stored users and merge with initial static data for a more robust prototype experience.
    const storedUsersRaw = localStorage.getItem('soma-all-users');
    const storedUsers: Artist[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    const combinedUsers = [...initialArtists];
    const userMap = new Map(combinedUsers.map(u => [u.id, u]));

    // Add users from localStorage that are not in the initial static list
    for (const storedUser of storedUsers) {
        if (!userMap.has(storedUser.id)) {
            combinedUsers.push(storedUser);
            userMap.set(storedUser.id, storedUser);
        }
    }
    
    setAllUsers(combinedUsers);
    
    // Save the cleaned, merged list back to localStorage to keep it consistent.
    localStorage.setItem('soma-all-users', JSON.stringify(combinedUsers));

  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allUsers.filter(
      artist =>
        artist.name.toLowerCase().includes(lowercasedQuery) ||
        artist.handle.toLowerCase().includes(lowercasedQuery)
    );
    setSearchResults(results);
  }, [searchQuery, allUsers]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Search</h1>
        <p className="text-muted-foreground text-lg">
          Find artists, creators, and friends.
        </p>
      </header>

      <div className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search for artists by name or handle..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <section>
        {searchQuery.trim() !== '' ? (
          <>
            <h2 className="font-headline text-2xl font-semibold mb-4">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card rounded-lg border border-dashed flex flex-col items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-headline text-xl text-card-foreground">No Artists Found</h3>
                <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">Try a different search term.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center justify-center">
             <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
             <h3 className="font-headline text-xl text-card-foreground">Search for a Creator</h3>
             <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">Use the search bar above to find and connect with other users.</p>
          </div>
        )}
      </section>
    </div>
  );
}

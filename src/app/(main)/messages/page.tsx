
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { connections } from '@/lib/data';
import { Send } from 'lucide-react';

export default function SharePage() {
  // For demonstration, we'll assume the user has no active conversations yet.
  const hasMessages = false; 

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Share</h1>
        <p className="text-muted-foreground text-lg">Share artwork and messages with your connections.</p>
      </header>
       
      {hasMessages ? (
         <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            {/* This part would render the list of active conversations */}
            <h3 className="font-headline text-2xl text-card-foreground">Your conversations</h3>
        </div>
      ) : (
        <div className="text-center py-10 bg-card rounded-lg border">
            <Send className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-headline text-2xl text-card-foreground">Start Sharing</h3>
            <p className="text-muted-foreground mt-2 mb-6">Share your favourite art and new discoveries with your network.</p>
            <div className="max-w-md mx-auto space-y-3">
              {connections.map((artist) => (
                <Card key={artist.id} className="text-left hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                          <AvatarImage src={artist.avatarUrl || 'https://placehold.co/48x48.png'} alt={artist.name} data-ai-hint="artist portrait" />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-semibold">{artist.name}</p>
                          <p className="text-sm text-muted-foreground">{artist.handle}</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      <Send className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      )}
    </div>
  );
}

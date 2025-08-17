
export default function ArtistsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Artists</h1>
        <p className="text-muted-foreground text-lg">Discover talented artists from our community.</p>
      </header>
       <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="font-headline text-2xl text-card-foreground">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">We're curating a list of amazing artists for you to explore.</p>
        </div>
    </div>
  );
}

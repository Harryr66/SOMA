import { Gavel } from "lucide-react";

export default function AuctionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Auctions</h1>
        <p className="text-muted-foreground text-lg">Bid on exclusive artwork from top artists.</p>
      </header>
       <div className="text-center py-20 bg-card rounded-lg border border-dashed flex flex-col items-center">
            <Gavel className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-6 font-headline text-3xl font-semibold text-card-foreground">The Auction House is Being Built</h3>
            <p className="mt-3 max-w-md mx-auto text-muted-foreground">
              We're crafting an exciting new space for you to discover and bid on unique artworks. Get ready for the thrill of the auction. Check back soon for updates!
            </p>
        </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-2">Notifications</h1>
        <p className="text-muted-foreground text-lg">Your recent activity will appear here.</p>
      </header>
       <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="font-headline text-2xl text-card-foreground">No New Notifications</h3>
            <p className="text-muted-foreground mt-2">Check back later for updates.</p>
        </div>
    </div>
  );
}

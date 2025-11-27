import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">Book Art</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore books through art. A visual journey through stories.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Book Art
          </p>
        </div>
      </div>
    </footer>
  );
}

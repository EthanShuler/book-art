import { Link } from "react-router";
import { BookOpen, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function meta() {
  return [
    { title: "Book Art - Visual Stories" },
    { name: "description", content: "Explore books through art. A visual journey through your favorite stories." },
  ];
}

export default function Home() {
  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Admin Actions */}
      {isAdmin && (
        <section className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Admin:</span>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/series/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Series
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/books/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Book
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              <span>Visual storytelling for book lovers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Experience Books Through{" "}
              <span className="text-primary">Art</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover stunning artwork organized by chapter. Follow along visually as you read your favorite books.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/books">
                  Browse Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/search">Search Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

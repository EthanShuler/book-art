import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MediaCard } from "@/components/media-card";
import { EmptyState } from "@/components/empty-state";
import type { Book } from "@/lib/api";

interface BooksListProps {
  books: Book[];
  seriesId?: string;
  isAdmin?: boolean;
  showDescription?: boolean;
  emptyMessage?: string;
}

export function BooksList({
  books,
  seriesId,
  isAdmin = false,
  showDescription = false,
  emptyMessage = "No books available yet.",
}: BooksListProps) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button asChild variant="outline">
          <Link to={`/admin/books/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Link>
        </Button>
      )}
      {books.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <MediaCard
              key={book.id}
              to={`/books/${book.id}`}
              imageUrl={book.coverImageUrl}
              title={book.title}
              subtitle={book.author}
              description={book.description}
              showDescription={showDescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}

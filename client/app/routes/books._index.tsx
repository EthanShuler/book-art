import { useLoaderData } from "react-router";
import { booksApi } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BooksList } from "@/components/books-list";
import { useAuth } from '@/lib/auth';

export function meta() {
  return [
    { title: "Books - Book Art" },
    { name: "description", content: "Browse all books with curated artwork" },
  ];
}

export async function loader() {
  try {
    const data = await booksApi.getAll();
    return { books: data.books, error: null };
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return { books: [], error: "Failed to load books" };
  }
}

export default function Books() {
  const { isAdmin } = useAuth();
  const { books, error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Books</h1>
        <p className="text-muted-foreground">
          Explore our collection of books with curated artwork
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <BooksList books={books} isAdmin={true} showDescription emptyMessage="No books available yet. Check back soon for new content!" />
    </div>
  );
}

export function BooksLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-full overflow-hidden">
            <Skeleton className="aspect-2/3" />
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

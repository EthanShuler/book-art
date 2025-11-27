import { Link, useLoaderData } from "react-router";
import { booksApi, type Book } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

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

      {books.length === 0 && !error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No books available yet.</p>
          <p className="text-sm text-muted-foreground">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <Link to={`/books/${book.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="aspect-2/3 relative bg-muted overflow-hidden">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
              <span className="text-6xl">📚</span>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1">{book.title}</CardTitle>
          <CardDescription className="line-clamp-1">
            by {book.author || "Unknown Author"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {book.description || "No description available."}
          </p>
        </CardContent>
      </Card>
    </Link>
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

import { useState } from "react";
import { Link, useNavigate, useLoaderData } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookForm, type BookFormData } from "@/components/book-form";
import { getAuthToken } from "@/lib/auth";
import { booksApi } from "@/lib/api";
import type { Route } from "./+types/admin.books.$bookId.edit";

export function meta() {
  return [{ title: "Edit Book - Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const bookId = params.bookId;
  
  try {
    const bookData = await booksApi.getById(bookId);
    return { book: bookData.book, error: null };
  } catch (error) {
    console.error("Failed to fetch book:", error);
    return { book: null, error: "Failed to load book" };
  }
}

export default function AdminBookEdit() {
  const { book } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BookFormData) => {
    setErr(null);
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      setErr("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await booksApi.update({ id: book?.id || '', ...data }, token);
      navigate(`/books/${result.book.id}`);
    } catch (err) {
      setErr(err instanceof Error ? err.message : "Failed to update book");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Book</CardTitle>
          <CardDescription>
            Update {book?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookForm
            initialData={{
              title: book?.title,
              author: book?.author,
              description: book?.description,
              coverImageUrl: book?.coverImageUrl
            }}
            onSubmit={handleSubmit}
            submitLabel="Create Book"
            cancelUrl="/"
            isSubmitting={isSubmitting}
            error={err}
          />
        </CardContent>
      </Card>
    </div>
  );
}

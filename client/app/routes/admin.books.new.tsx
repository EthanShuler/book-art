import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookForm, type BookFormData } from "@/components/book-form";
import { getAuthToken } from "@/lib/auth";
import { booksApi } from "@/lib/api";

export function meta() {
  return [{ title: "Create Book - Admin" }];
}

export default function AdminBooksNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesId = searchParams.get("seriesId") || undefined;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BookFormData) => {
    setError(null);
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await booksApi.create(data, token);
      navigate(`/books/${result.book.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create book");
      setIsSubmitting(false);
    }
  };

  // Determine back link based on whether we came from a series
  const backUrl = seriesId ? `/series/${seriesId}` : "/";
  const backLabel = seriesId ? "Back to Series" : "Back to Home";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={backUrl}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Book</CardTitle>
          <CardDescription>
            Add a new book to a series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookForm
            initialData={{ seriesId }}
            onSubmit={handleSubmit}
            submitLabel="Create Book"
            cancelUrl={backUrl}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

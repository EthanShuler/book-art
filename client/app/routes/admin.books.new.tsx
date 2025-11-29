import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthToken } from "@/lib/auth";
import { booksApi } from '@/lib/api';

export function meta() {
  return [{ title: "Create Book - Admin" }];
}

export default function AdminBooksNew() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const seriesId = formData.get("seriesId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;

    if (!seriesId?.trim()) {
      setError("Series is required");
      setIsSubmitting(false);
      return;
    }

    if (!title?.trim()) {
      setError("Book name is required");
      setIsSubmitting(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await booksApi.create(
        {
          seriesId: seriesId.trim(),
          title: title.trim(),
          description: description?.trim() || undefined,
          coverImageUrl: coverImageUrl?.trim() || undefined,
        },
        token
      );
      navigate(`/books/${result.book.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Book");
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
          <CardTitle>Create New Book</CardTitle>
          <CardDescription>
            Add a new book to a series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="seriesId" className="text-sm font-medium">
                Series
              </label>
              <select
                id="seriesId"
                name="seriesId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a series...</option>
                {/* TODO: Load series from API */}
                <option value="44a109f2-c9c3-486d-9ae1-04f840da6bfa">The Lord of the Rings</option>
                <option value="series-2">Harry Potter</option>
                <option value="series-3">A Song of Ice and Fire</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Book Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., The Fellowship of the Ring"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">
                Author
              </label>
              <Input
                id="author"
                name="author"
                placeholder="e.g., J.R.R. Tolkien"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="A brief description of the book..."
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="coverImageUrl" className="text-sm font-medium">
                Cover Image URL
              </label>
              <Input
                id="coverImageUrl"
                name="coverImageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>Create Book</Button>
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                <Link to="/">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

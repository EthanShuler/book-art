import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { seriesApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export function meta() {
  return [{ title: "Create Series - Admin" }];
}

export default function AdminSeriesNew() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;

    if (!title?.trim()) {
      setError("Series name is required");
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
      const result = await seriesApi.create(
        {
          title: title.trim(),
          description: description?.trim() || undefined,
          coverImageUrl: coverImageUrl?.trim() || undefined,
        },
        token
      );
      navigate(`/series/${result.series.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create series");
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
          <CardTitle>Create New Series</CardTitle>
          <CardDescription>
            A series is a collection of related books (e.g., "The Lord of the Rings")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Series Name
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., The Lord of the Rings"
                required
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
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                placeholder="A brief description of the series..."
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Series"}
              </Button>
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

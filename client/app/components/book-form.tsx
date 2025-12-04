import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seriesApi, type Series, type Book } from "@/lib/api";

export interface BookFormData {
  seriesId: string;
  title: string;
  author?: string;
  description?: string;
  coverImageUrl?: string;
}

interface BookFormProps {
  /** Initial values for editing an existing book */
  initialData?: Partial<Book> & { seriesId?: string };
  /** Called when the form is submitted with valid data */
  onSubmit: (data: BookFormData) => Promise<void>;
  /** Text for the submit button */
  submitLabel?: string;
  /** URL to navigate to on cancel */
  cancelUrl?: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string | null;
}

export function BookForm({
  initialData,
  onSubmit,
  submitLabel = "Save Book",
  cancelUrl = "/",
  isSubmitting = false,
  error: externalError,
}: BookFormProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialData?.seriesId || "");
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const error = externalError || internalError;

  useEffect(() => {
    async function fetchSeries() {
      try {
        const result = await seriesApi.getAll();
        setSeriesList(result.series);
      } catch (err) {
        console.error("Failed to fetch series:", err);
      }
    }
    fetchSeries();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInternalError(null);

    const formData = new FormData(e.currentTarget);
    const seriesId = formData.get("seriesId") as string;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;

    if (!seriesId?.trim()) {
      setInternalError("Series is required");
      return;
    }

    if (!title?.trim()) {
      setInternalError("Book title is required");
      return;
    }

    await onSubmit({
      seriesId: seriesId.trim(),
      title: title.trim(),
      author: author?.trim() || undefined,
      description: description?.trim() || undefined,
      coverImageUrl: coverImageUrl?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="seriesId" className="text-sm font-medium">
          Series
        </label>
        <select
          id="seriesId"
          name="seriesId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          required
          disabled={isSubmitting}
          value={selectedSeriesId}
          onChange={(e) => setSelectedSeriesId(e.target.value)}
        >
          <option value="">Select a series...</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id}>
              {series.title}
            </option>
          ))}
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
          defaultValue={initialData?.title || ""}
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
          defaultValue={initialData?.author || ""}
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
          placeholder="A brief description of the book..."
          disabled={isSubmitting}
          defaultValue={initialData?.description || ""}
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
          defaultValue={initialData?.coverImageUrl || ""}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link to={cancelUrl}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seriesApi, type Series, type Book, type Location } from "@/lib/api";

export interface LocationFormData {
  seriesId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bookIds?: string[];
}

interface LocationFormProps {
  /** Initial values for editing an existing location */
  initialData?: Partial<Location> & { bookIds?: string[] };
  /** Called when the form is submitted with valid data */
  onSubmit: (data: LocationFormData) => Promise<void>;
  /** Text for the submit button */
  submitLabel?: string;
  /** URL to navigate to on cancel */
  cancelUrl?: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string | null;
}

export function LocationForm({
  initialData,
  onSubmit,
  submitLabel = "Save Location",
  cancelUrl = "/",
  isSubmitting = false,
  error: externalError,
}: LocationFormProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialData?.seriesId || "");
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(initialData?.bookIds || []);
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const error = externalError || internalError;

  // Fetch all series on mount
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

  // Fetch books when series changes
  useEffect(() => {
    async function fetchBooks() {
      if (!selectedSeriesId) {
        setBooksList([]);
        return;
      }
      try {
        const result = await seriesApi.getBooks(selectedSeriesId);
        setBooksList(result.books);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        setBooksList([]);
      }
    }
    fetchBooks();
  }, [selectedSeriesId]);

  const handleSeriesChange = (newSeriesId: string) => {
    setSelectedSeriesId(newSeriesId);
    // Clear selected books when series changes (unless editing)
    if (!initialData?.seriesId || newSeriesId !== initialData.seriesId) {
      setSelectedBookIds([]);
    }
  };

  const handleBookToggle = (bookId: string) => {
    setSelectedBookIds(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInternalError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!selectedSeriesId?.trim()) {
      setInternalError("Series is required");
      return;
    }

    if (!name?.trim()) {
      setInternalError("Location name is required");
      return;
    }

    await onSubmit({
      seriesId: selectedSeriesId.trim(),
      name: name.trim(),
      description: description?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      bookIds: selectedBookIds.length > 0 ? selectedBookIds : undefined,
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
          disabled={isSubmitting || !!initialData?.seriesId}
          value={selectedSeriesId}
          onChange={(e) => handleSeriesChange(e.target.value)}
        >
          <option value="">Select a series...</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id}>
              {series.title}
            </option>
          ))}
        </select>
        {initialData?.seriesId && (
          <p className="text-xs text-muted-foreground">Series cannot be changed after creation</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Location Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., The Shire"
          required
          disabled={isSubmitting}
          defaultValue={initialData?.name || ""}
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
          placeholder="A brief description of the location..."
          disabled={isSubmitting}
          defaultValue={initialData?.description || ""}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          Image URL
        </label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
          defaultValue={initialData?.imageUrl || ""}
        />
      </div>

      {selectedSeriesId && booksList.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Appears in Books
          </label>
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {booksList.map((book) => (
              <label key={book.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBookIds.includes(book.id)}
                  onChange={() => handleBookToggle(book.id)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">{book.title}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select which books this location appears in
          </p>
        </div>
      )}

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

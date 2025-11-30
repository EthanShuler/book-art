import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Series } from "@/lib/api";

export interface SeriesFormData {
  title: string;
  author?: string;
  description?: string;
  coverImageUrl?: string;
}

interface SeriesFormProps {
  /** Initial values for editing an existing series */
  initialData?: Partial<Series>;
  /** Called when the form is submitted with valid data */
  onSubmit: (data: SeriesFormData) => Promise<void>;
  /** Text for the submit button */
  submitLabel?: string;
  /** URL to navigate to on cancel */
  cancelUrl?: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string | null;
}

export function SeriesForm({
  initialData,
  onSubmit,
  submitLabel = "Save Series",
  cancelUrl = "/",
  isSubmitting = false,
  error,
}: SeriesFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;

    if (!title?.trim()) {
      return;
    }

    await onSubmit({
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
        <label htmlFor="title" className="text-sm font-medium">
          Series Name
        </label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., The Lord of the Rings"
          defaultValue={initialData?.title || ""}
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
          defaultValue={initialData?.author || ""}
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
          defaultValue={initialData?.description || ""}
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
          defaultValue={initialData?.coverImageUrl || ""}
          disabled={isSubmitting}
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

import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Route } from "./+types/admin.books.$bookId.chapters.new";

export function meta() {
  return [{ title: "Add Chapter - Admin" }];
}

export default function AdminChaptersNew({ params }: Route.ComponentProps) {
  const { bookId } = params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={`/books/${bookId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Chapter</CardTitle>
          <CardDescription>
            Add a new chapter to this book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="chapterNumber" className="text-sm font-medium">
                Chapter Number
              </label>
              <Input
                id="chapterNumber"
                type="number"
                min="1"
                placeholder="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Chapter Title
              </label>
              <Input
                id="title"
                placeholder="e.g., A Long-expected Party"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium">
                Summary
              </label>
              <textarea
                id="summary"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="A brief summary of this chapter..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Add Chapter</Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/books/${bookId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

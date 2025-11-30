import { useLoaderData } from "react-router";
import { seriesApi, type Series } from "@/lib/api";
import { BookOpen } from "lucide-react";
import { MediaCard } from "@/components/media-card";

export function meta() {
  return [
    { title: "Series - Book Art" },
    { name: "description", content: "Browse all book series" },
  ];
}

export async function loader() {
  try {
    const data = await seriesApi.getAll();
    return { series: data.series, error: null };
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return { series: [], error: "Failed to load series" };
  }
}

export default function SeriesIndex() {
  const { series, error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Book Series</h1>
        <p className="text-muted-foreground">
          Explore our collection of book series and their artwork
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {series.length === 0 && !error ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No series available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {series.map((s) => (
            <MediaCard
              key={s.id}
              to={`/series/${s.id}`}
              imageUrl={s.coverImageUrl}
              title={s.title}
              subtitle={s.author}
              description={s.description}
              showDescription
            />
          ))}
        </div>
      )}
    </div>
  );
}

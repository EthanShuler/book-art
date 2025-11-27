import { Link, useLoaderData, useSearchParams } from "react-router";
import { artApi, type Art } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Image } from "lucide-react";
import { useState } from "react";
import type { Route } from "./+types/search";

export function meta() {
  return [
    { title: "Search - Book Art" },
    { name: "description", content: "Search for artwork, books, characters, and more" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  
  if (!query) {
    return { results: [], query: "", error: null };
  }
  
  try {
    const data = await artApi.search(query);
    return { results: data.art, query, error: null };
  } catch (error) {
    console.error("Search failed:", error);
    return { results: [], query, error: "Search failed" };
  }
}

export default function SearchPage() {
  const { results, query: initialQuery, error } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Search</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for books, characters, locations, items"
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {initialQuery && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {results.length === 0
              ? `No results found for "${initialQuery}"`
              : `Found ${results.length} result${results.length === 1 ? "" : "s"} for "${initialQuery}"`}
          </p>
        </div>
      )}

      {results.length === 0 && initialQuery ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No artwork found matching your search.</p>
          <p className="text-sm text-muted-foreground">Try different keywords or browse books directly.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/books">Browse Books</Link>
          </Button>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((art: Art) => (
            <Card key={art.id} className="overflow-hidden group">
              <div className="aspect-video relative bg-muted overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title || "Artwork"}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                {art.title && (
                  <p className="font-medium truncate mb-1">{art.title}</p>
                )}
                {art.artist && (
                  <p className="text-sm text-muted-foreground mb-2">by {art.artist}</p>
                )}
                {art.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{art.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !initialQuery ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Enter a search term to find artwork.</p>
        </div>
      ) : null}
    </div>
  );
}

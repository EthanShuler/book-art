import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Library, BookOpen, FileText, Users, MapPin, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchApi, type SearchResultItem, type SearchResults } from "@/lib/api";

export function meta() {
  return [
    { title: "Search - Book Art" },
    { name: "description", content: "Search for series, books, chapters, characters, locations, and items" },
  ];
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; linkPrefix: string; color: string }> = {
  series: { icon: Library, label: "Series", linkPrefix: "/series", color: "bg-purple-100 text-purple-800" },
  book: { icon: BookOpen, label: "Book", linkPrefix: "/books", color: "bg-blue-100 text-blue-800" },
  chapter: { icon: FileText, label: "Chapter", linkPrefix: "/chapters", color: "bg-green-100 text-green-800" },
  character: { icon: Users, label: "Character", linkPrefix: "/characters", color: "bg-orange-100 text-orange-800" },
  location: { icon: MapPin, label: "Location", linkPrefix: "/locations", color: "bg-red-100 text-red-800" },
  item: { icon: Package, label: "Item", linkPrefix: "/items", color: "bg-yellow-100 text-yellow-800" },
};

function ResultCard({ result }: { result: SearchResultItem }) {
  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <Link to={`${config.linkPrefix}/${result.id}`}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="flex gap-4 p-4">
          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {result.imageUrl ? (
              <img
                src={result.imageUrl}
                alt={result.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Icon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={`text-xs ${config.color}`}>
                {config.label}
              </Badge>
              {result.parentName && (
                <span className="text-xs text-muted-foreground truncate">
                  in {result.parentName}
                </span>
              )}
            </div>
            <h3 className="font-medium truncate">{result.name}</h3>
            {result.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {result.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ResultSection({ 
  title, 
  icon: Icon, 
  results, 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  results: SearchResultItem[];
}) {
  if (results.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{results.length}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    setSearchParams({ q: query.trim() });
    
    try {
      const data = await searchApi.search(query.trim());
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search series, books, characters, locations, items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-muted-foreground py-12">
          Searching...
        </div>
      )}

      {!isLoading && results && (
        <>
          <div className="mb-6 text-muted-foreground">
            Found {results.totalCount} result{results.totalCount !== 1 ? "s" : ""} for "{results.query}"
          </div>

          {results.totalCount === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <>
              <ResultSection title="Series" icon={Library} results={results.results.series} />
              <ResultSection title="Books" icon={BookOpen} results={results.results.books} />
              <ResultSection title="Chapters" icon={FileText} results={results.results.chapters} />
              <ResultSection title="Characters" icon={Users} results={results.results.characters} />
              <ResultSection title="Locations" icon={MapPin} results={results.results.locations} />
              <ResultSection title="Items" icon={Package} results={results.results.items} />
            </>
          )}
        </>
      )}

      {!isLoading && !hasSearched && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Search the collection</h2>
          <p className="text-muted-foreground">
            Find series, books, chapters, characters, locations, and items.
          </p>
        </div>
      )}
    </div>
  );
}

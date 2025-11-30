import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { seriesApi, type Series, type Book, type Character, type Location, type Item } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, MapPin, Package } from "lucide-react";
import { useAuth, getAuthToken } from "@/lib/auth";
import { CharactersList } from "@/components/characters-list";
import { LocationsList } from "@/components/locations-list";
import { ItemsList } from "@/components/items-list";
import { BooksList } from "@/components/books-list";
import type { Route } from "./+types/series.$seriesId";

export function meta({ data }: Route.MetaArgs) {
  const series = data?.series;
  return [
    { title: series ? `${series.title} - Book Art` : "Series - Book Art" },
    { name: "description", content: series?.description || "View series details and artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const seriesId = params.seriesId;

  try {
    const [seriesData, booksData, charactersData, locationsData, itemsData] = await Promise.all([
      seriesApi.getById(seriesId),
      seriesApi.getBooks(seriesId),
      seriesApi.getCharacters(seriesId),
      seriesApi.getLocations(seriesId),
      seriesApi.getItems(seriesId),
    ]);

    return {
      series: seriesData.series,
      books: booksData.books,
      characters: charactersData.characters,
      locations: locationsData.locations,
      items: itemsData.items,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return {
      series: null,
      books: [],
      characters: [],
      locations: [],
      items: [],
      error: "Failed to load series details",
    };
  }
}

export default function SeriesDetail() {
  const { series, books, characters, locations, items, error } = useLoaderData<typeof loader>();
  const { isAdmin } = useAuth();
  const token = getAuthToken() || "";
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this series? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await seriesApi.delete({ id: series!.id }, token);
      navigate("/series");
    } catch (err) {
      console.error("Failed to delete series:", err);
      alert(err instanceof Error ? err.message : "Failed to delete series");
      setIsDeleting(false);
    }
  };

  if (error || !series) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Series not found"}
        </div>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/series">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Series
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/series">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Link>
      </Button>

      {/* Series Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-2/3 rounded-lg overflow-hidden bg-muted shadow-lg">
            {series.coverImageUrl ? (
              <img
                src={series.coverImageUrl}
                alt={`Cover of ${series.title}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                <span className="text-8xl">📚</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          {isAdmin && (
            <div className='mb-4 float-right flex gap-2'>
              <Button
              onClick={() => navigate(`/admin/series/${series.id}/edit`)}
              variant="outline"
            >
              Edit Series
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="destructive" 
                className="mb-4 float-right"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Series"}
              </Button>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
          {series.author && (
            <p className="text-xl text-muted-foreground mb-4">by {series.author}</p>
          )}
          <p className="text-muted-foreground mb-6">{series.description || "No description available."}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <BookOpen className="mr-1 h-3 w-3" />
              {books.length} Books
            </Badge>
            <Badge variant="secondary">
              <Users className="mr-1 h-3 w-3" />
              {characters.length} Characters
            </Badge>
            <Badge variant="secondary">
              <MapPin className="mr-1 h-3 w-3" />
              {locations.length} Locations
            </Badge>
            <Badge variant="secondary">
              <Package className="mr-1 h-3 w-3" />
              {items.length} Items
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <BooksList books={books} seriesId={series.id} isAdmin={isAdmin} showDescription emptyMessage="No books in this series yet." />
        </TabsContent>

        <TabsContent value="characters">
          <CharactersList characters={characters} seriesId={series.id} isAdmin={isAdmin} emptyMessage="No characters in this series yet." />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsList locations={locations} seriesId={series.id} isAdmin={isAdmin} squareAspect emptyMessage="No locations in this series yet." />
        </TabsContent>

        <TabsContent value="items">
          <ItemsList items={items} seriesId={series.id} isAdmin={isAdmin} emptyMessage="No items in this series yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

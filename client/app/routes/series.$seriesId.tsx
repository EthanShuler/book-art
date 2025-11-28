import { Link, useLoaderData } from "react-router";
import { seriesApi, type Series, type Book, type Character, type Location, type Item } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, MapPin, Package, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
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
          <BooksList books={books} seriesId={series.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="characters">
          <CharactersList characters={characters} seriesId={series.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsList locations={locations} seriesId={series.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="items">
          <ItemsList items={items} seriesId={series.id} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BooksList({ books, seriesId, isAdmin }: { books: Book[]; seriesId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/books/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Link>
        </Button>
      )}
      {books.length === 0 ? (
        <EmptyState message="No books in this series yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="aspect-2/3 relative bg-muted overflow-hidden">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={`Cover of ${book.title}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
                  {book.author && (
                    <CardDescription>by {book.author}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CharactersList({ characters, seriesId, isAdmin }: { characters: Character[]; seriesId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/characters/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Character
          </Link>
        </Button>
      )}
      {characters.length === 0 ? (
        <EmptyState message="No characters in this series yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {characters.map((character) => (
            <Link key={character.id} to={`/characters/${character.id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {character.imageUrl ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center truncate">{character.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationsList({ locations, seriesId, isAdmin }: { locations: Location[]; seriesId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/locations/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      )}
      {locations.length === 0 ? (
        <EmptyState message="No locations in this series yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {locations.map((location) => (
            <Link key={location.id} to={`/locations/${location.id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {location.imageUrl ? (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center truncate">{location.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemsList({ items, seriesId, isAdmin }: { items: Item[]; seriesId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/items/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      )}
      {items.length === 0 ? (
        <EmptyState message="No items in this series yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center truncate">{item.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

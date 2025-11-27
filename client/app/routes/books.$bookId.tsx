import { Link, useLoaderData, useParams } from "react-router";
import { booksApi, type Book, type Chapter, type Character, type Location, type Item } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, MapPin, Package } from "lucide-react";
import type { Route } from "./+types/books.$bookId";

export function meta({ data }: Route.MetaArgs) {
  const book = data?.book;
  return [
    { title: book ? `${book.title} - Book Art` : "Book - Book Art" },
    { name: "description", content: book?.description || "View book details and artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const bookId = params.bookId;
  
  try {
    const [bookData, chaptersData, charactersData, locationsData, itemsData] = await Promise.all([
      booksApi.getById(bookId),
      booksApi.getChapters(bookId),
      booksApi.getCharacters(bookId),
      booksApi.getLocations(bookId),
      booksApi.getItems(bookId),
    ]);
    
    return {
      book: bookData.book,
      chapters: chaptersData.chapters,
      characters: charactersData.characters,
      locations: locationsData.locations,
      items: itemsData.items,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch book:", error);
    return {
      book: null,
      chapters: [],
      characters: [],
      locations: [],
      items: [],
      error: "Failed to load book details",
    };
  }
}

export default function BookDetail() {
  const { book, chapters, characters, locations, items, error } = useLoaderData<typeof loader>();

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Book not found"}
        </div>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </Button>

      {/* Book Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-2/3 rounded-lg overflow-hidden bg-muted shadow-lg">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">by {book.author || "Unknown Author"}</p>
          <p className="text-muted-foreground mb-6">{book.description || "No description available."}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <BookOpen className="mr-1 h-3 w-3" />
              {chapters.length} Chapters
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
      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters">
          <ChaptersList chapters={chapters} bookId={book.id} />
        </TabsContent>

        <TabsContent value="characters">
          <CharactersList characters={characters} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsList locations={locations} />
        </TabsContent>

        <TabsContent value="items">
          <ItemsList items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChaptersList({ chapters, bookId }: { chapters: Chapter[]; bookId: string }) {
  if (chapters.length === 0) {
    return <EmptyState message="No chapters available yet." />;
  }

  return (
    <div className="space-y-3">
      {chapters
        .sort((a, b) => a.chapterNumber - b.chapterNumber)
        .map((chapter) => (
          <Link key={chapter.id} to={`/chapters/${chapter.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Chapter {chapter.chapterNumber}: {chapter.title}
                    </CardTitle>
                    {chapter.summary && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {chapter.summary}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">View Art</Badge>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
    </div>
  );
}

function CharactersList({ characters }: { characters: Character[] }) {
  if (characters.length === 0) {
    return <EmptyState message="No characters available yet." />;
  }

  return (
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
  );
}

function LocationsList({ locations }: { locations: Location[] }) {
  if (locations.length === 0) {
    return <EmptyState message="No locations available yet." />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {locations.map((location) => (
        <Link key={location.id} to={`/locations/${location.id}`}>
          <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
            <div className="aspect-video relative bg-muted overflow-hidden">
              {location.imageUrl ? (
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
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
  );
}

function ItemsList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <EmptyState message="No items available yet." />;
  }

  return (
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
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLoaderData, useNavigate } from "react-router";
import { booksApi, type Book, type Chapter, type Character, type Location, type Item } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Users, MapPin, Package, Plus } from "lucide-react";
import { useAuth, getAuthToken } from "@/lib/auth";
import { CharactersList } from "@/components/characters-list";
import { LocationsList } from "@/components/locations-list";
import { ItemsList } from "@/components/items-list";
import { EmptyState } from "@/components/empty-state";
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
  const { isAdmin } = useAuth();
  const token = getAuthToken() || "";
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await booksApi.delete({ id: book!.id }, token);
      navigate("/books");
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert(err instanceof Error ? err.message : "Failed to delete book");
      setIsDeleting(false);
    }
  };

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
          {isAdmin && (
            <div className='mb-4 float-right flex gap-2'>
              <Button
              onClick={() => navigate(`/admin/books/${book.id}/edit`)}
              variant="outline"
            >
              Edit Book
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="destructive" 
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Book"}
            </Button>
          </div>
          )}
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
          <ChaptersList chapters={chapters} bookId={book.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="characters">
          <CharactersList characters={characters} emptyMessage="No characters available yet." />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsList locations={locations} emptyMessage="No locations available yet." />
        </TabsContent>

        <TabsContent value="items">
          <ItemsList items={items} emptyMessage="No items available yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChaptersList({ chapters, bookId, isAdmin }: { chapters: Chapter[]; bookId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-3">
      {isAdmin && (
        <Button asChild variant="outline" className="mb-4">
          <Link to={`/admin/books/${bookId}/chapters/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Link>
        </Button>
      )}
      {chapters.length === 0 ? (
        <EmptyState message="No chapters available yet." />
      ) : (
        chapters
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
          ))
      )}
    </div>
  );
}

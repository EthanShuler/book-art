import { Link, useLoaderData } from "react-router";
import { artApi, booksApi, chaptersApi, type Art, type Book, type Chapter } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Image as ImageIcon, User, MapPin, Package } from "lucide-react";
import type { Route } from "./+types/art.$artId";

export function meta({ data }: Route.MetaArgs) {
  const art = data?.art;
  return [
    { title: art?.title ? `${art.title} - Book Art` : "Artwork - Book Art" },
    { name: "description", content: art?.description || "View artwork details" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const artId = params.artId;
  
  try {
    const artData = await artApi.getById(artId);
    
    // Fetch book and chapter info if available
    let book: Book | null = null;
    let chapter: Chapter | null = null;
    
    if (artData.art.bookId) {
      const bookData = await booksApi.getById(artData.art.bookId);
      book = bookData.book;
    }
    
    if (artData.art.chapterId) {
      const chapterData = await chaptersApi.getById(artData.art.chapterId);
      chapter = chapterData.chapter;
    }
    
    return {
      art: artData.art,
      book,
      chapter,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch art:", error);
    return {
      art: null,
      book: null,
      chapter: null,
      error: "Failed to load artwork",
    };
  }
}

export default function ArtDetail() {
  const { art, book, chapter, error } = useLoaderData<typeof loader>();

  if (error || !art) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The requested artwork could not be found."}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasEntities = art.characters?.length || art.locations?.length || art.items?.length;

  return (
    <div className="container py-8 max-w-6xl">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main image */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="bg-muted">
              <img
                src={art.imageUrl}
                alt={art.title || "Artwork"}
                className="w-full h-auto max-h-[85vh] object-contain mx-auto"
              />
            </div>
          </Card>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          {/* Title and description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {art.title || "Untitled Artwork"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {art.description && (
                <p className="text-muted-foreground">{art.description}</p>
              )}
              
              {/* Artist */}
              {art.artist && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Artist:</span>
                  <Badge variant="outline">{art.artist}</Badge>
                </div>
              )}

              {/* Tags */}
              {art.tags && art.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {art.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Book/Chapter info */}
          {(book || chapter) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {book && (
                  <Link to={`/books/${book.id}`} className="block hover:underline">
                    <span className="font-medium">{book.title}</span>
                  </Link>
                )}
                {chapter && (
                  <Link to={`/chapters/${chapter.id}`} className="block text-sm text-muted-foreground hover:underline">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tagged entities */}
          {hasEntities && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Featured In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Characters */}
                {art.characters && art.characters.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Characters</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {art.characters.map((char) => (
                        <Link key={char.id} to={`/characters/${char.id}`}>
                          <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                            {char.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations */}
                {art.locations && art.locations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Locations</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {art.locations.map((loc) => (
                        <Link key={loc.id} to={`/locations/${loc.id}`}>
                          <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                            {loc.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                {art.items && art.items.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Items</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {art.items.map((item) => (
                        <Link key={item.id} to={`/items/${item.id}`}>
                          <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                            {item.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Added: {new Date(art.createdAt).toLocaleDateString()}</p>
                {art.updatedAt !== art.createdAt && (
                  <p>Updated: {new Date(art.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

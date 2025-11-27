import { Link, useLoaderData } from "react-router";
import { chaptersApi, booksApi, type Art, type Chapter } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Image } from "lucide-react";
import type { Route } from "./+types/chapters.$chapterId";

export function meta({ data }: Route.MetaArgs) {
  const chapter = data?.chapter;
  return [
    { title: chapter ? `Chapter ${chapter.chapterNumber}: ${chapter.title} - Book Art` : "Chapter - Book Art" },
    { name: "description", content: chapter?.summary || "View chapter artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const chapterId = params.chapterId;
  
  try {
    const [chapterData, artData] = await Promise.all([
      chaptersApi.getById(chapterId),
      chaptersApi.getArt(chapterId),
    ]);
    
    // Get the book for navigation
    let book = null;
    let allChapters: Chapter[] = [];
    if (chapterData.chapter) {
      const bookData = await booksApi.getById(String(chapterData.chapter.bookId));
      book = bookData.book;
      const chaptersData = await booksApi.getChapters(String(chapterData.chapter.bookId));
      allChapters = chaptersData.chapters;
    }
    
    return {
      chapter: chapterData.chapter,
      art: artData.art,
      book,
      allChapters,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch chapter:", error);
    return {
      chapter: null,
      art: [],
      book: null,
      allChapters: [],
      error: "Failed to load chapter",
    };
  }
}

export default function ChapterDetail() {
  const { chapter, art, book, allChapters, error } = useLoaderData<typeof loader>();

  if (error || !chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Chapter not found"}
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

  // Find previous and next chapters
  const sortedChapters = allChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost">
          <Link to={book ? `/books/${book.id}` : "/books"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {book ? `Back to ${book.title}` : "Back to Books"}
          </Link>
        </Button>
        
        <div className="flex items-center gap-2">
          {prevChapter && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/chapters/${prevChapter.id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Ch. {prevChapter.chapterNumber}
              </Link>
            </Button>
          )}
          {nextChapter && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/chapters/${nextChapter.id}`}>
                Ch. {nextChapter.chapterNumber}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Chapter Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-2">
          Chapter {chapter.chapterNumber}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{chapter.title}</h1>
        {chapter.summary && (
          <p className="text-muted-foreground max-w-3xl">{chapter.summary}</p>
        )}
      </div>

      {/* Art Gallery */}
      {art.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No artwork available for this chapter yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {art
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((piece, index) => (
              <ArtPiece key={piece.id} art={piece} index={index + 1} />
            ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t">
        {prevChapter ? (
          <Button asChild variant="outline">
            <Link to={`/chapters/${prevChapter.id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous: {prevChapter.title}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextChapter && (
          <Button asChild>
            <Link to={`/chapters/${nextChapter.id}`}>
              Next: {nextChapter.title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function ArtPiece({ art, index }: { art: Art; index: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-muted">
        <img
          src={art.imageUrl}
          alt={art.title || `Art piece ${index}`}
          className="w-full h-auto max-h-[80vh] object-contain mx-auto"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            {art.title && (
              <h3 className="text-lg font-semibold mb-1">{art.title}</h3>
            )}
            {art.description && (
              <p className="text-muted-foreground">{art.description}</p>
            )}
          </div>
          {art.artist && (
            <Badge variant="outline" className="w-fit">
              Art by {art.artist}
            </Badge>
          )}
        </div>
        
        {/* Tagged entities */}
        {(art.characters?.length || art.locations?.length || art.items?.length) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {art.characters?.map((char) => (
              <Link key={char.id} to={`/characters/${char.id}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {char.name}
                </Badge>
              </Link>
            ))}
            {art.locations?.map((loc) => (
              <Link key={loc.id} to={`/locations/${loc.id}`}>
                <Badge variant="outline" className="hover:bg-muted">
                  📍 {loc.name}
                </Badge>
              </Link>
            ))}
            {art.items?.map((item) => (
              <Link key={item.id} to={`/items/${item.id}`}>
                <Badge variant="outline" className="hover:bg-muted">
                  🔮 {item.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

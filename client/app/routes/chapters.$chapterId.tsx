import { Link, useLoaderData } from "react-router";
import { chaptersApi, booksApi, type Chapter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { ArtPiece } from "@/components/art-piece";
import type { Route } from "./+types/chapters.$chapterId";
import { ArtGrid } from '@/components/art-grid';

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
          <ArtGrid art={art} emptyMessage={`No artwork for this chapter yet.`}/>
          {/* {art
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((piece, index) => (
              <ArtPiece key={piece.id} art={piece} index={index + 1} />
            ))} */}
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

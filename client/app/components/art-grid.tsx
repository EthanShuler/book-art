import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";
import type { Art } from "@/lib/api";

interface ArtGridProps {
  art: Art[];
  emptyMessage?: string;
}

export function ArtGrid({ art, emptyMessage = "No artwork available yet." }: ArtGridProps) {
  if (art.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {art.map((piece) => (
        <Link key={piece.id} to={`/art/${piece.id}`}>
          <Card className="overflow-hidden group cursor-pointer">
            <div className="aspect-video relative bg-muted overflow-hidden">
              <img
                src={piece.imageUrl}
                alt={piece.title || "Artwork"}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <CardContent className="p-3">
              {piece.title && (
                <p className="font-medium truncate">{piece.title}</p>
              )}
              {piece.artist && (
                <p className="text-sm text-muted-foreground">by {piece.artist}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

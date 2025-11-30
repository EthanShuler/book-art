import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Art } from "@/lib/api";

interface ArtPieceProps {
  art: Art;
  index: number;
}

export function ArtPiece({ art, index }: ArtPieceProps) {
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
        {(art?.characters || art?.locations || art?.items) && (
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

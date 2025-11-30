import { Link } from "react-router";
import { Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Character } from "@/lib/api";

interface CharactersListProps {
  characters: Character[];
  /** Series ID for the admin add button link */
  seriesId?: string;
  /** Show admin controls */
  isAdmin?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

export function CharactersList({ 
  characters, 
  seriesId, 
  isAdmin = false,
  emptyMessage = "No characters available yet."
}: CharactersListProps) {
  return (
    <div className="space-y-4">
      {isAdmin && seriesId && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/characters/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Character
          </Link>
        </Button>
      )}
      {characters.length === 0 ? (
        <EmptyState message={emptyMessage} />
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

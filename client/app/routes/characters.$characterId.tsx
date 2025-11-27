import { Link, useLoaderData } from "react-router";
import { charactersApi, type Character, type Art } from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Image, Users } from "lucide-react";
import type { Route } from "./+types/characters.$characterId";

export function meta({ data }: Route.MetaArgs) {
  const character = data?.character;
  return [
    { title: character ? `${character.name} - Book Art` : "Character - Book Art" },
    { name: "description", content: character?.description || "View character details and artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const characterId = params.characterId;
  
  try {
    const [characterData, artData] = await Promise.all([
      charactersApi.getById(characterId),
      charactersApi.getArt(characterId),
    ]);
    
    return {
      character: characterData.character,
      art: artData.art,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return {
      character: null,
      art: [],
      error: "Failed to load character",
    };
  }
}

export default function CharacterDetail() {
  const { character, art, error } = useLoaderData<typeof loader>();

  if (error || !character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Character not found"}
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
        <Link to={`/books/${character.bookId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Link>
      </Button>

      {/* Character Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                <Users className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">Character</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{character.name}</h1>
          {character.description && (
            <p className="text-muted-foreground">{character.description}</p>
          )}
        </div>
      </div>

      {/* Art featuring this character */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Artwork featuring {character.name}</h2>
        {art.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No artwork featuring this character yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {art.map((piece: Art) => (
              <Card key={piece.id} className="overflow-hidden group">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

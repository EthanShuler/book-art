import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { charactersApi, type Character } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Pencil, Trash2 } from "lucide-react";
import { ArtGrid } from "@/components/art-grid";
import { useAuth, getAuthToken } from "@/lib/auth";
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
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
      return;
    }

    const token = getAuthToken();
    if (!token || !character) return;

    setIsDeleting(true);
    try {
      await charactersApi.delete(character.id, token);
      navigate(`/series/${character.seriesId}`);
    } catch (err) {
      console.error("Failed to delete character:", err);
      alert("Failed to delete character");
      setIsDeleting(false);
    }
  };

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
        <Link to={`/series/${character.seriesId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
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
            <p className="text-muted-foreground mb-4">{character.description}</p>
          )}
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/characters/${character.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Art featuring this character */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Artwork featuring {character.name}</h2>
        <ArtGrid art={art} emptyMessage={`No artwork featuring this character yet.`} />
      </div>
    </div>
  );
}

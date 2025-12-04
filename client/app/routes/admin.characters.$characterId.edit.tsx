import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterForm, type CharacterFormData } from "@/components/character-form";
import { getAuthToken } from "@/lib/auth";
import { charactersApi } from "@/lib/api";
import type { Route } from "./+types/admin.characters.$characterId.edit";

export function meta({ data }: Route.MetaArgs) {
  const character = data?.character;
  return [{ title: character ? `Edit ${character.name} - Admin` : "Edit Character - Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const characterId = params.characterId;

  try {
    const [characterData, booksData] = await Promise.all([
      charactersApi.getById(characterId),
      charactersApi.getBooks(characterId),
    ]);

    return {
      character: characterData.character,
      bookIds: booksData.books.map(book => book.id),
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return {
      character: null,
      bookIds: [],
      error: "Failed to load character",
    };
  }
}

export default function AdminCharactersEdit() {
  const { character, bookIds, error: loaderError } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(loaderError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">{error || "Character not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: CharacterFormData) => {
    setError(null);
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      await charactersApi.update(character.id, {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        bookIds: data.bookIds,
      }, token);
      navigate(`/characters/${character.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update character");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={`/characters/${character.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Character
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Character</CardTitle>
          <CardDescription>
            Update character details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CharacterForm
            initialData={{ ...character, bookIds }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            cancelUrl={`/characters/${character.id}`}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

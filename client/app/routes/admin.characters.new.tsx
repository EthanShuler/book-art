import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterForm, type CharacterFormData } from "@/components/character-form";
import { getAuthToken } from "@/lib/auth";
import { charactersApi } from "@/lib/api";

export function meta() {
  return [{ title: "Add Character - Admin" }];
}

export default function AdminCharactersNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesId = searchParams.get("seriesId") || undefined;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const result = await charactersApi.create(data, token);
      navigate(`/characters/${result.character.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create character");
      setIsSubmitting(false);
    }
  };

  const backUrl = seriesId ? `/series/${seriesId}` : "/";
  const backLabel = seriesId ? "Back to Series" : "Back to Home";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={backUrl}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Character</CardTitle>
          <CardDescription>
            Add a new character to a series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CharacterForm
            initialData={{ seriesId }}
            onSubmit={handleSubmit}
            submitLabel="Create Character"
            cancelUrl={backUrl}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

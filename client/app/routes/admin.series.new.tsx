import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeriesForm, type SeriesFormData } from "@/components/series-form";
import { seriesApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export function meta() {
  return [{ title: "Create Series - Admin" }];
}

export default function AdminSeriesNew() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SeriesFormData) => {
    setError(null);
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await seriesApi.create(data, token);
      navigate(`/series/${result.series.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create series");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Series</CardTitle>
          <CardDescription>
            A series is a collection of related books (e.g., "The Lord of the Rings")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeriesForm
            onSubmit={handleSubmit}
            submitLabel="Create Series"
            cancelUrl="/"
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from "react";
import { Link, useNavigate, useLoaderData } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeriesForm, type SeriesFormData } from "@/components/series-form";
import { seriesApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import type { Route } from "./+types/admin.series.$seriesId.edit";

export function meta() {
  return [{ title: "Edit Series - Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const seriesId = params.seriesId;
  
  try {
    const seriesData = await seriesApi.getById(seriesId);
    return { series: seriesData.series, error: null };
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return { series: null, error: "Failed to load series" };
  }
}

export default function AdminSeriesEdit() {
  const { series, error: loadError } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loadError || !series) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {loadError || "Series not found"}
        </div>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/series">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Series
          </Link>
        </Button>
      </div>
    );
  }

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
      await seriesApi.update({ id: series.id, ...data }, token);
      navigate(`/series/${series.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update series");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={`/series/${series.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Series</CardTitle>
          <CardDescription>
            Update {series.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeriesForm
            initialData={series}
            onSubmit={handleSubmit}
            submitLabel="Update Series"
            cancelUrl={`/series/${series.id}`}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationForm, type LocationFormData } from "@/components/location-form";
import { getAuthToken } from "@/lib/auth";
import { locationsApi } from "@/lib/api";

export function meta() {
  return [{ title: "Add Location - Admin" }];
}

export default function AdminLocationsNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesId = searchParams.get("seriesId") || undefined;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: LocationFormData) => {
    setError(null);
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      setError("You must be logged in as an admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await locationsApi.create(data, token);
      navigate(`/locations/${result.location.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create location");
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
          <CardTitle>Add New Location</CardTitle>
          <CardDescription>
            Add a new location to a series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm
            initialData={{ seriesId }}
            onSubmit={handleSubmit}
            submitLabel="Create Location"
            cancelUrl={backUrl}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

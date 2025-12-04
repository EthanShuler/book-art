import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationForm, type LocationFormData } from "@/components/location-form";
import { getAuthToken } from "@/lib/auth";
import { locationsApi } from "@/lib/api";
import type { Route } from "./+types/admin.locations.$locationId.edit";

export function meta({ data }: Route.MetaArgs) {
  const location = data?.location;
  return [{ title: location ? `Edit ${location.name} - Admin` : "Edit Location - Admin" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const locationId = params.locationId;

  try {
    const [locationData, booksData] = await Promise.all([
      locationsApi.getById(locationId),
      locationsApi.getBooks(locationId),
    ]);

    return {
      location: locationData.location,
      bookIds: booksData.books.map(book => book.id),
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return {
      location: null,
      bookIds: [],
      error: "Failed to load location",
    };
  }
}

export default function AdminLocationsEdit() {
  const { location, bookIds, error: loaderError } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(loaderError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">{error || "Location not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      await locationsApi.update(location.id, {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        bookIds: data.bookIds,
      }, token);
      navigate(`/locations/${location.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update location");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link to={`/locations/${location.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Location
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Location</CardTitle>
          <CardDescription>
            Update location details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm
            initialData={{ ...location, bookIds }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            cancelUrl={`/locations/${location.id}`}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

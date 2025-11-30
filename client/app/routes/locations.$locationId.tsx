import { Link, useLoaderData } from "react-router";
import { locationsApi, type Location } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin } from "lucide-react";
import { ArtGrid } from "@/components/art-grid";
import type { Route } from "./+types/locations.$locationId";

export function meta({ data }: Route.MetaArgs) {
  const location = data?.location;
  return [
    { title: location ? `${location.name} - Book Art` : "Location - Book Art" },
    { name: "description", content: location?.description || "View location details and artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const locationId = params.locationId;
  
  try {
    const [locationData, artData] = await Promise.all([
      locationsApi.getById(locationId),
      locationsApi.getArt(locationId),
    ]);
    
    return {
      location: locationData.location,
      art: artData.art,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return {
      location: null,
      art: [],
      error: "Failed to load location",
    };
  }
}

export default function LocationDetail() {
  const { location, art, error } = useLoaderData<typeof loader>();

  if (error || !location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Location not found"}
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
        <Link to={`/books/${location.bookId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Link>
      </Button>

      {/* Location Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-96 shrink-0">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted shadow-lg">
            {location.imageUrl ? (
              <img
                src={location.imageUrl}
                alt={location.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                <MapPin className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">Location</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{location.name}</h1>
          {location.description && (
            <p className="text-muted-foreground">{location.description}</p>
          )}
        </div>
      </div>

      {/* Art featuring this location */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Artwork featuring {location.name}</h2>
        <ArtGrid art={art} emptyMessage={`No artwork featuring this location yet.`} />
      </div>
    </div>
  );
}

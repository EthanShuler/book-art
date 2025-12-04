import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { locationsApi, type Location } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Pencil, Trash2 } from "lucide-react";
import { ArtGrid } from "@/components/art-grid";
import { useAuth, getAuthToken } from "@/lib/auth";
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
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this location? This action cannot be undone.")) {
      return;
    }

    const token = getAuthToken();
    if (!token || !location) return;

    setIsDeleting(true);
    try {
      await locationsApi.delete(location.id, token);
      navigate(`/series/${location.seriesId}`);
    } catch (err) {
      console.error("Failed to delete location:", err);
      alert("Failed to delete location");
      setIsDeleting(false);
    }
  };

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
        <Link to={`/series/${location.seriesId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
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
            <p className="text-muted-foreground mb-4">{location.description}</p>
          )}
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/locations/${location.id}/edit`}>
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

      {/* Art featuring this location */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Artwork featuring {location.name}</h2>
        <ArtGrid art={art} emptyMessage={`No artwork featuring this location yet.`} />
      </div>
    </div>
  );
}

import { Link } from "react-router";
import { MapPin, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Location } from "@/lib/api";

interface LocationsListProps {
  locations: Location[];
  /** Series ID for the admin add button link */
  seriesId?: string;
  /** Show admin controls */
  isAdmin?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Use square aspect ratio instead of video (16:9) */
  squareAspect?: boolean;
}

export function LocationsList({ 
  locations, 
  seriesId, 
  isAdmin = false,
  emptyMessage = "No locations available yet.",
  squareAspect = false,
}: LocationsListProps) {
  return (
    <div className="space-y-4">
      {isAdmin && seriesId && (
        <Button asChild variant="outline">
          <Link to={`/admin/series/${seriesId}/locations/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      )}
      {locations.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {locations.map((location) => (
            <Link key={location.id} to={`/locations/${location.id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
                <div className={`${squareAspect ? 'aspect-square' : 'aspect-video'} relative bg-muted overflow-hidden`}>
                  {location.imageUrl ? (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                      <MapPin className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center truncate">{location.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

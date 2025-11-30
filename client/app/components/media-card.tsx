import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

interface MediaCardProps {
  to: string;
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  fallbackIcon?: ReactNode;
  showDescription?: boolean;
}

export function MediaCard({
  to,
  imageUrl,
  title,
  subtitle,
  description,
  fallbackIcon,
  showDescription = false,
}: MediaCardProps) {
  return (
    <Link to={to}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="aspect-2/3 relative bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Cover of ${title}`}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
              {fallbackIcon || <BookOpen className="h-12 w-12 text-muted-foreground" />}
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="line-clamp-1">by {subtitle}</CardDescription>
          )}
        </CardHeader>
        {showDescription && description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

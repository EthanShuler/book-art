import { Link, useLoaderData } from "react-router";
import { itemsApi, type Item, type Art } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Image, Package } from "lucide-react";
import type { Route } from "./+types/items.$itemId";

export function meta({ data }: Route.MetaArgs) {
  const item = data?.item;
  return [
    { title: item ? `${item.name} - Book Art` : "Item - Book Art" },
    { name: "description", content: item?.description || "View item details and artwork" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const itemId = params.itemId;
  
  try {
    const [itemData, artData] = await Promise.all([
      itemsApi.getById(itemId),
      itemsApi.getArt(itemId),
    ]);
    
    return {
      item: itemData.item,
      art: artData.art,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return {
      item: null,
      art: [],
      error: "Failed to load item",
    };
  }
}

export default function ItemDetail() {
  const { item, art, error } = useLoaderData<typeof loader>();

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error || "Item not found"}
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
        <Link to={`/books/${item.bookId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Link>
      </Button>

      {/* Item Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-lg">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2">Item</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{item.name}</h1>
          {item.description && (
            <p className="text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>

      {/* Art featuring this item */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Artwork featuring {item.name}</h2>
        {art.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No artwork featuring this item yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {art.map((piece: Art) => (
              <Card key={piece.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-muted overflow-hidden">
                  <img
                    src={piece.imageUrl}
                    alt={piece.title || "Artwork"}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  {piece.title && (
                    <p className="font-medium truncate">{piece.title}</p>
                  )}
                  {piece.artist && (
                    <p className="text-sm text-muted-foreground">by {piece.artist}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

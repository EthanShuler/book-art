import { Link, useLoaderData, useNavigate } from "react-router";
import { itemsApi, type Item } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Pencil, Trash2 } from "lucide-react";
import { ArtGrid } from "@/components/art-grid";
import { useAuth, getAuthToken } from "@/lib/auth";
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
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const token = getAuthToken();
      if (!token) {
        alert("You must be logged in to delete an item");
        return;
      }
      await itemsApi.delete(item.id, token);
      navigate(`/series/${item.seriesId}`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

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
        <Link to={`/series/${item.seriesId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Link>
      </Button>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex gap-2 mb-6">
          <Button asChild variant="outline">
            <Link to={`/admin/items/${item.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Item
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Item
          </Button>
        </div>
      )}

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
        <ArtGrid art={art} emptyMessage={`No artwork featuring this item yet.`} />
      </div>
    </div>
  );
}

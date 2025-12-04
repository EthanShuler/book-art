import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemForm, type ItemFormData } from "@/components/item-form";
import { itemsApi, type Item } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export default function AdminItemsEdit() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  
  const [item, setItem] = useState<Item | null>(null);
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      if (!itemId) return;
      
      try {
        const [itemResult, booksResult] = await Promise.all([
          itemsApi.getById(itemId),
          itemsApi.getBooks(itemId),
        ]);
        setItem(itemResult.item);
        setBookIds(booksResult.books.map((b) => b.id));
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError("Failed to load item");
      } finally {
        setIsLoading(false);
      }
    }
    fetchItem();
  }, [itemId]);

  const handleSubmit = async (data: ItemFormData) => {
    if (!itemId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to edit an item");
        setIsSubmitting(false);
        return;
      }

      await itemsApi.update(itemId, data, token);
      navigate(`/items/${itemId}`);
    } catch (err) {
      console.error("Failed to update item:", err);
      setError(err instanceof Error ? err.message : "Failed to update item");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-destructive">{error || "Item not found"}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Item: {item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm
            initialData={{ ...item, bookIds }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            cancelUrl={`/items/${itemId}`}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

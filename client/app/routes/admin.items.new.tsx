import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemForm, type ItemFormData } from "@/components/item-form";
import { itemsApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export default function AdminItemsNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesId = searchParams.get("seriesId") || undefined;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to create an item");
        setIsSubmitting(false);
        return;
      }

      const result = await itemsApi.create(data, token);
      navigate(`/items/${result.item.id}`);
    } catch (err) {
      console.error("Failed to create item:", err);
      setError(err instanceof Error ? err.message : "Failed to create item");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm
            initialData={seriesId ? { seriesId } : undefined}
            onSubmit={handleSubmit}
            submitLabel="Create Item"
            cancelUrl={seriesId ? `/series/${seriesId}` : "/"}
            isSubmitting={isSubmitting}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

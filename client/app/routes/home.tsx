import { Link, useLoaderData } from "react-router";
import { ArrowRight, BookOpen, Users, MapPin, Package, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { seriesApi, booksApi, charactersApi, locationsApi, itemsApi, type Series, type Book, type Character, type Location, type Item } from "@/lib/api";

export function meta() {
  return [
    { title: "Book Art" },
    { name: "description", content: "Explore books through art" },
  ];
}

export async function loader() {
  try {
    const [seriesData, booksData, charactersData, locationsData, itemsData] = await Promise.all([
      seriesApi.getAll(),
      booksApi.getAll(),
      charactersApi.getAll(1, 5),
      locationsApi.getAll(1, 5),
      itemsApi.getAll(1, 5),
    ]);

    return {
      series: seriesData.series.slice(0, 5),
      books: booksData.books.slice(0, 5),
      characters: charactersData.characters,
      locations: locationsData.locations,
      items: itemsData.items,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    return {
      series: [],
      books: [],
      characters: [],
      locations: [],
      items: [],
    };
  }
}

function EntitySection({ 
  title, 
  icon: Icon, 
  items, 
  linkPrefix, 
  nameKey = "name",
  viewAllLink 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  items: Array<{ id: string; name?: string; title?: string; imageUrl?: string | null; coverImageUrl?: string | null }>;
  linkPrefix: string;
  nameKey?: "name" | "title";
  viewAllLink: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={viewAllLink}>
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Link key={item.id} to={`${linkPrefix}/${item.id}`}>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="aspect-square relative bg-muted overflow-hidden">
                {(item.imageUrl || item.coverImageUrl) ? (
                  <img
                    src={item.imageUrl || item.coverImageUrl || ""}
                    alt={item[nameKey] || ""}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm text-center truncate">{item[nameKey]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { series, books, characters, locations, items } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Art</h1>
      
      <EntitySection
        title="Series"
        icon={Library}
        items={series}
        linkPrefix="/series"
        nameKey="title"
        viewAllLink="/series"
      />
      
      <EntitySection
        title="Books"
        icon={BookOpen}
        items={books}
        linkPrefix="/books"
        nameKey="title"
        viewAllLink="/books"
      />
      
      <EntitySection
        title="Characters"
        icon={Users}
        items={characters}
        linkPrefix="/characters"
        nameKey="name"
        viewAllLink="/characters"
      />
      
      <EntitySection
        title="Locations"
        icon={MapPin}
        items={locations}
        linkPrefix="/locations"
        nameKey="name"
        viewAllLink="/locations"
      />
      
      <EntitySection
        title="Items"
        icon={Package}
        items={items}
        linkPrefix="/items"
        nameKey="name"
        viewAllLink="/items"
      />
    </div>
  );
}

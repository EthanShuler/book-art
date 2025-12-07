import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("series", "routes/series._index.tsx"),
    route("series/:seriesId", "routes/series.$seriesId.tsx"),
    route("books", "routes/books._index.tsx"),
    route("books/:bookId", "routes/books.$bookId.tsx"),
    route("chapters/:chapterId", "routes/chapters.$chapterId.tsx"),
    route("characters/:characterId", "routes/characters.$characterId.tsx"),
    route("locations/:locationId", "routes/locations.$locationId.tsx"),
    route("items/:itemId", "routes/items.$itemId.tsx"),
    route("art/:artId", "routes/art.$artId.tsx"),
    route("search", "routes/search.tsx"),
  ]),
  // Admin routes (not linked in UI)
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/series/new", "routes/admin.series.new.tsx"),
  route("admin/series/:seriesId/edit", "routes/admin.series.$seriesId.edit.tsx"),
  route("admin/books/new", "routes/admin.books.new.tsx"),
  route("admin/books/:bookId/edit", "routes/admin.books.$bookId.edit.tsx"),
  route("admin/books/:bookId/chapters/new", "routes/admin.books.$bookId.chapters.new.tsx"),
  route("admin/characters/new", "routes/admin.characters.new.tsx"),
  route("admin/characters/:characterId/edit", "routes/admin.characters.$characterId.edit.tsx"),
  route("admin/locations/new", "routes/admin.locations.new.tsx"),
  route("admin/locations/:locationId/edit", "routes/admin.locations.$locationId.edit.tsx"),
  route("admin/items/new", "routes/admin.items.new.tsx"),
  route("admin/items/:itemId/edit", "routes/admin.items.$itemId.edit.tsx"),
] satisfies RouteConfig;

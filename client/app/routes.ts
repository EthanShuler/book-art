import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("books", "routes/books._index.tsx"),
    route("books/:bookId", "routes/books.$bookId.tsx"),
    route("chapters/:chapterId", "routes/chapters.$chapterId.tsx"),
    route("characters/:characterId", "routes/characters.$characterId.tsx"),
    route("locations/:locationId", "routes/locations.$locationId.tsx"),
    route("items/:itemId", "routes/items.$itemId.tsx"),
    route("search", "routes/search.tsx"),
  ]),
] satisfies RouteConfig;

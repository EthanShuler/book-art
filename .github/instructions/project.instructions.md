---
applyTo: '**'
---
# Book Art Project

A website where users can view art for various books, visually guided through a book's story chapter by chapter.

## Tech Stack

**Frontend** (`client/` folder):
- React Router v7 (file-based routing in `app/routes/`)
- TypeScript
- Shadcn UI components (`@/components/ui/`)
- Vite

**Backend** (`server/` folder):
- Express.js with TypeScript
- PostgreSQL database
- JWT authentication

## Database Schema

The data model uses a hierarchical structure with many-to-many relationships:

```
Series (top level - e.g., "The Lord of the Rings")
├── Books (belong to a series)
│   └── Chapters (belong to a book)
├── Characters (belong to series, linked to books via book_characters)
├── Locations (belong to series, linked to books via book_locations)  
└── Items (belong to series, linked to books via book_items)

Art
├── Linked to a book and optionally a chapter
├── Tagged with characters via art_characters junction table
├── Tagged with locations via art_locations junction table
└── Tagged with items via art_items junction table

Artists (standalone, referenced by art)
Users (for admin authentication)
```

## API Conventions

- All routes return responses wrapped in an object: `{ book: {...} }`, `{ chapters: [...] }`, etc.
- Database columns use `snake_case`, API responses use `camelCase` (via `utils/caseConverter.ts`)
- Admin routes require JWT token via `Authorization: Bearer <token>` header
- Admin middleware: `adminOnly` from `middleware/auth.ts`

## Key Files

**Server Routes** (`server/src/routes/`):
- `series.ts` - CRUD for series
- `books.ts` - CRUD for books + nested resources (chapters, characters, locations, items, art)
- `chapters.ts` - CRUD for chapters + art
- `characters.ts`, `locations.ts`, `items.ts` - CRUD + book associations + art
- `art.ts` - CRUD for art + entity associations
- `artists.ts` - CRUD for artists
- `auth.ts` - Login/register endpoints

**Client Routes** (`client/app/routes/`):
- `home.tsx` - Landing page
- `books._index.tsx` - Books list
- `books.$bookId.tsx` - Book detail with tabs for chapters/characters/locations/items
- `chapters.$chapterId.tsx` - Chapter art gallery
- `characters.$characterId.tsx`, `locations.$locationId.tsx`, `items.$itemId.tsx` - Entity detail pages
- `search.tsx` - Search across all entities
- `layout.tsx` - Root layout with navbar

**API Client** (`client/app/lib/api.ts`):
- Type definitions for all entities
- API functions for each resource type

## Common Patterns

**Creating entities with book associations:**
```typescript
// Characters, locations, items belong to a series and can be linked to multiple books
POST /api/characters
{
  "seriesId": "uuid",
  "name": "...",
  "description": "...",
  "imageUrl": "...",
  "bookIds": ["uuid1", "uuid2"]  // optional
}
```

**Image fields:**
- Database column: `image_url` (snake_case)
- API request/response: `imageUrl` (camelCase)
- Books/Series use `coverImageUrl`

**Testing API routes:**
- Use `.rest` files in `server/requests/` with REST Client extension
- Login first to get token, then use `Authorization: Bearer {{token}}`

## TODO / Not Yet Implemented
- Admin UI forms for creating/editing content
- Image upload to AWS S3
- User registration (currently admin-only)
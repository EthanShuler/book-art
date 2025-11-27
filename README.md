# Book Art

A website for viewing art associated with books, organized by chapters. Users can visually follow along with a book's story through curated artwork.

## Project Structure

```
book-art/
├── client/          # React Router v7 frontend
│   ├── app/         # Application code
│   ├── public/      # Static assets
│   └── ...
├── server/          # Express backend
│   ├── src/         # Server source code
│   └── ...
└── package.json     # Root workspace config
```

## Features

- 📚 Browse books and their chapters
- 🎨 View art organized by chapter
- 👤 Character, location, and item galleries
- 🔍 Search functionality
- 🔐 User authentication
- 👑 Admin interface for content management

## Tech Stack

### Frontend
- React Router v7
- TypeScript
- Tailwind CSS
- Shadcn UI

### Backend
- Express.js
- PostgreSQL
- AWS S3 (image storage)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- AWS S3 bucket (for image storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/EthanShuler/book-art.git
cd book-art
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Copy the example env files and fill in your values:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Set up the database

Create a PostgreSQL database and run the schema:
```bash
psql -d book_art -f server/src/db/schema.sql
```

5. Start development servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server in development mode |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build both client and server |
| `npm run typecheck` | Run TypeScript type checking |

## API Endpoints

### Books
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/chapters` - Get chapters for a book

### Chapters
- `GET /api/chapters/:id` - Get chapter details
- `GET /api/chapters/:id/art` - Get art for a chapter

### Art
- `GET /api/art` - List all art (paginated)
- `GET /api/art/:id` - Get art details
- `GET /api/art/search` - Search art

### Characters, Locations, Items
- Similar CRUD endpoints for each entity

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## License

ISC

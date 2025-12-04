import { Router, Request, Response } from 'express';
import { query } from '../db';
import { rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

interface SearchResult {
  type: 'series' | 'book' | 'chapter' | 'character' | 'location' | 'item';
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  parentId?: string;
  parentName?: string;
}

// GET /api/search?q=query&limit=20
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const searchTerm = q.trim();
    const searchLimit = Math.min(Number(limit), 100);
    
    // Use ILIKE for case-insensitive fuzzy matching with wildcards
    const fuzzyPattern = `%${searchTerm}%`;

    // Search all entity types in parallel
    const [seriesResults, bookResults, chapterResults, characterResults, locationResults, itemResults] = await Promise.all([
      // Series
      query(
        `SELECT id, title as name, description, cover_image_url as image_url
         FROM series
         WHERE title ILIKE $1 OR description ILIKE $1
         ORDER BY 
           CASE WHEN title ILIKE $2 THEN 0 ELSE 1 END,
           title ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
      
      // Books
      query(
        `SELECT b.id, b.title as name, b.description, b.cover_image_url as image_url,
                s.id as parent_id, s.title as parent_name
         FROM books b
         LEFT JOIN series s ON b.series_id = s.id
         WHERE b.title ILIKE $1 OR b.description ILIKE $1
         ORDER BY 
           CASE WHEN b.title ILIKE $2 THEN 0 ELSE 1 END,
           b.title ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
      
      // Chapters
      query(
        `SELECT c.id, c.title as name, c.summary as description, NULL as image_url,
                b.id as parent_id, b.title as parent_name
         FROM chapters c
         JOIN books b ON c.book_id = b.id
         WHERE c.title ILIKE $1 OR c.summary ILIKE $1
         ORDER BY 
           CASE WHEN c.title ILIKE $2 THEN 0 ELSE 1 END,
           c.title ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
      
      // Characters
      query(
        `SELECT ch.id, ch.name, ch.description, ch.image_url,
                s.id as parent_id, s.title as parent_name
         FROM characters ch
         LEFT JOIN series s ON ch.series_id = s.id
         WHERE ch.name ILIKE $1 OR ch.description ILIKE $1
         ORDER BY 
           CASE WHEN ch.name ILIKE $2 THEN 0 ELSE 1 END,
           ch.name ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
      
      // Locations
      query(
        `SELECT l.id, l.name, l.description, l.image_url,
                s.id as parent_id, s.title as parent_name
         FROM locations l
         LEFT JOIN series s ON l.series_id = s.id
         WHERE l.name ILIKE $1 OR l.description ILIKE $1
         ORDER BY 
           CASE WHEN l.name ILIKE $2 THEN 0 ELSE 1 END,
           l.name ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
      
      // Items
      query(
        `SELECT i.id, i.name, i.description, i.image_url,
                s.id as parent_id, s.title as parent_name
         FROM items i
         LEFT JOIN series s ON i.series_id = s.id
         WHERE i.name ILIKE $1 OR i.description ILIKE $1
         ORDER BY 
           CASE WHEN i.name ILIKE $2 THEN 0 ELSE 1 END,
           i.name ASC
         LIMIT $3`,
        [fuzzyPattern, `${searchTerm}%`, searchLimit]
      ),
    ]);

    // Format results with type info
    const results = {
      series: rowsToCamelCase(seriesResults.rows).map((r: any) => ({ ...r, type: 'series' })),
      books: rowsToCamelCase(bookResults.rows).map((r: any) => ({ ...r, type: 'book' })),
      chapters: rowsToCamelCase(chapterResults.rows).map((r: any) => ({ ...r, type: 'chapter' })),
      characters: rowsToCamelCase(characterResults.rows).map((r: any) => ({ ...r, type: 'character' })),
      locations: rowsToCamelCase(locationResults.rows).map((r: any) => ({ ...r, type: 'location' })),
      items: rowsToCamelCase(itemResults.rows).map((r: any) => ({ ...r, type: 'item' })),
    };

    const totalCount = 
      results.series.length + 
      results.books.length + 
      results.chapters.length + 
      results.characters.length + 
      results.locations.length + 
      results.items.length;

    res.json({
      query: searchTerm,
      totalCount,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;

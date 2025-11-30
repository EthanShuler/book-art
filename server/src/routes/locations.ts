import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';
import { rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

// GET /api/locations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM locations WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json({ location: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// GET /api/locations/:id/books - Get all books a location appears in
router.get('/:id/books', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.* FROM books b
       JOIN book_locations bl ON b.id = bl.book_id
       WHERE bl.location_id = $1
       ORDER BY b.title ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books for location' });
  }
});

// POST /api/locations (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { seriesId, name, description, imageUrl, bookIds, data } = req.body;
    
    // Insert location
    const result = await query(
      `INSERT INTO locations (series_id, name, description, image_url, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [seriesId, name, description, imageUrl, data ? JSON.stringify(data) : '{}']
    );
    const location = result.rows[0];

    // Associate with books if provided
    if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
      const bookValues = bookIds.map((bookId: string, index: number) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');
      const bookParams = bookIds.flatMap((bookId: string) => [bookId, location.id]);
      await query(
        `INSERT INTO book_locations (book_id, location_id) VALUES ${bookValues}`,
        bookParams
      );
    }

    res.status(201).json({ location });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT /api/locations/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, bookIds, data } = req.body;
    const result = await query(
      `UPDATE locations
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           data = COALESCE($4, data),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, imageUrl, data ? JSON.stringify(data) : null, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // Update book associations if provided
    if (bookIds && Array.isArray(bookIds)) {
      // Remove existing associations
      await query('DELETE FROM book_locations WHERE location_id = $1', [id]);
      
      // Add new associations
      if (bookIds.length > 0) {
        const bookValues = bookIds.map((bookId: string, index: number) => 
          `($${index * 2 + 1}, $${index * 2 + 2})`
        ).join(', ');
        const bookParams = bookIds.flatMap((bookId: string) => [bookId, id]);
        await query(
          `INSERT INTO book_locations (book_id, location_id) VALUES ${bookValues}`,
          bookParams
        );
      }
    }

    res.json({ location: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE /api/locations/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM locations WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// POST /api/locations/:id/books - Associate location with a book (admin only)
router.post('/:id/books', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;
    
    await query(
      'INSERT INTO book_locations (book_id, location_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [bookId, id]
    );
    res.status(201).json({ message: 'Location associated with book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to associate location with book' });
  }
});

// DELETE /api/locations/:id/books/:bookId - Remove location from book (admin only)
router.delete('/:id/books/:bookId', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id, bookId } = req.params;
    await query(
      'DELETE FROM book_locations WHERE book_id = $1 AND location_id = $2',
      [bookId, id]
    );
    res.json({ message: 'Location removed from book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove location from book' });
  }
});

// GET /api/locations/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.* FROM art a
       JOIN art_locations al ON a.id = al.art_id
       WHERE al.location_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );
    res.json({ art: rowsToCamelCase(result.rows) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

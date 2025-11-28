import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';
import { toCamelCase, rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

// GET /api/series - Get all series
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM series ORDER BY title ASC'
    );
    res.json({ series: rowsToCamelCase(result.rows) });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// GET /api/series/:id - Get a single series by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM series WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    res.json({ series: toCamelCase(result.rows[0]) });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// GET /api/series/:id/books - Get all books in a series
router.get('/:id/books', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM books WHERE series_id = $1 ORDER BY title ASC',
      [id]
    );
    res.json({ books: rowsToCamelCase(result.rows) });
  } catch (error) {
    console.error('Error fetching books for series:', error);
    res.status(500).json({ error: 'Failed to fetch books for series' });
  }
});

// GET /api/series/:id/characters - Get all characters in a series
router.get('/:id/characters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM characters WHERE series_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ characters: rowsToCamelCase(result.rows) });
  } catch (error) {
    console.error('Error fetching characters for series:', error);
    res.status(500).json({ error: 'Failed to fetch characters for series' });
  }
});

// GET /api/series/:id/locations - Get all locations in a series
router.get('/:id/locations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM locations WHERE series_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ locations: rowsToCamelCase(result.rows) });
  } catch (error) {
    console.error('Error fetching locations for series:', error);
    res.status(500).json({ error: 'Failed to fetch locations for series' });
  }
});

// GET /api/series/:id/items - Get all items in a series
router.get('/:id/items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM items WHERE series_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ items: rowsToCamelCase(result.rows) });
  } catch (error) {
    console.error('Error fetching items for series:', error);
    res.status(500).json({ error: 'Failed to fetch items for series' });
  }
});

// POST /api/series - Create a new series (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, cover_image_url, author } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const result = await query(
      `INSERT INTO series (title, description, cover_image_url, author)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || null, cover_image_url || null, author || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ error: 'Failed to create series' });
  }
});

// PUT /api/series/:id - Update a series (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, cover_image_url, author } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const result = await query(
      `UPDATE series
       SET title = $1, description = $2, cover_image_url = $3, author = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description || null, cover_image_url || null, author || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ error: 'Failed to update series' });
  }
});

// DELETE /api/series/:id - Delete a series (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM series WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ error: 'Failed to delete series' });
  }
});

export default router;

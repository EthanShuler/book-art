import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';
import { toCamelCase, rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

// GET /api/items/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ item: toCamelCase(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// GET /api/items/:id/books - Get all books an item appears in
router.get('/:id/books', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.* FROM books b
       JOIN book_items bi ON b.id = bi.book_id
       WHERE bi.item_id = $1
       ORDER BY b.title ASC`,
      [id]
    );
    res.json({ books: rowsToCamelCase(result.rows) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books for item' });
  }
});

// POST /api/items (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { seriesId, name, description, imageUrl, bookIds, data } = req.body;
    
    // Insert item
    const result = await query(
      `INSERT INTO items (series_id, name, description, image_url, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [seriesId, name, description, imageUrl, data ? JSON.stringify(data) : '{}']
    );
    const item = result.rows[0];

    // Associate with books if provided
    if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
      const bookValues = bookIds.map((bookId: string, index: number) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');
      const bookParams = bookIds.flatMap((bookId: string) => [bookId, item.id]);
      await query(
        `INSERT INTO book_items (book_id, item_id) VALUES ${bookValues}`,
        bookParams
      );
    }

    res.status(201).json({ item: toCamelCase(item) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, bookIds, data } = req.body;
    const result = await query(
      `UPDATE items
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
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Update book associations if provided
    if (bookIds && Array.isArray(bookIds)) {
      // Remove existing associations
      await query('DELETE FROM book_items WHERE item_id = $1', [id]);
      
      // Add new associations
      if (bookIds.length > 0) {
        const bookValues = bookIds.map((bookId: string, index: number) => 
          `($${index * 2 + 1}, $${index * 2 + 2})`
        ).join(', ');
        const bookParams = bookIds.flatMap((bookId: string) => [bookId, id]);
        await query(
          `INSERT INTO book_items (book_id, item_id) VALUES ${bookValues}`,
          bookParams
        );
      }
    }

    res.json({ item: toCamelCase(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/items/:id/books - Associate item with a book (admin only)
router.post('/:id/books', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;
    
    await query(
      'INSERT INTO book_items (book_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [bookId, id]
    );
    res.status(201).json({ message: 'Item associated with book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to associate item with book' });
  }
});

// DELETE /api/items/:id/books/:bookId - Remove item from book (admin only)
router.delete('/:id/books/:bookId', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id, bookId } = req.params;
    await query(
      'DELETE FROM book_items WHERE book_id = $1 AND item_id = $2',
      [bookId, id]
    );
    res.json({ message: 'Item removed from book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from book' });
  }
});

// GET /api/items/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.* FROM art a
       JOIN art_items ai ON a.id = ai.art_id
       WHERE ai.item_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );
    res.json({ art: rowsToCamelCase(result.rows) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

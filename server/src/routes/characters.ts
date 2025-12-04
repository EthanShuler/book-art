import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';
import { toCamelCase, rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

// GET /api/characters/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM characters WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json({ character: toCamelCase(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// GET /api/characters/:id/books - Get all books a character appears in
router.get('/:id/books', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.* FROM books b
       JOIN book_characters bc ON b.id = bc.book_id
       WHERE bc.character_id = $1
       ORDER BY b.title ASC`,
      [id]
    );
    res.json({ books: rowsToCamelCase(result.rows) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books for character' });
  }
});

// POST /api/characters (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { seriesId, name, description, imageUrl, bookIds, data } = req.body;
    
    // Insert character
    const result = await query(
      `INSERT INTO characters (series_id, name, description, image_url, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [seriesId, name, description, imageUrl, data ? JSON.stringify(data) : '{}']
    );
    const character = result.rows[0];

    // Associate with books if provided
    if (bookIds && Array.isArray(bookIds) && bookIds.length > 0) {
      const bookValues = bookIds.map((bookId: string, index: number) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');
      const bookParams = bookIds.flatMap((bookId: string) => [bookId, character.id]);
      await query(
        `INSERT INTO book_characters (book_id, character_id) VALUES ${bookValues}`,
        bookParams
      );
    }

    res.status(201).json({ character: toCamelCase(character) });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /api/characters/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, bookIds, data } = req.body;
    const result = await query(
      `UPDATE characters
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
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Update book associations if provided
    if (bookIds && Array.isArray(bookIds)) {
      // Remove existing associations
      await query('DELETE FROM book_characters WHERE character_id = $1', [id]);
      
      // Add new associations
      if (bookIds.length > 0) {
        const bookValues = bookIds.map((bookId: string, index: number) => 
          `($${index * 2 + 1}, $${index * 2 + 2})`
        ).join(', ');
        const bookParams = bookIds.flatMap((bookId: string) => [bookId, id]);
        await query(
          `INSERT INTO book_characters (book_id, character_id) VALUES ${bookValues}`,
          bookParams
        );
      }
    }

    res.json({ character: toCamelCase(result.rows[0]) });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /api/characters/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM characters WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// POST /api/characters/:id/books - Associate character with a book (admin only)
router.post('/:id/books', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;
    
    await query(
      'INSERT INTO book_characters (book_id, character_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [bookId, id]
    );
    res.status(201).json({ message: 'Character associated with book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to associate character with book' });
  }
});

// DELETE /api/characters/:id/books/:bookId - Remove character from book (admin only)
router.delete('/:id/books/:bookId', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id, bookId } = req.params;
    await query(
      'DELETE FROM book_characters WHERE book_id = $1 AND character_id = $2',
      [bookId, id]
    );
    res.json({ message: 'Character removed from book' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove character from book' });
  }
});

// GET /api/characters/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.* FROM art a
       JOIN art_characters ac ON a.id = ac.art_id
       WHERE ac.character_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );
    res.json({ art: rowsToCamelCase(result.rows) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

// GET /api/characters - Get all characters with optional pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const countResult = await query('SELECT COUNT(*) FROM characters');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await query(
      `SELECT * FROM characters ORDER BY name ASC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    
    res.json({
      characters: result.rows,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

export default router;

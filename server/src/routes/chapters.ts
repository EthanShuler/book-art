import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';
import { toCamelCase, rowsToCamelCase } from '../utils/caseConverter';

const router = Router();

// GET /api/chapters/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM chapters WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    
    res.json({ chapter: toCamelCase(result.rows[0]) });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// POST /api/chapters (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { bookId, title, chapterNumber, summary, data } = req.body;
    
    if (!bookId || !title || chapterNumber === undefined) {
      res.status(400).json({ error: 'bookId, title, and chapterNumber are required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO chapters (book_id, title, chapter_number, summary, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookId, title, chapterNumber, summary || null, data ? JSON.stringify(data) : '{}']
    );
    
    res.status(201).json({ chapter: toCamelCase(result.rows[0]), message: 'Chapter created successfully' });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// PUT /api/chapters/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, chapterNumber, summary, data } = req.body;
    
    const result = await query(
      `UPDATE chapters 
       SET title = COALESCE($1, title),
           chapter_number = COALESCE($2, chapter_number),
           summary = COALESCE($3, summary),
           data = COALESCE($4, data),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, chapterNumber, summary, data ? JSON.stringify(data) : null, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    
    res.json({ chapter: toCamelCase(result.rows[0]), message: 'Chapter updated successfully' });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// DELETE /api/chapters/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM chapters WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// GET /api/chapters/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const artResult = await query(
      'SELECT * FROM art WHERE chapter_id = $1 ORDER BY order_index ASC',
      [id]
    );
    
    // For each art piece, fetch associated characters, locations, and items
    const artWithRelations = await Promise.all(
      artResult.rows.map(async (art) => {
        const [charactersResult, locationsResult, itemsResult] = await Promise.all([
          query(
            `SELECT c.* FROM characters c
             JOIN art_characters ac ON c.id = ac.character_id
             WHERE ac.art_id = $1`,
            [art.id]
          ),
          query(
            `SELECT l.* FROM locations l
             JOIN art_locations al ON l.id = al.location_id
             WHERE al.art_id = $1`,
            [art.id]
          ),
          query(
            `SELECT i.* FROM items i
             JOIN art_items ai ON i.id = ai.item_id
             WHERE ai.art_id = $1`,
            [art.id]
          ),
        ]);
        
        return {
          ...toCamelCase(art) as Record<string, unknown>,
          characters: rowsToCamelCase(charactersResult.rows),
          locations: rowsToCamelCase(locationsResult.rows),
          items: rowsToCamelCase(itemsResult.rows),
        };
      })
    );
    
    res.json({ art: artWithRelations });
  } catch (error) {
    console.error('Error fetching art:', error);
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

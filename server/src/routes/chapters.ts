import { Router, Request, Response } from 'express';
import { query } from '../db';

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
    
    res.json({ chapter: result.rows[0] });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// POST /api/chapters (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { bookId, title, chapterNumber, summary } = req.body;
    
    if (!bookId || !title || chapterNumber === undefined) {
      res.status(400).json({ error: 'bookId, title, and chapterNumber are required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO chapters (book_id, title, chapter_number, summary)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bookId, title, chapterNumber, summary || null]
    );
    
    res.status(201).json({ chapter: result.rows[0], message: 'Chapter created successfully' });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// PUT /api/chapters/:id (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, chapterNumber, summary } = req.body;
    
    const result = await query(
      `UPDATE chapters 
       SET title = COALESCE($1, title),
           chapter_number = COALESCE($2, chapter_number),
           summary = COALESCE($3, summary),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, chapterNumber, summary, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    
    res.json({ chapter: result.rows[0], message: 'Chapter updated successfully' });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// DELETE /api/chapters/:id (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
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
    const result = await query(
      'SELECT * FROM art WHERE chapter_id = $1 ORDER BY order_index ASC',
      [id]
    );
    res.json({ art: result.rows });
  } catch (error) {
    console.error('Error fetching art:', error);
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

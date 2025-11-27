import { Router, Request, Response } from 'express';
import { query } from '../db';

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
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { bookId, name, description, image } = req.body;
    const result = await query(
      `INSERT INTO items (book_id, name, description, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bookId, name, description, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const result = await query(
      `UPDATE items
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image = COALESCE($3, image),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, image, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
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
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

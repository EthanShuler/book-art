import { Router, Request, Response } from 'express';
import { query } from '../db';

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
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// POST /api/characters (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { bookId, name, description, image } = req.body;
    const result = await query(
      `INSERT INTO characters (book_id, name, description, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bookId, name, description, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /api/characters/:id (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const result = await query(
      `UPDATE characters
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image = COALESCE($3, image),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, image, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /api/characters/:id (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
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
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

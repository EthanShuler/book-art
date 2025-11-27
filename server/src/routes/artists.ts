import { Router, Request, Response } from 'express';
import { query } from '../db';
import { adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/artists
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM artists ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// GET /api/artists/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM artists WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// POST /api/artists (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, website, bio } = req.body;
    const result = await query(
      `INSERT INTO artists (name, website, bio)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, website, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// PUT /api/artists/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, website, bio } = req.body;
    const result = await query(
      `UPDATE artists
       SET name = COALESCE($1, name),
           website = COALESCE($2, website),
           bio = COALESCE($3, bio),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, website, bio, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// DELETE /api/artists/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM artists WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

// GET /api/artists/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM art WHERE artist_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

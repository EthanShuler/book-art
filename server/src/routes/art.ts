import { Router, Request, Response } from 'express';
import { query, pool } from '../db';
import { adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/art/search - must be before /:id route
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, bookId, chapterId } = req.query;
    let sql = `SELECT * FROM art WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    if (bookId) {
      sql += ` AND book_id = $${paramIndex}`;
      params.push(bookId);
      paramIndex++;
    }
    if (chapterId) {
      sql += ` AND chapter_id = $${paramIndex}`;
      params.push(chapterId);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search art' });
  }
});

// GET /api/art
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const countResult = await query('SELECT COUNT(*) FROM art');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await query(
      `SELECT * FROM art ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );
    
    res.json({
      art: result.rows,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

// GET /api/art/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get art piece
    const artResult = await query('SELECT * FROM art WHERE id = $1', [id]);
    if (artResult.rows.length === 0) {
      res.status(404).json({ error: 'Art not found' });
      return;
    }
    
    const art = artResult.rows[0];
    
    // Get associated characters
    const charactersResult = await query(
      `SELECT c.* FROM characters c
       JOIN art_characters ac ON c.id = ac.character_id
       WHERE ac.art_id = $1`,
      [id]
    );
    
    // Get associated locations
    const locationsResult = await query(
      `SELECT l.* FROM locations l
       JOIN art_locations al ON l.id = al.location_id
       WHERE al.art_id = $1`,
      [id]
    );
    
    // Get associated items
    const itemsResult = await query(
      `SELECT i.* FROM items i
       JOIN art_items ai ON i.id = ai.item_id
       WHERE ai.art_id = $1`,
      [id]
    );
    
    // Get artist info
    let artist = null;
    if (art.artist_id) {
      const artistResult = await query('SELECT * FROM artists WHERE id = $1', [art.artist_id]);
      artist = artistResult.rows[0] || null;
    }
    
    res.json({
      ...art,
      artist,
      characters: charactersResult.rows,
      locations: locationsResult.rows,
      items: itemsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

// POST /api/art (admin only)
router.post('/', adminOnly, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { bookId, chapterId, title, description, imageUrl, artistId, tags, characters, locations, items } = req.body;
    
    await client.query('BEGIN');
    
    // Create art piece
    const artResult = await client.query(
      `INSERT INTO art (book_id, chapter_id, title, description, image_url, artist_id, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [bookId, chapterId || null, title, description, imageUrl, artistId || null, tags || []]
    );
    const art = artResult.rows[0];
    
    // Add character associations
    if (characters && characters.length > 0) {
      for (const characterId of characters) {
        await client.query(
          'INSERT INTO art_characters (art_id, character_id) VALUES ($1, $2)',
          [art.id, characterId]
        );
      }
    }
    
    // Add location associations
    if (locations && locations.length > 0) {
      for (const locationId of locations) {
        await client.query(
          'INSERT INTO art_locations (art_id, location_id) VALUES ($1, $2)',
          [art.id, locationId]
        );
      }
    }
    
    // Add item associations
    if (items && items.length > 0) {
      for (const itemId of items) {
        await client.query(
          'INSERT INTO art_items (art_id, item_id) VALUES ($1, $2)',
          [art.id, itemId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(art);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create art' });
  } finally {
    client.release();
  }
});

// PUT /api/art/:id (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, description, imageUrl, chapterId, artistId, tags, characters, locations, items } = req.body;
    
    await client.query('BEGIN');
    
    // Update art piece
    const artResult = await client.query(
      `UPDATE art
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           chapter_id = COALESCE($4, chapter_id),
           artist_id = COALESCE($5, artist_id),
           tags = COALESCE($6, tags),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, imageUrl, chapterId, artistId, tags, id]
    );
    
    if (artResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Art not found' });
      return;
    }
    
    // Update character associations if provided
    if (characters !== undefined) {
      await client.query('DELETE FROM art_characters WHERE art_id = $1', [id]);
      for (const characterId of characters) {
        await client.query(
          'INSERT INTO art_characters (art_id, character_id) VALUES ($1, $2)',
          [id, characterId]
        );
      }
    }
    
    // Update location associations if provided
    if (locations !== undefined) {
      await client.query('DELETE FROM art_locations WHERE art_id = $1', [id]);
      for (const locationId of locations) {
        await client.query(
          'INSERT INTO art_locations (art_id, location_id) VALUES ($1, $2)',
          [id, locationId]
        );
      }
    }
    
    // Update item associations if provided
    if (items !== undefined) {
      await client.query('DELETE FROM art_items WHERE art_id = $1', [id]);
      for (const itemId of items) {
        await client.query(
          'INSERT INTO art_items (art_id, item_id) VALUES ($1, $2)',
          [id, itemId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json(artResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update art' });
  } finally {
    client.release();
  }
});

// DELETE /api/art/:id (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Junction table entries will be deleted via CASCADE
    const result = await query(
      'DELETE FROM art WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Art not found' });
      return;
    }
    res.json({ message: 'Art deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete art' });
  }
});

export default router;

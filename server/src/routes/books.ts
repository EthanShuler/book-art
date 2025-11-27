import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/books
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM books ORDER BY created_at DESC');
    res.json({ books: result.rows });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET /api/books/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    res.json({ book: result.rows[0] });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST /api/books (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, author, description, coverImageUrl } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO books (title, author, description, cover_image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, author || null, description || null, coverImageUrl || null]
    );
    
    res.status(201).json({ book: result.rows[0], message: 'Book created successfully' });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT /api/books/:id (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, description, coverImageUrl } = req.body;
    
    const result = await query(
      `UPDATE books 
       SET title = COALESCE($1, title),
           author = COALESCE($2, author),
           description = COALESCE($3, description),
           cover_image_url = COALESCE($4, cover_image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, author, description, coverImageUrl, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    res.json({ book: result.rows[0], message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /api/books/:id (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// GET /api/books/:id/chapters
router.get('/:id/chapters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM chapters WHERE book_id = $1 ORDER BY chapter_number ASC',
      [id]
    );
    res.json({ chapters: result.rows });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// GET /api/books/:id/characters
router.get('/:id/characters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM characters WHERE book_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ characters: result.rows });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// GET /api/books/:id/locations
router.get('/:id/locations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM locations WHERE book_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ locations: result.rows });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET /api/books/:id/items
router.get('/:id/items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM items WHERE book_id = $1 ORDER BY name ASC',
      [id]
    );
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/books/:id/art
router.get('/:id/art', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM art WHERE book_id = $1 ORDER BY order_index ASC',
      [id]
    );
    res.json({ art: result.rows });
  } catch (error) {
    console.error('Error fetching art:', error);
    res.status(500).json({ error: 'Failed to fetch art' });
  }
});

export default router;

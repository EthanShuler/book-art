import { pool } from '../src/db';

/**
 * Clean up test data from all tables
 */
export async function cleanupTestData() {
  await pool.query('DELETE FROM art_characters');
  await pool.query('DELETE FROM art_locations');
  await pool.query('DELETE FROM art_items');
  await pool.query('DELETE FROM art');
  await pool.query('DELETE FROM chapters');
  await pool.query('DELETE FROM characters');
  await pool.query('DELETE FROM locations');
  await pool.query('DELETE FROM items');
  await pool.query('DELETE FROM artists');
  await pool.query('DELETE FROM books');
  await pool.query('DELETE FROM users');
}

/**
 * Create a test book and return its ID
 */
export async function createTestBook() {
  const result = await pool.query(
    `INSERT INTO books (title, author, description, cover_image_url)
     VALUES ('Test Book', 'Test Author', 'Test Description', 'https://example.com/cover.jpg')
     RETURNING *`
  );
  return result.rows[0];
}

/**
 * Create a test chapter and return it
 */
export async function createTestChapter(bookId: string) {
  const result = await pool.query(
    `INSERT INTO chapters (book_id, title, chapter_number, description)
     VALUES ($1, 'Test Chapter', 1, 'Test chapter description')
     RETURNING *`,
    [bookId]
  );
  return result.rows[0];
}

/**
 * Create a test character and return it
 */
export async function createTestCharacter(bookId: string) {
  const result = await pool.query(
    `INSERT INTO characters (book_id, name, description, image)
     VALUES ($1, 'Test Character', 'Test character description', 'https://example.com/char.jpg')
     RETURNING *`,
    [bookId]
  );
  return result.rows[0];
}

/**
 * Create a test location and return it
 */
export async function createTestLocation(bookId: string) {
  const result = await pool.query(
    `INSERT INTO locations (book_id, name, description, image)
     VALUES ($1, 'Test Location', 'Test location description', 'https://example.com/loc.jpg')
     RETURNING *`,
    [bookId]
  );
  return result.rows[0];
}

/**
 * Create a test item and return it
 */
export async function createTestItem(bookId: string) {
  const result = await pool.query(
    `INSERT INTO items (book_id, name, description, image)
     VALUES ($1, 'Test Item', 'Test item description', 'https://example.com/item.jpg')
     RETURNING *`,
    [bookId]
  );
  return result.rows[0];
}

/**
 * Create a test artist and return it
 */
export async function createTestArtist() {
  const result = await pool.query(
    `INSERT INTO artists (name, website, bio)
     VALUES ('Test Artist', 'https://example.com', 'Test artist bio')
     RETURNING *`
  );
  return result.rows[0];
}

/**
 * Create a test art piece and return it
 */
export async function createTestArt(bookId: string, chapterId?: string, artistId?: string) {
  const result = await pool.query(
    `INSERT INTO art (book_id, chapter_id, title, description, image_url, artist_id, tags)
     VALUES ($1, $2, 'Test Art', 'Test art description', 'https://example.com/art.jpg', $3, ARRAY['tag1', 'tag2'])
     RETURNING *`,
    [bookId, chapterId || null, artistId || null]
  );
  return result.rows[0];
}

/**
 * Create a test user and return it with a JWT token
 */
export async function createTestUser(isAdmin = false) {
  const bcrypt = await import('bcrypt');
  const jwt = await import('jsonwebtoken');
  
  const passwordHash = await bcrypt.hash('testpassword123', 10);
  const email = `test-${Date.now()}@example.com`;
  
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, username, is_admin)
     VALUES ($1, $2, 'testuser', $3)
     RETURNING id, email, username, is_admin, created_at`,
    [email, passwordHash, isAdmin]
  );
  
  const user = result.rows[0];
  const token = jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.is_admin },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
  
  return { user, token };
}

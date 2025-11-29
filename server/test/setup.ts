import { query, pool } from '../src/db';
import jwt from 'jsonwebtoken';

// JWT_SECRET should be set by jest.setup.ts before this file loads
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Clean up all test data from the database
 * Only deletes records where data->>'isTest' = 'true'
 */
export async function cleanupTestData(): Promise<void> {
  // Delete in order respecting foreign key constraints
  // First delete junction tables (they reference other tables)
  await query(`DELETE FROM art_characters WHERE art_id IN (SELECT id FROM art WHERE data->>'isTest' = 'true')`);
  await query(`DELETE FROM art_locations WHERE art_id IN (SELECT id FROM art WHERE data->>'isTest' = 'true')`);
  await query(`DELETE FROM art_items WHERE art_id IN (SELECT id FROM art WHERE data->>'isTest' = 'true')`);
  await query(`DELETE FROM book_characters WHERE book_id IN (SELECT id FROM books WHERE data->>'isTest' = 'true')`);
  await query(`DELETE FROM book_locations WHERE book_id IN (SELECT id FROM books WHERE data->>'isTest' = 'true')`);
  await query(`DELETE FROM book_items WHERE book_id IN (SELECT id FROM books WHERE data->>'isTest' = 'true')`);
  
  // Delete art (references chapters, books, artists)
  await query(`DELETE FROM art WHERE data->>'isTest' = 'true'`);
  
  // Delete chapters (references books)
  await query(`DELETE FROM chapters WHERE data->>'isTest' = 'true'`);
  
  // Delete characters, locations, items (reference series)
  await query(`DELETE FROM characters WHERE data->>'isTest' = 'true'`);
  await query(`DELETE FROM locations WHERE data->>'isTest' = 'true'`);
  await query(`DELETE FROM items WHERE data->>'isTest' = 'true'`);
  
  // Delete books (references series)
  await query(`DELETE FROM books WHERE data->>'isTest' = 'true'`);
  
  // Delete series
  await query(`DELETE FROM series WHERE data->>'isTest' = 'true'`);
  
  // Delete artists
  await query(`DELETE FROM artists WHERE data->>'isTest' = 'true'`);
  
  // Delete test users
  await query(`DELETE FROM users WHERE data->>'isTest' = 'true'`);
}

/**
 * Generate an admin JWT token for testing
 */
export function generateAdminToken(): string {
  return jwt.sign(
    { userId: 'test-admin-id', email: 'admin@test.com', isAdmin: true },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Generate a regular user JWT token for testing
 */
export function generateUserToken(): string {
  return jwt.sign(
    { userId: 'test-user-id', email: 'user@test.com', isAdmin: false },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Test data marker - include this in all test data
 */
export const TEST_DATA_MARKER = { isTest: 'true' };

/**
 * Create test data factory functions
 */
export const testData = {
  series: (overrides = {}) => ({
    title: `Test Series ${Date.now()}`,
    description: 'A test series',
    author: 'Test Author',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  book: (seriesId: string, overrides = {}) => ({
    title: `Test Book ${Date.now()}`,
    author: 'Test Author',
    description: 'A test book',
    seriesId,
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  chapter: (bookId: string, chapterNumber: number, overrides = {}) => ({
    bookId,
    title: `Test Chapter ${chapterNumber}`,
    chapterNumber,
    summary: 'A test chapter summary',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  character: (seriesId: string, overrides = {}) => ({
    seriesId,
    name: `Test Character ${Date.now()}`,
    description: 'A test character',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  location: (seriesId: string, overrides = {}) => ({
    seriesId,
    name: `Test Location ${Date.now()}`,
    description: 'A test location',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  item: (seriesId: string, overrides = {}) => ({
    seriesId,
    name: `Test Item ${Date.now()}`,
    description: 'A test item',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),

  artist: (overrides = {}) => ({
    name: `Test Artist ${Date.now()}`,
    website: 'https://test-artist.com',
    bio: 'A test artist',
    data: TEST_DATA_MARKER,
    ...overrides,
  }),
};

// Global teardown - runs after all tests
afterAll(async () => {
  // Clean up all test data
  await cleanupTestData();
  // Close the database pool
  await pool.end();
});
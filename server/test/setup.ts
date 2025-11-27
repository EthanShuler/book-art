import { pool } from '../src/db';

// Clean up database connection after all tests
afterAll(async () => {
  await pool.end();
});

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

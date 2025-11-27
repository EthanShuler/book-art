import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestUser } from '../helpers';
import { pool } from '../../src/db';

describe('Auth API', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        username: 'newuser'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject duplicate email', async () => {
      const user = {
        email: 'duplicate@example.com',
        password: 'password123',
        username: 'user1'
      };
      
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(user);
      
      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'anotherpassword',
          username: 'user2'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const credentials = {
        email: 'logintest@example.com',
        password: 'testpassword123',
        username: 'loginuser'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(credentials);
      
      // Then try to login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', credentials.email);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject invalid password', async () => {
      // Register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'wrongpass@example.com',
          password: 'correctpassword',
          username: 'wrongpassuser'
        });
      
      // Try to login with wrong password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app).post('/api/auth/logout');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const { user, token } = await createTestUser();
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('Admin user', () => {
    it('should create admin user correctly', async () => {
      const { user } = await createTestUser(true);
      
      // Verify in database
      const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [user.id]);
      expect(result.rows[0].is_admin).toBe(true);
    });
  });
});

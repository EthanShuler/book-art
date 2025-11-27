import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestBook } from '../helpers';

describe('Books API', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/books', () => {
    it('should return an empty array when no books exist', async () => {
      const response = await request(app).get('/api/books');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all books', async () => {
      await createTestBook();
      await createTestBook();
      
      const response = await request(app).get('/api/books');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Test Book');
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return a book by ID', async () => {
      const book = await createTestBook();
      
      const response = await request(app).get(`/api/books/${book.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', book.id);
      expect(response.body).toHaveProperty('title', 'Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/books/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Book not found');
    });
  });

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        description: 'New Description',
        coverImageUrl: 'https://example.com/new.jpg'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(newBook);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Book');
      expect(response.body).toHaveProperty('author', 'New Author');
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update an existing book', async () => {
      const book = await createTestBook();
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description'
      };
      
      const response = await request(app)
        .put(`/api/books/${book.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('description', 'Updated Description');
      // Author should remain unchanged
      expect(response.body).toHaveProperty('author', 'Test Author');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/books/${fakeId}`)
        .send({ title: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete an existing book', async () => {
      const book = await createTestBook();
      
      const response = await request(app).delete(`/api/books/${book.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Book deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/books/${book.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/books/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });
});

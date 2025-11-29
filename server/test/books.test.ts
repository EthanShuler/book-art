import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Books API', () => {
  let adminToken: string;
  let userToken: string;
  let testSeriesId: string;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Create a series for our book tests
    const seriesData = testData.series();
    const response = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(seriesData);
    testSeriesId = response.body.series.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/books', () => {
    it('should return a list of books', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toHaveProperty('books');
      expect(Array.isArray(response.body.books)).toBe(true);
    });
  });

  describe('POST /api/books', () => {
    it('should require authentication', async () => {
      const bookData = testData.book(testSeriesId);

      await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const bookData = testData.book(testSeriesId);

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookData)
        .expect(403);
    });

    it('should create a book with admin token', async () => {
      const bookData = testData.book(testSeriesId);

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body).toHaveProperty('book');
      expect(response.body.book).toHaveProperty('id');
      expect(response.body.book.title).toBe(bookData.title);
      expect(response.body.book.data).toEqual(bookData.data);
    });

    it('should require title', async () => {
      const bookData = testData.book(testSeriesId, { title: undefined });

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(400);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return a specific book', async () => {
      const bookData = testData.book(testSeriesId);
      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData)
        .expect(201);

      const bookId = createResponse.body.book.id;

      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body).toHaveProperty('book');
      expect(response.body.book.id).toBe(bookId);
      expect(response.body.book.title).toBe(bookData.title);
    });

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .get('/api/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/books/:id', () => {
    let testBookId: string;

    beforeAll(async () => {
      const bookData = testData.book(testSeriesId);
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);
      testBookId = response.body.book.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/books/${testBookId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });

    it('should update a book with admin token', async () => {
      const updateData = {
        title: 'Updated Book Title',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('book');
      expect(response.body.book.title).toBe(updateData.title);
      expect(response.body.book.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .put('/api/books/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/books/:id', () => {
    let testBookId: string;

    beforeEach(async () => {
      const bookData = testData.book(testSeriesId);
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);
      testBookId = response.body.book.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/books/${testBookId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete a book with admin token', async () => {
      await request(app)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/books/${testBookId}`)
        .expect(404);
    });

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .delete('/api/books/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

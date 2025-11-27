import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestBook, createTestChapter, createTestArt } from '../helpers';

describe('Chapters API', () => {
  let testBook: any;

  beforeEach(async () => {
    await cleanupTestData();
    testBook = await createTestBook();
  });

  describe('GET /api/chapters/:id', () => {
    it('should return a chapter by ID', async () => {
      const chapter = await createTestChapter(testBook.id);
      
      const response = await request(app).get(`/api/chapters/${chapter.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', chapter.id);
      expect(response.body).toHaveProperty('title', 'Test Chapter');
      expect(response.body).toHaveProperty('chapter_number', 1);
    });

    it('should return 404 for non-existent chapter', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/chapters/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Chapter not found');
    });
  });

  describe('POST /api/chapters', () => {
    it('should create a new chapter', async () => {
      const newChapter = {
        bookId: testBook.id,
        title: 'New Chapter',
        chapterNumber: 5,
        description: 'A new chapter description'
      };
      
      const response = await request(app)
        .post('/api/chapters')
        .send(newChapter);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Chapter');
      expect(response.body).toHaveProperty('chapter_number', 5);
    });
  });

  describe('PUT /api/chapters/:id', () => {
    it('should update an existing chapter', async () => {
      const chapter = await createTestChapter(testBook.id);
      const updates = {
        title: 'Updated Chapter Title',
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/chapters/${chapter.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Chapter Title');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should return 404 for non-existent chapter', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/chapters/${fakeId}`)
        .send({ title: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/chapters/:id', () => {
    it('should delete an existing chapter', async () => {
      const chapter = await createTestChapter(testBook.id);
      
      const response = await request(app).delete(`/api/chapters/${chapter.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Chapter deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/chapters/${chapter.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent chapter', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/chapters/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/chapters/:id/art', () => {
    it('should return art for a chapter', async () => {
      const chapter = await createTestChapter(testBook.id);
      await createTestArt(testBook.id, chapter.id);
      await createTestArt(testBook.id, chapter.id);
      
      const response = await request(app).get(`/api/chapters/${chapter.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when chapter has no art', async () => {
      const chapter = await createTestChapter(testBook.id);
      
      const response = await request(app).get(`/api/chapters/${chapter.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

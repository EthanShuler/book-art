import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Chapters API', () => {
  let adminToken: string;
  let userToken: string;
  let testSeriesId: string;
  let testBookId: string;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Create a series and book for our chapter tests
    const seriesData = testData.series();
    const seriesResponse = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(seriesData);
    testSeriesId = seriesResponse.body.series.id;

    const bookData = testData.book(testSeriesId);
    const bookResponse = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(bookData);
    testBookId = bookResponse.body.book.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/chapters', () => {
    it('should require authentication', async () => {
      const chapterData = testData.chapter(testBookId, 1);

      await request(app)
        .post('/api/chapters')
        .send(chapterData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const chapterData = testData.chapter(testBookId, 1);

      await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(chapterData)
        .expect(403);
    });

    it('should create a chapter with admin token', async () => {
      const chapterData = testData.chapter(testBookId, 1);

      const response = await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(chapterData)
        .expect(201);

      expect(response.body).toHaveProperty('chapter');
      expect(response.body.chapter).toHaveProperty('id');
      expect(response.body.chapter.title).toBe(chapterData.title);
      expect(response.body.chapter.chapterNumber).toBe(chapterData.chapterNumber);
      expect(response.body.chapter.data).toEqual(chapterData.data);
    });

    it('should require bookId, title, and chapterNumber', async () => {
      await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test' })
        .expect(400);
    });
  });

  describe('GET /api/chapters/:id', () => {
    it('should return a specific chapter', async () => {
      const chapterData = testData.chapter(testBookId, 2);
      const createResponse = await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(chapterData)
        .expect(201);

      const chapterId = createResponse.body.chapter.id;

      const response = await request(app)
        .get(`/api/chapters/${chapterId}`)
        .expect(200);

      expect(response.body).toHaveProperty('chapter');
      expect(response.body.chapter.id).toBe(chapterId);
      expect(response.body.chapter.title).toBe(chapterData.title);
    });

    it('should return 404 for non-existent chapter', async () => {
      await request(app)
        .get('/api/chapters/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/chapters/:id', () => {
    let testChapterId: string;

    beforeAll(async () => {
      const chapterData = testData.chapter(testBookId, 3);
      const response = await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(chapterData);
      testChapterId = response.body.chapter.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/chapters/${testChapterId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/chapters/${testChapterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });

    it('should update a chapter with admin token', async () => {
      const updateData = {
        title: 'Updated Chapter Title',
        summary: 'Updated summary',
      };

      const response = await request(app)
        .put(`/api/chapters/${testChapterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('chapter');
      expect(response.body.chapter.title).toBe(updateData.title);
      expect(response.body.chapter.summary).toBe(updateData.summary);
    });

    it('should return 404 for non-existent chapter', async () => {
      await request(app)
        .put('/api/chapters/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/chapters/:id', () => {
    let testChapterId: string;
    let deleteChapterNumber = 100;

    beforeEach(async () => {
      deleteChapterNumber++;
      const chapterData = testData.chapter(testBookId, deleteChapterNumber);
      const response = await request(app)
        .post('/api/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(chapterData);
      testChapterId = response.body.chapter.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/chapters/${testChapterId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/chapters/${testChapterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete a chapter with admin token', async () => {
      await request(app)
        .delete(`/api/chapters/${testChapterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/chapters/${testChapterId}`)
        .expect(404);
    });

    it('should return 404 for non-existent chapter', async () => {
      await request(app)
        .delete('/api/chapters/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

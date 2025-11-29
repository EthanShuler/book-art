import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Series API', () => {
  let adminToken: string;
  let userToken: string;
  let createdSeriesId: string;

  beforeAll(() => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/series', () => {
    it('should return a list of series', async () => {
      const response = await request(app)
        .get('/api/series')
        .expect(200);

      expect(response.body).toHaveProperty('series');
      expect(Array.isArray(response.body.series)).toBe(true);
    });
  });

  describe('POST /api/series', () => {
    it('should require authentication', async () => {
      const seriesData = testData.series();

      await request(app)
        .post('/api/series')
        .send(seriesData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const seriesData = testData.series();

      await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${userToken}`)
        .send(seriesData)
        .expect(403);
    });

    it('should create a series with admin token', async () => {
      const seriesData = testData.series();

      const response = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData)
        .expect(201);

      expect(response.body).toHaveProperty('series');
      expect(response.body.series).toHaveProperty('id');
      expect(response.body.series.title).toBe(seriesData.title);
      expect(response.body.series.data).toEqual(seriesData.data);

      createdSeriesId = response.body.series.id;
    });

    it('should require title', async () => {
      const seriesData = testData.series({ title: undefined });

      await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData)
        .expect(400);
    });
  });

  describe('GET /api/series/:id', () => {
    it('should return a specific series', async () => {
      // First create a series
      const seriesData = testData.series();
      const createResponse = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData)
        .expect(201);

      const seriesId = createResponse.body.series.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/series/${seriesId}`)
        .expect(200);

      expect(response.body).toHaveProperty('series');
      expect(response.body.series.id).toBe(seriesId);
      expect(response.body.series.title).toBe(seriesData.title);
    });

    it('should return 404 for non-existent series', async () => {
      await request(app)
        .get('/api/series/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/series/:id', () => {
    let testSeriesId: string;

    beforeAll(async () => {
      // Create a series to update
      const seriesData = testData.series();
      const response = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      testSeriesId = response.body.series.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/series/${testSeriesId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/series/${testSeriesId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' })
        .expect(403);
    });

    it('should update a series with admin token', async () => {
      const updateData = {
        title: 'Updated Series Title',
        description: 'Updated description',
        data: { isTest: 'true' },
      };

      const response = await request(app)
        .put(`/api/series/${testSeriesId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('series');
      expect(response.body.series.title).toBe(updateData.title);
      expect(response.body.series.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent series', async () => {
      await request(app)
        .put('/api/series/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/series/:id', () => {
    let testSeriesId: string;

    beforeEach(async () => {
      // Create a series to delete
      const seriesData = testData.series();
      const response = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      testSeriesId = response.body.series.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/series/${testSeriesId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/series/${testSeriesId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete a series with admin token', async () => {
      await request(app)
        .delete(`/api/series/${testSeriesId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/series/${testSeriesId}`)
        .expect(404);
    });

    it('should return 404 for non-existent series', async () => {
      await request(app)
        .delete('/api/series/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/series/:id/books', () => {
    it('should return books for a series', async () => {
      // First create a series
      const seriesData = testData.series();
      const seriesResponse = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      const seriesId = seriesResponse.body.series.id;

      // Then get books (should be empty initially)
      const response = await request(app)
        .get(`/api/series/${seriesId}/books`)
        .expect(200);

      expect(response.body).toHaveProperty('books');
      expect(Array.isArray(response.body.books)).toBe(true);
    });
  });

  describe('GET /api/series/:id/characters', () => {
    it('should return characters for a series', async () => {
      const seriesData = testData.series();
      const seriesResponse = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      const seriesId = seriesResponse.body.series.id;

      const response = await request(app)
        .get(`/api/series/${seriesId}/characters`)
        .expect(200);

      expect(response.body).toHaveProperty('characters');
      expect(Array.isArray(response.body.characters)).toBe(true);
    });
  });

  describe('GET /api/series/:id/locations', () => {
    it('should return locations for a series', async () => {
      const seriesData = testData.series();
      const seriesResponse = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      const seriesId = seriesResponse.body.series.id;

      const response = await request(app)
        .get(`/api/series/${seriesId}/locations`)
        .expect(200);

      expect(response.body).toHaveProperty('locations');
      expect(Array.isArray(response.body.locations)).toBe(true);
    });
  });

  describe('GET /api/series/:id/items', () => {
    it('should return items for a series', async () => {
      const seriesData = testData.series();
      const seriesResponse = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(seriesData);
      const seriesId = seriesResponse.body.series.id;

      const response = await request(app)
        .get(`/api/series/${seriesId}/items`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });
});

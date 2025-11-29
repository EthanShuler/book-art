import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Locations API', () => {
  let adminToken: string;
  let userToken: string;
  let testSeriesId: string;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Create a series for our location tests
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

  describe('POST /api/locations', () => {
    it('should require authentication', async () => {
      const locationData = testData.location(testSeriesId);

      await request(app)
        .post('/api/locations')
        .send(locationData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const locationData = testData.location(testSeriesId);

      await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(locationData)
        .expect(403);
    });

    it('should create a location with admin token', async () => {
      const locationData = testData.location(testSeriesId);

      const response = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(locationData)
        .expect(201);

      expect(response.body).toHaveProperty('location');
      expect(response.body.location).toHaveProperty('id');
      expect(response.body.location.name).toBe(locationData.name);
      expect(response.body.location.data).toEqual(locationData.data);
    });
  });

  describe('GET /api/locations/:id', () => {
    it('should return a specific location', async () => {
      const locationData = testData.location(testSeriesId);
      const createResponse = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(locationData)
        .expect(201);

      const locationId = createResponse.body.location.id;

      const response = await request(app)
        .get(`/api/locations/${locationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body.location.id).toBe(locationId);
      expect(response.body.location.name).toBe(locationData.name);
    });

    it('should return 404 for non-existent location', async () => {
      await request(app)
        .get('/api/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/locations/:id', () => {
    let testLocationId: string;

    beforeAll(async () => {
      const locationData = testData.location(testSeriesId);
      const response = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(locationData);
      testLocationId = response.body.location.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/locations/${testLocationId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });

    it('should update a location with admin token', async () => {
      const updateData = {
        name: 'Updated Location Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body.location.name).toBe(updateData.name);
      expect(response.body.location.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent location', async () => {
      await request(app)
        .put('/api/locations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/locations/:id', () => {
    let testLocationId: string;

    beforeEach(async () => {
      const locationData = testData.location(testSeriesId);
      const response = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(locationData);
      testLocationId = response.body.location.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/locations/${testLocationId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete a location with admin token', async () => {
      await request(app)
        .delete(`/api/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/locations/${testLocationId}`)
        .expect(404);
    });

    it('should return 404 for non-existent location', async () => {
      await request(app)
        .delete('/api/locations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

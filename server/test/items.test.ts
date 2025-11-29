import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Items API', () => {
  let adminToken: string;
  let userToken: string;
  let testSeriesId: string;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Create a series for our item tests
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

  describe('POST /api/items', () => {
    it('should require authentication', async () => {
      const itemData = testData.item(testSeriesId);

      await request(app)
        .post('/api/items')
        .send(itemData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const itemData = testData.item(testSeriesId);

      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send(itemData)
        .expect(403);
    });

    it('should create an item with admin token', async () => {
      const itemData = testData.item(testSeriesId);

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item).toHaveProperty('id');
      expect(response.body.item.name).toBe(itemData.name);
      expect(response.body.item.data).toEqual(itemData.data);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item', async () => {
      const itemData = testData.item(testSeriesId);
      const createResponse = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData)
        .expect(201);

      const itemId = createResponse.body.item.id;

      const response = await request(app)
        .get(`/api/items/${itemId}`)
        .expect(200);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item.id).toBe(itemId);
      expect(response.body.item.name).toBe(itemData.name);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .get('/api/items/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/items/:id', () => {
    let testItemId: string;

    beforeAll(async () => {
      const itemData = testData.item(testSeriesId);
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData);
      testItemId = response.body.item.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/items/${testItemId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });

    it('should update an item with admin token', async () => {
      const updateData = {
        name: 'Updated Item Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item.name).toBe(updateData.name);
      expect(response.body.item.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .put('/api/items/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    let testItemId: string;

    beforeEach(async () => {
      const itemData = testData.item(testSeriesId);
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(itemData);
      testItemId = response.body.item.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/items/${testItemId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete an item with admin token', async () => {
      await request(app)
        .delete(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/items/${testItemId}`)
        .expect(404);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .delete('/api/items/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

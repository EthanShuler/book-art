import request from 'supertest';
import app from '../src/index';
import { generateAdminToken, generateUserToken, testData, cleanupTestData } from './setup';

describe('Characters API', () => {
  let adminToken: string;
  let userToken: string;
  let testSeriesId: string;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    userToken = generateUserToken();

    // Create a series for our character tests
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

  describe('POST /api/characters', () => {
    it('should require authentication', async () => {
      const characterData = testData.character(testSeriesId);

      await request(app)
        .post('/api/characters')
        .send(characterData)
        .expect(401);
    });

    it('should require admin role', async () => {
      const characterData = testData.character(testSeriesId);

      await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send(characterData)
        .expect(403);
    });

    it('should create a character with admin token', async () => {
      const characterData = testData.character(testSeriesId);

      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(characterData)
        .expect(201);

      expect(response.body).toHaveProperty('character');
      expect(response.body.character).toHaveProperty('id');
      expect(response.body.character.name).toBe(characterData.name);
      expect(response.body.character.data).toEqual(characterData.data);
    });
  });

  describe('GET /api/characters/:id', () => {
    it('should return a specific character', async () => {
      const characterData = testData.character(testSeriesId);
      const createResponse = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(characterData)
        .expect(201);

      const characterId = createResponse.body.character.id;

      const response = await request(app)
        .get(`/api/characters/${characterId}`)
        .expect(200);

      expect(response.body).toHaveProperty('character');
      expect(response.body.character.id).toBe(characterId);
      expect(response.body.character.name).toBe(characterData.name);
    });

    it('should return 404 for non-existent character', async () => {
      await request(app)
        .get('/api/characters/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /api/characters/:id', () => {
    let testCharacterId: string;

    beforeAll(async () => {
      const characterData = testData.character(testSeriesId);
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(characterData);
      testCharacterId = response.body.character.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/characters/${testCharacterId}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .put(`/api/characters/${testCharacterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });

    it('should update a character with admin token', async () => {
      const updateData = {
        name: 'Updated Character Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/characters/${testCharacterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('character');
      expect(response.body.character.name).toBe(updateData.name);
      expect(response.body.character.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent character', async () => {
      await request(app)
        .put('/api/characters/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/characters/:id', () => {
    let testCharacterId: string;

    beforeEach(async () => {
      const characterData = testData.character(testSeriesId);
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(characterData);
      testCharacterId = response.body.character.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/characters/${testCharacterId}`)
        .expect(401);
    });

    it('should require admin role', async () => {
      await request(app)
        .delete(`/api/characters/${testCharacterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete a character with admin token', async () => {
      await request(app)
        .delete(`/api/characters/${testCharacterId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/characters/${testCharacterId}`)
        .expect(404);
    });

    it('should return 404 for non-existent character', async () => {
      await request(app)
        .delete('/api/characters/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});

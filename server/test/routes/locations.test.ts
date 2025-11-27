import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestBook, createTestLocation, createTestArt } from '../helpers';
import { pool } from '../../src/db';

describe('Locations API', () => {
  let testBook: any;

  beforeEach(async () => {
    await cleanupTestData();
    testBook = await createTestBook();
  });

  describe('GET /api/locations/:id', () => {
    it('should return a location by ID', async () => {
      const location = await createTestLocation(testBook.id);
      
      const response = await request(app).get(`/api/locations/${location.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', location.id);
      expect(response.body).toHaveProperty('name', 'Test Location');
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/locations/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Location not found');
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const newLocation = {
        bookId: testBook.id,
        name: 'New Location',
        description: 'A new location description',
        image: 'https://example.com/newloc.jpg'
      };
      
      const response = await request(app)
        .post('/api/locations')
        .send(newLocation);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Location');
    });
  });

  describe('PUT /api/locations/:id', () => {
    it('should update an existing location', async () => {
      const location = await createTestLocation(testBook.id);
      const updates = {
        name: 'Updated Location Name',
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/locations/${location.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Location Name');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/locations/${fakeId}`)
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('should delete an existing location', async () => {
      const location = await createTestLocation(testBook.id);
      
      const response = await request(app).delete(`/api/locations/${location.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Location deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/locations/${location.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent location', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/locations/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/locations/:id/art', () => {
    it('should return art featuring a location', async () => {
      const location = await createTestLocation(testBook.id);
      const art1 = await createTestArt(testBook.id);
      const art2 = await createTestArt(testBook.id);
      
      // Link art to location via junction table
      await pool.query('INSERT INTO art_locations (art_id, location_id) VALUES ($1, $2)', [art1.id, location.id]);
      await pool.query('INSERT INTO art_locations (art_id, location_id) VALUES ($1, $2)', [art2.id, location.id]);
      
      const response = await request(app).get(`/api/locations/${location.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when location has no art', async () => {
      const location = await createTestLocation(testBook.id);
      
      const response = await request(app).get(`/api/locations/${location.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

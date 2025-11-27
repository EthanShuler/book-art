import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestBook, createTestItem, createTestArt } from '../helpers';
import { pool } from '../../src/db';

describe('Items API', () => {
  let testBook: any;

  beforeEach(async () => {
    await cleanupTestData();
    testBook = await createTestBook();
  });

  describe('GET /api/items/:id', () => {
    it('should return an item by ID', async () => {
      const item = await createTestItem(testBook.id);
      
      const response = await request(app).get(`/api/items/${item.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', item.id);
      expect(response.body).toHaveProperty('name', 'Test Item');
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/items/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        bookId: testBook.id,
        name: 'New Item',
        description: 'A new item description',
        image: 'https://example.com/newitem.jpg'
      };
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Item');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await createTestItem(testBook.id);
      const updates = {
        name: 'Updated Item Name',
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Item Name');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/items/${fakeId}`)
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createTestItem(testBook.id);
      
      const response = await request(app).delete(`/api/items/${item.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/items/${item.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/items/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/items/:id/art', () => {
    it('should return art featuring an item', async () => {
      const item = await createTestItem(testBook.id);
      const art1 = await createTestArt(testBook.id);
      const art2 = await createTestArt(testBook.id);
      
      // Link art to item via junction table
      await pool.query('INSERT INTO art_items (art_id, item_id) VALUES ($1, $2)', [art1.id, item.id]);
      await pool.query('INSERT INTO art_items (art_id, item_id) VALUES ($1, $2)', [art2.id, item.id]);
      
      const response = await request(app).get(`/api/items/${item.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when item has no art', async () => {
      const item = await createTestItem(testBook.id);
      
      const response = await request(app).get(`/api/items/${item.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

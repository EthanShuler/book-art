import request from 'supertest';
import app from '../../src';
import { cleanupTestData, createTestBook, createTestCharacter, createTestArt } from '../helpers';
import { pool } from '../../src/db';

describe('Characters API', () => {
  let testBook: any;

  beforeEach(async () => {
    await cleanupTestData();
    testBook = await createTestBook();
  });

  describe('GET /api/characters/:id', () => {
    it('should return a character by ID', async () => {
      const character = await createTestCharacter(testBook.id);
      
      const response = await request(app).get(`/api/characters/${character.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', character.id);
      expect(response.body).toHaveProperty('name', 'Test Character');
    });

    it('should return 404 for non-existent character', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/characters/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Character not found');
    });
  });

  describe('POST /api/characters', () => {
    it('should create a new character', async () => {
      const newCharacter = {
        bookId: testBook.id,
        name: 'New Character',
        description: 'A new character description',
        image: 'https://example.com/newchar.jpg'
      };
      
      const response = await request(app)
        .post('/api/characters')
        .send(newCharacter);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Character');
    });
  });

  describe('PUT /api/characters/:id', () => {
    it('should update an existing character', async () => {
      const character = await createTestCharacter(testBook.id);
      const updates = {
        name: 'Updated Character Name',
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/characters/${character.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Character Name');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should return 404 for non-existent character', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/characters/${fakeId}`)
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/characters/:id', () => {
    it('should delete an existing character', async () => {
      const character = await createTestCharacter(testBook.id);
      
      const response = await request(app).delete(`/api/characters/${character.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Character deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/characters/${character.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent character', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/characters/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/characters/:id/art', () => {
    it('should return art featuring a character', async () => {
      const character = await createTestCharacter(testBook.id);
      const art1 = await createTestArt(testBook.id);
      const art2 = await createTestArt(testBook.id);
      
      // Link art to character via junction table
      await pool.query('INSERT INTO art_characters (art_id, character_id) VALUES ($1, $2)', [art1.id, character.id]);
      await pool.query('INSERT INTO art_characters (art_id, character_id) VALUES ($1, $2)', [art2.id, character.id]);
      
      const response = await request(app).get(`/api/characters/${character.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when character has no art', async () => {
      const character = await createTestCharacter(testBook.id);
      
      const response = await request(app).get(`/api/characters/${character.id}/art`);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

import request from 'supertest';
import app from '../../src';
import { 
  cleanupTestData, 
  createTestBook, 
  createTestChapter, 
  createTestCharacter, 
  createTestLocation, 
  createTestItem,
  createTestArtist,
  createTestArt 
} from '../helpers';

describe('Art API', () => {
  let testBook: any;
  let testChapter: any;

  beforeEach(async () => {
    await cleanupTestData();
    testBook = await createTestBook();
    testChapter = await createTestChapter(testBook.id);
  });

  describe('GET /api/art', () => {
    it('should return paginated art', async () => {
      await createTestArt(testBook.id, testChapter.id);
      await createTestArt(testBook.id, testChapter.id);
      await createTestArt(testBook.id);
      
      const response = await request(app).get('/api/art');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('art');
      expect(response.body).toHaveProperty('total', 3);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 20);
      expect(response.body.art).toHaveLength(3);
    });

    it('should support pagination parameters', async () => {
      // Create 5 art pieces
      for (let i = 0; i < 5; i++) {
        await createTestArt(testBook.id);
      }
      
      const response = await request(app).get('/api/art?page=2&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.art).toHaveLength(2);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(5);
    });
  });

  describe('GET /api/art/:id', () => {
    it('should return art with associated entities', async () => {
      const artist = await createTestArtist();
      const character = await createTestCharacter(testBook.id);
      const location = await createTestLocation(testBook.id);
      const item = await createTestItem(testBook.id);
      
      // Create art with artist
      const art = await createTestArt(testBook.id, testChapter.id, artist.id);
      
      // Add associations via junction tables
      const { pool } = await import('../../src/db');
      await pool.query('INSERT INTO art_characters (art_id, character_id) VALUES ($1, $2)', [art.id, character.id]);
      await pool.query('INSERT INTO art_locations (art_id, location_id) VALUES ($1, $2)', [art.id, location.id]);
      await pool.query('INSERT INTO art_items (art_id, item_id) VALUES ($1, $2)', [art.id, item.id]);
      
      const response = await request(app).get(`/api/art/${art.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', art.id);
      expect(response.body).toHaveProperty('title', 'Test Art');
      expect(response.body).toHaveProperty('artist');
      expect(response.body.artist).toHaveProperty('name', 'Test Artist');
      expect(response.body).toHaveProperty('characters');
      expect(response.body.characters).toHaveLength(1);
      expect(response.body).toHaveProperty('locations');
      expect(response.body.locations).toHaveLength(1);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
    });

    it('should return 404 for non-existent art', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).get(`/api/art/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Art not found');
    });
  });

  describe('POST /api/art', () => {
    it('should create new art', async () => {
      const newArt = {
        bookId: testBook.id,
        chapterId: testChapter.id,
        title: 'New Art Piece',
        description: 'A beautiful artwork',
        imageUrl: 'https://example.com/newart.jpg',
        tags: ['fantasy', 'landscape']
      };
      
      const response = await request(app)
        .post('/api/art')
        .send(newArt);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Art Piece');
      expect(response.body).toHaveProperty('tags');
      expect(response.body.tags).toContain('fantasy');
    });

    it('should create art with character, location, and item associations', async () => {
      const character = await createTestCharacter(testBook.id);
      const location = await createTestLocation(testBook.id);
      const item = await createTestItem(testBook.id);
      
      const newArt = {
        bookId: testBook.id,
        title: 'Art with Associations',
        description: 'Art featuring multiple entities',
        imageUrl: 'https://example.com/art.jpg',
        characters: [character.id],
        locations: [location.id],
        items: [item.id]
      };
      
      const response = await request(app)
        .post('/api/art')
        .send(newArt);
      
      expect(response.status).toBe(201);
      
      // Verify associations were created
      const getResponse = await request(app).get(`/api/art/${response.body.id}`);
      expect(getResponse.body.characters).toHaveLength(1);
      expect(getResponse.body.locations).toHaveLength(1);
      expect(getResponse.body.items).toHaveLength(1);
    });

    it('should allow creating art without a chapter', async () => {
      const newArt = {
        bookId: testBook.id,
        title: 'Book-level Art',
        description: 'Art not tied to a specific chapter',
        imageUrl: 'https://example.com/bookart.jpg'
      };
      
      const response = await request(app)
        .post('/api/art')
        .send(newArt);
      
      expect(response.status).toBe(201);
      expect(response.body.chapter_id).toBeNull();
    });
  });

  describe('PUT /api/art/:id', () => {
    it('should update an existing art piece', async () => {
      const art = await createTestArt(testBook.id, testChapter.id);
      const updates = {
        title: 'Updated Art Title',
        description: 'Updated description',
        tags: ['updated', 'tags']
      };
      
      const response = await request(app)
        .put(`/api/art/${art.id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Art Title');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('should update art associations', async () => {
      const art = await createTestArt(testBook.id);
      const character1 = await createTestCharacter(testBook.id);
      const character2 = await createTestCharacter(testBook.id);
      
      // First, add character1
      await request(app)
        .put(`/api/art/${art.id}`)
        .send({ characters: [character1.id] });
      
      // Then replace with character2
      const response = await request(app)
        .put(`/api/art/${art.id}`)
        .send({ characters: [character2.id] });
      
      expect(response.status).toBe(200);
      
      // Verify only character2 is associated
      const getResponse = await request(app).get(`/api/art/${art.id}`);
      expect(getResponse.body.characters).toHaveLength(1);
      expect(getResponse.body.characters[0].id).toBe(character2.id);
    });

    it('should return 404 for non-existent art', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/art/${fakeId}`)
        .send({ title: 'Updated' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/art/:id', () => {
    it('should delete an existing art piece', async () => {
      const art = await createTestArt(testBook.id, testChapter.id);
      
      const response = await request(app).delete(`/api/art/${art.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Art deleted successfully');
      
      // Verify it's actually deleted
      const getResponse = await request(app).get(`/api/art/${art.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent art', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app).delete(`/api/art/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/art/search', () => {
    it('should search art by title', async () => {
      await createTestArt(testBook.id);
      
      const response = await request(app).get('/api/art/search?q=Test');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('title', 'Test Art');
    });

    it('should filter by bookId', async () => {
      const book2 = await createTestBook();
      await createTestArt(testBook.id);
      await createTestArt(book2.id);
      
      const response = await request(app).get(`/api/art/search?bookId=${testBook.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should filter by chapterId', async () => {
      await createTestArt(testBook.id, testChapter.id);
      await createTestArt(testBook.id); // No chapter
      
      const response = await request(app).get(`/api/art/search?chapterId=${testChapter.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return empty array when no matches', async () => {
      await createTestArt(testBook.id);
      
      const response = await request(app).get('/api/art/search?q=NonExistent');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});

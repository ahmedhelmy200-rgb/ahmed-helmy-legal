const request = require('supertest');
const app = require('../../src/app');
const { legislationModel } = require('../../src/models');

describe('Legislation API', () => {
  let server;
  let testLegislationId;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(async () => {
    // Clean up test data
    if (testLegislationId) {
      try {
        await legislationModel.findByIdAndDelete(testLegislationId);
      } catch (error) {
        console.log('Cleanup error:', error.message);
      }
    }
  });

  describe('GET /api/legislation', () => {
    it('should retrieve all legislation items', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('status');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support filtering by category', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ category: 'civil' })
        .expect(200);

      expect(response.body.data).toBeDefined();
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('category');
      }
    });

    it('should support searching by title', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ search: 'law' })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ sort: '-createdAt' })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/legislation/:id', () => {
    let legislationId;

    beforeEach(async () => {
      // Create a test legislation item
      const testData = {
        title: 'Test Legislation',
        description: 'Test Description',
        category: 'civil',
        content: 'Test content',
        status: 'active'
      };
      const response = await request(app)
        .post('/api/legislation')
        .send(testData);
      legislationId = response.body.data?._id || response.body.data?.id;
    });

    it('should retrieve a specific legislation item by ID', async () => {
      if (!legislationId) {
        this.skip();
      }
      const response = await request(app)
        .get(`/api/legislation/${legislationId}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('title');
    });

    it('should return 404 for non-existent legislation', async () => {
      await request(app)
        .get('/api/legislation/000000000000000000000000')
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/legislation/invalid-id')
        .expect(400);
    });
  });

  describe('POST /api/legislation', () => {
    it('should create a new legislation item', async () => {
      const legislationData = {
        title: 'New Legislation Act',
        description: 'A new legislation for testing',
        category: 'civil',
        content: 'Full legislation content here',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/legislation')
        .send(legislationData)
        .expect(201);

      testLegislationId = response.body.data._id;
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(legislationData.title);
      expect(response.body.data.category).toBe(legislationData.category);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing title'
      };

      await request(app)
        .post('/api/legislation')
        .send(invalidData)
        .expect(400);
    });

    it('should validate category field', async () => {
      const invalidData = {
        title: 'Test',
        description: 'Test',
        category: 'invalid-category',
        content: 'Test'
      };

      await request(app)
        .post('/api/legislation')
        .send(invalidData)
        .expect(400);
    });

    it('should trim and sanitize input data', async () => {
      const legislationData = {
        title: '  Test Legislation  ',
        description: '  Description  ',
        category: 'civil',
        content: 'Content'
      };

      const response = await request(app)
        .post('/api/legislation')
        .send(legislationData)
        .expect(201);

      testLegislationId = response.body.data._id;
      expect(response.body.data.title).toBe('Test Legislation');
    });

    it('should handle missing optional fields', async () => {
      const legislationData = {
        title: 'Test Legislation',
        description: 'Description',
        category: 'civil',
        content: 'Content'
      };

      const response = await request(app)
        .post('/api/legislation')
        .send(legislationData)
        .expect(201);

      testLegislationId = response.body.data._id;
      expect(response.body.data).toBeDefined();
    });
  });

  describe('PUT /api/legislation/:id', () => {
    let legislationId;

    beforeEach(async () => {
      const testData = {
        title: 'Original Title',
        description: 'Original Description',
        category: 'civil',
        content: 'Original content',
        status: 'active'
      };
      const response = await request(app)
        .post('/api/legislation')
        .send(testData);
      legislationId = response.body.data._id;
    });

    afterEach(async () => {
      if (legislationId) {
        await legislationModel.findByIdAndDelete(legislationId);
      }
    });

    it('should update a legislation item', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/legislation/${legislationId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should validate updated fields', async () => {
      const updateData = {
        category: 'invalid-category'
      };

      await request(app)
        .put(`/api/legislation/${legislationId}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 404 for non-existent legislation', async () => {
      await request(app)
        .put('/api/legislation/000000000000000000000000')
        .send({ title: 'Test' })
        .expect(404);
    });

    it('should preserve unchanged fields', async () => {
      const originalData = await request(app)
        .get(`/api/legislation/${legislationId}`);
      const originalCategory = originalData.body.data.category;

      const updateData = {
        title: 'New Title'
      };

      const response = await request(app)
        .put(`/api/legislation/${legislationId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.category).toBe(originalCategory);
    });
  });

  describe('DELETE /api/legislation/:id', () => {
    let legislationId;

    beforeEach(async () => {
      const testData = {
        title: 'To Be Deleted',
        description: 'Test',
        category: 'civil',
        content: 'Test'
      };
      const response = await request(app)
        .post('/api/legislation')
        .send(testData);
      legislationId = response.body.data._id;
    });

    it('should delete a legislation item', async () => {
      await request(app)
        .delete(`/api/legislation/${legislationId}`)
        .expect(200);

      await request(app)
        .get(`/api/legislation/${legislationId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent item', async () => {
      await request(app)
        .delete('/api/legislation/000000000000000000000000')
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .delete('/api/legislation/invalid-id')
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const response = await request(app)
        .get('/api/legislation/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid JSON in request body', async () => {
      await request(app)
        .post('/api/legislation')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('Legislation Filtering & Advanced Queries', () => {
    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ status: 'active' })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({ 
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/legislation')
        .query({
          category: 'civil',
          status: 'active',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });
});

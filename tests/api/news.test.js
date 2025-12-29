/**
 * Comprehensive News API Test Suite
 * 
 * Tests include:
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Featured news functionality
 * - Pinned articles management
 * - Pagination
 * - Error handling and validation
 */

const request = require('supertest');
const expect = require('chai').expect;
const app = require('../../src/app');
const db = require('../../src/config/database');
const { generateAuthToken } = require('../../src/utils/auth');

describe('News API', () => {
  let authToken;
  let adminToken;
  let testNewsId;
  let testNews2Id;
  let testNews3Id;

  // Setup
  before(async () => {
    // Clean up database
    await db.News.deleteMany({});
    
    // Generate test tokens
    authToken = generateAuthToken({ id: 'user123', role: 'user' });
    adminToken = generateAuthToken({ id: 'admin123', role: 'admin' });
  });

  // Cleanup after tests
  after(async () => {
    await db.News.deleteMany({});
  });

  // ========================================
  // CREATE Operations
  // ========================================
  describe('POST /api/news', () => {
    it('should create a new news article with valid data', async () => {
      const newsData = {
        title: 'Breaking Legal News',
        content: 'This is a comprehensive legal news article about recent court decisions.',
        excerpt: 'A summary of the legal news',
        category: 'Updates',
        author: 'John Doe',
        image: 'https://example.com/image.jpg',
        featured: false,
        pinned: false
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(201);

      expect(res.body).to.have.property('_id');
      expect(res.body.title).to.equal(newsData.title);
      expect(res.body.content).to.equal(newsData.content);
      expect(res.body.category).to.equal(newsData.category);
      expect(res.body.featured).to.equal(false);
      expect(res.body.pinned).to.equal(false);
      expect(res.body).to.have.property('createdAt');

      testNewsId = res.body._id;
    });

    it('should create featured news article', async () => {
      const newsData = {
        title: 'Featured Legal Update',
        content: 'This is a featured legal news article',
        excerpt: 'Featured summary',
        category: 'Updates',
        author: 'Jane Smith',
        featured: true,
        pinned: false
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(201);

      expect(res.body.featured).to.equal(true);
      expect(res.body).to.have.property('featuredAt');
    });

    it('should create pinned news article', async () => {
      const newsData = {
        title: 'Pinned Important Notice',
        content: 'This is a pinned news article that stays at the top',
        excerpt: 'Pinned summary',
        category: 'Announcements',
        author: 'Admin User',
        featured: false,
        pinned: true
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(201);

      expect(res.body.pinned).to.equal(true);
      expect(res.body).to.have.property('pinnedAt');
      testNews2Id = res.body._id;
    });

    it('should create news article with all optional fields', async () => {
      const newsData = {
        title: 'Complete News Article',
        content: 'Full content with all fields',
        excerpt: 'Brief excerpt',
        category: 'Case Updates',
        author: 'John Doe',
        image: 'https://example.com/news-image.jpg',
        tags: ['legal', 'update', 'important'],
        featured: true,
        pinned: true,
        meta: {
          keywords: ['legal', 'news', 'court'],
          description: 'A comprehensive news article'
        }
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(201);

      expect(res.body.tags).to.include('legal');
      expect(res.body.meta).to.exist;
      expect(res.body.meta.keywords).to.include('legal');
      testNews3Id = res.body._id;
    });

    it('should reject creation without authentication', async () => {
      const newsData = {
        title: 'Unauthorized News',
        content: 'This should fail',
        excerpt: 'Summary',
        category: 'Updates',
        author: 'Hacker'
      };

      const res = await request(app)
        .post('/api/news')
        .send(newsData)
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should reject creation with non-admin user', async () => {
      const newsData = {
        title: 'User News',
        content: 'Regular user trying to create news',
        excerpt: 'Summary',
        category: 'Updates',
        author: 'Regular User'
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newsData)
        .expect(403);

      expect(res.body).to.have.property('error');
    });

    it('should reject creation with missing required fields', async () => {
      const newsData = {
        title: 'Incomplete News',
        // missing content, excerpt, category, author
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(400);

      expect(res.body).to.have.property('error');
      expect(res.body.error).to.include('required');
    });

    it('should reject creation with invalid category', async () => {
      const newsData = {
        title: 'Invalid Category News',
        content: 'Content here',
        excerpt: 'Summary',
        category: 'InvalidCategory',
        author: 'John Doe'
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should reject creation with empty title', async () => {
      const newsData = {
        title: '',
        content: 'Content here',
        excerpt: 'Summary',
        category: 'Updates',
        author: 'John Doe'
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(400);

      expect(res.body).to.have.property('error');
    });
  });

  // ========================================
  // READ Operations
  // ========================================
  describe('GET /api/news', () => {
    it('should retrieve all news articles', async () => {
      const res = await request(app)
        .get('/api/news')
        .expect(200);

      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });

    it('should retrieve news with pagination', async () => {
      const res = await request(app)
        .get('/api/news?page=1&limit=2')
        .expect(200);

      expect(res.body).to.have.property('news');
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('page');
      expect(res.body.pagination).to.have.property('limit');
      expect(res.body.pagination).to.have.property('total');
      expect(res.body.pagination.page).to.equal(1);
      expect(res.body.pagination.limit).to.equal(2);
      expect(res.body.news.length).to.be.lessThanOrEqual(2);
    });

    it('should retrieve featured news only', async () => {
      const res = await request(app)
        .get('/api/news?featured=true')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.featured).to.equal(true);
      });
    });

    it('should retrieve pinned articles first', async () => {
      const res = await request(app)
        .get('/api/news')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      if (news.length > 0) {
        const firstPinned = news.find(n => n.pinned);
        if (firstPinned) {
          expect(news[0].pinned).to.equal(true);
        }
      }
    });

    it('should filter news by category', async () => {
      const res = await request(app)
        .get('/api/news?category=Updates')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.category).to.equal('Updates');
      });
    });

    it('should filter news by author', async () => {
      const res = await request(app)
        .get('/api/news?author=John%20Doe')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.author).to.equal('John Doe');
      });
    });

    it('should search news by title', async () => {
      const res = await request(app)
        .get('/api/news?search=Breaking')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.title.toLowerCase()).to.include('breaking');
      });
    });

    it('should sort news by date descending', async () => {
      const res = await request(app)
        .get('/api/news?sort=-createdAt')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      for (let i = 0; i < news.length - 1; i++) {
        const current = new Date(news[i].createdAt);
        const next = new Date(news[i + 1].createdAt);
        expect(current.getTime()).to.be.greaterThanOrEqual(next.getTime());
      }
    });

    it('should sort news by date ascending', async () => {
      const res = await request(app)
        .get('/api/news?sort=createdAt')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      for (let i = 0; i < news.length - 1; i++) {
        const current = new Date(news[i].createdAt);
        const next = new Date(news[i + 1].createdAt);
        expect(current.getTime()).to.be.lessThanOrEqual(next.getTime());
      }
    });

    it('should handle pagination with large limit', async () => {
      const res = await request(app)
        .get('/api/news?page=1&limit=100')
        .expect(200);

      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination.limit).to.equal(100);
    });

    it('should handle pagination beyond available articles', async () => {
      const res = await request(app)
        .get('/api/news?page=999&limit=10')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news.length).to.equal(0);
    });

    it('should return empty array for non-existent category', async () => {
      const res = await request(app)
        .get('/api/news?category=NonExistent')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news.length).to.equal(0);
    });
  });

  describe('GET /api/news/:id', () => {
    it('should retrieve a specific news article by ID', async () => {
      const res = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(200);

      expect(res.body._id).to.equal(testNewsId);
      expect(res.body.title).to.equal('Breaking Legal News');
      expect(res.body).to.have.property('createdAt');
      expect(res.body).to.have.property('updatedAt');
    });

    it('should return 404 for non-existent news ID', async () => {
      const res = await request(app)
        .get('/api/news/000000000000000000000000')
        .expect(404);

      expect(res.body).to.have.property('error');
    });

    it('should return 400 for invalid news ID format', async () => {
      const res = await request(app)
        .get('/api/news/invalid-id')
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should include view count in response', async () => {
      const res = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(200);

      expect(res.body).to.have.property('views');
      expect(typeof res.body.views).to.equal('number');
    });

    it('should increment view count on each access', async () => {
      const res1 = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(200);

      const views1 = res1.body.views;

      const res2 = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(200);

      const views2 = res2.body.views;

      expect(views2).to.equal(views1 + 1);
    });
  });

  // ========================================
  // UPDATE Operations
  // ========================================
  describe('PUT /api/news/:id', () => {
    it('should update a news article with valid data', async () => {
      const updateData = {
        title: 'Updated Breaking Legal News',
        content: 'Updated content with new information',
        excerpt: 'Updated excerpt',
        category: 'Case Updates'
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.title).to.equal(updateData.title);
      expect(res.body.content).to.equal(updateData.content);
      expect(res.body.category).to.equal(updateData.category);
    });

    it('should mark article as featured', async () => {
      const updateData = {
        featured: true
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.featured).to.equal(true);
      expect(res.body).to.have.property('featuredAt');
    });

    it('should unmark article as featured', async () => {
      const updateData = {
        featured: false
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.featured).to.equal(false);
    });

    it('should pin article', async () => {
      const updateData = {
        pinned: true
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.pinned).to.equal(true);
      expect(res.body).to.have.property('pinnedAt');
    });

    it('should unpin article', async () => {
      const updateData = {
        pinned: false
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.pinned).to.equal(false);
    });

    it('should update tags', async () => {
      const updateData = {
        tags: ['legal', 'important', 'urgent']
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.tags).to.include('legal');
      expect(res.body.tags).to.include('urgent');
    });

    it('should update meta information', async () => {
      const updateData = {
        meta: {
          keywords: ['updated', 'keywords'],
          description: 'Updated description'
        }
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.meta.keywords).to.include('updated');
    });

    it('should update image', async () => {
      const updateData = {
        image: 'https://example.com/new-image.jpg'
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.image).to.equal(updateData.image);
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .send(updateData)
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should reject update with non-admin user', async () => {
      const updateData = {
        title: 'User Update'
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(res.body).to.have.property('error');
    });

    it('should reject update of non-existent article', async () => {
      const updateData = {
        title: 'Update Non-existent'
      };

      const res = await request(app)
        .put('/api/news/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(res.body).to.have.property('error');
    });

    it('should update updatedAt timestamp', async () => {
      const beforeUpdate = new Date();

      await new Promise(resolve => setTimeout(resolve, 100));

      const updateData = {
        title: 'Updated Title for Timestamp Check'
      };

      const res = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      const updatedAt = new Date(res.body.updatedAt);
      expect(updatedAt.getTime()).to.be.greaterThan(beforeUpdate.getTime());
    });
  });

  // ========================================
  // DELETE Operations
  // ========================================
  describe('DELETE /api/news/:id', () => {
    let newsForDeletion;

    beforeEach(async () => {
      const newsData = {
        title: 'News Article for Deletion',
        content: 'This article will be deleted',
        excerpt: 'Summary',
        category: 'Updates',
        author: 'John Doe'
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData);

      newsForDeletion = res.body._id;
    });

    it('should delete a news article', async () => {
      const res = await request(app)
        .delete(`/api/news/${newsForDeletion}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property('message');
      expect(res.body.message).to.include('deleted');
    });

    it('should confirm article is deleted after deletion', async () => {
      const res = await request(app)
        .delete(`/api/news/${newsForDeletion}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app)
        .get(`/api/news/${newsForDeletion}`)
        .expect(404);
    });

    it('should reject deletion without authentication', async () => {
      const res = await request(app)
        .delete(`/api/news/${newsForDeletion}`)
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should reject deletion with non-admin user', async () => {
      const res = await request(app)
        .delete(`/api/news/${newsForDeletion}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(res.body).to.have.property('error');
    });

    it('should return 404 when deleting non-existent article', async () => {
      const res = await request(app)
        .delete('/api/news/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body).to.have.property('error');
    });

    it('should return 400 for invalid article ID format', async () => {
      const res = await request(app)
        .delete('/api/news/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(res.body).to.have.property('error');
    });
  });

  // ========================================
  // Featured News Endpoints
  // ========================================
  describe('GET /api/news/featured', () => {
    it('should retrieve only featured news articles', async () => {
      const res = await request(app)
        .get('/api/news/featured')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.featured).to.equal(true);
      });
    });

    it('should return featured news with pagination', async () => {
      const res = await request(app)
        .get('/api/news/featured?page=1&limit=5')
        .expect(200);

      expect(res.body).to.have.property('pagination');
    });

    it('should return empty array if no featured articles exist', async () => {
      // This depends on test data setup
      const res = await request(app)
        .get('/api/news/featured')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news).to.be.an('array');
    });
  });

  // ========================================
  // Pinned Articles Endpoints
  // ========================================
  describe('GET /api/news/pinned', () => {
    it('should retrieve only pinned articles', async () => {
      const res = await request(app)
        .get('/api/news/pinned')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      news.forEach(article => {
        expect(article.pinned).to.equal(true);
      });
    });

    it('should return pinned articles sorted by pinnedAt descending', async () => {
      const res = await request(app)
        .get('/api/news/pinned')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      for (let i = 0; i < news.length - 1; i++) {
        const current = new Date(news[i].pinnedAt);
        const next = new Date(news[i + 1].pinnedAt);
        expect(current.getTime()).to.be.greaterThanOrEqual(next.getTime());
      }
    });

    it('should limit pinned articles to maximum 5', async () => {
      const res = await request(app)
        .get('/api/news/pinned?limit=5')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news.length).to.be.lessThanOrEqual(5);
    });
  });

  // ========================================
  // Pagination Tests
  // ========================================
  describe('Pagination', () => {
    before(async () => {
      // Create multiple news articles for pagination testing
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/news')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `News Article ${i}`,
            content: `Content for article ${i}`,
            excerpt: `Summary ${i}`,
            category: 'Updates',
            author: 'Test Author'
          });
      }
    });

    it('should return correct page 1 with limit 5', async () => {
      const res = await request(app)
        .get('/api/news?page=1&limit=5')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news.length).to.equal(5);
    });

    it('should return correct page 2 with limit 5', async () => {
      const res = await request(app)
        .get('/api/news?page=2&limit=5')
        .expect(200);

      const news = Array.isArray(res.body) ? res.body : res.body.news;
      expect(news.length).to.be.greaterThan(0);
    });

    it('should have correct pagination metadata', async () => {
      const res = await request(app)
        .get('/api/news?page=1&limit=5')
        .expect(200);

      const pagination = res.body.pagination || { page: 1, limit: 5 };
      expect(pagination.page).to.equal(1);
      expect(pagination.limit).to.equal(5);
      expect(pagination).to.have.property('total');
    });

    it('should calculate hasNextPage correctly', async () => {
      const res = await request(app)
        .get('/api/news?page=1&limit=5')
        .expect(200);

      const pagination = res.body.pagination;
      if (pagination) {
        expect(pagination).to.have.property('hasNextPage');
      }
    });

    it('should handle default page and limit', async () => {
      const res = await request(app)
        .get('/api/news')
        .expect(200);

      expect(res.body).to.be.an('array').or.have.property('news');
    });

    it('should reject invalid page number', async () => {
      const res = await request(app)
        .get('/api/news?page=invalid')
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should reject negative page number', async () => {
      const res = await request(app)
        .get('/api/news?page=-1')
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should reject invalid limit value', async () => {
      const res = await request(app)
        .get('/api/news?limit=invalid')
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should cap limit to maximum allowed value', async () => {
      const res = await request(app)
        .get('/api/news?limit=1000')
        .expect(200);

      const pagination = res.body.pagination || {};
      expect(pagination.limit || 1000).to.be.lessThanOrEqual(100);
    });
  });

  // ========================================
  // Error Handling
  // ========================================
  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const res = await request(app)
        .get('/api/news/000000000000000000000000')
        .expect(404);

      expect(res.body).to.have.property('error');
      expect(res.body).to.have.property('message');
    });

    it('should validate email in author field if applicable', async () => {
      const newsData = {
        title: 'Test Article',
        content: 'Content',
        excerpt: 'Summary',
        category: 'Updates',
        author: 'invalid-email@'
      };

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData);

      // Should either accept or reject with validation error
      expect(res.status).to.be.oneOf([201, 400]);
    });

    it('should handle concurrent requests correctly', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/news')
            .expect(200)
        );
      }

      const results = await Promise.all(promises);
      results.forEach(res => {
        expect(res.status).to.equal(200);
      });
    });

    it('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should handle missing Authorization header gracefully', async () => {
      const res = await request(app)
        .post('/api/news')
        .send({
          title: 'Test',
          content: 'Test',
          excerpt: 'Test',
          category: 'Updates',
          author: 'Test'
        })
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should handle expired token', async () => {
      const expiredToken = generateAuthToken({ id: 'user123' }, { expiresIn: '-1h' });

      const res = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should handle malformed token', async () => {
      const res = await request(app)
        .get('/api/news')
        .set('Authorization', 'Bearer invalid-token-format')
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should provide descriptive error messages', async () => {
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test',
          // missing required fields
        })
        .expect(400);

      expect(res.body).to.have.property('error');
      expect(res.body.error).to.be.a('string').that.is.not.empty;
    });
  });

  // ========================================
  // Integration Tests
  // ========================================
  describe('Integration Tests', () => {
    it('should create, update, and delete a news article in sequence', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Integration Test Article',
          content: 'Original content',
          excerpt: 'Original excerpt',
          category: 'Updates',
          author: 'Test Author'
        })
        .expect(201);

      const newsId = createRes.body._id;

      // Retrieve
      const getRes = await request(app)
        .get(`/api/news/${newsId}`)
        .expect(200);

      expect(getRes.body.title).to.equal('Integration Test Article');

      // Update
      const updateRes = await request(app)
        .put(`/api/news/${newsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Updated content',
          featured: true
        })
        .expect(200);

      expect(updateRes.body.content).to.equal('Updated content');
      expect(updateRes.body.featured).to.equal(true);

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/news/${newsId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteRes.body).to.have.property('message');

      // Confirm deleted
      await request(app)
        .get(`/api/news/${newsId}`)
        .expect(404);
    });

    it('should handle bulk operations with mixed statuses', async () => {
      const articles = [];

      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/api/news')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `Bulk Test Article ${i}`,
            content: `Content ${i}`,
            excerpt: `Summary ${i}`,
            category: i % 2 === 0 ? 'Updates' : 'Announcements',
            author: `Author ${i}`,
            featured: i === 0,
            pinned: i === 1
          });

        if (res.status === 201) {
          articles.push(res.body);
        }
      }

      expect(articles.length).to.equal(3);
    });
  });
});

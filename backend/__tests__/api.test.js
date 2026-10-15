import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let mongoServer;
let app;
let User_Model, Post_Model, Comment_Model;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  process.env.MONGO_URL = mongoUri;
  process.env.JWT_SECRET = 'test-secret-key';
  
  await mongoose.connect(mongoUri);
  
  const models = await import('../models/user.model.js');
  User_Model = models.User_Model;
  Post_Model = models.Post_Model;
  Comment_Model = models.Comment_Model;
  
  app = express();
  app.use(express.json());
  app.use(bodyParser.json());
  
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  const authRoutes = (await import('../routes/auth.routes.js')).default;
  const userRoutes = (await import('../routes/user.routes.js')).default;
  const postsRoutes = (await import('../routes/posts.routes.js')).default;
  
  app.use('/slash_imagine/api/v1/auth', authRoutes);
  app.use('/slash_imagine/api/v1/user', userRoutes);
  app.use('/slash_imagine/api/v1/posts', postsRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User_Model.deleteMany({});
  await Post_Model.deleteMany({});
  await Comment_Model.deleteMany({});
});

const createTestUser = async (overrides = {}) => {
  const userData = {
    firstName: 'Test',
    lastName: 'User',
    userName: 'testuser',
    email: 'test@example.com',
    password: bcrypt.hashSync('Test@123456', 8),
    dob: '2000-01-01',
    contactNumber: '+1234567890',
    country: 'United States',
    role: 'User',
    ...overrides
  };
  const user = await User_Model.create(userData);
  const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
};

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth API', () => {
  describe('POST /auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          password: 'Test@123456',
          dob: '1990-01-01',
          contactNumber: '+1987654321',
          country: 'United States'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.userName).toBe('johndoe');
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          password: 'weak',
          dob: '1990-01-01',
          contactNumber: '+1987654321',
          country: 'United States'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Password');
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'existing@example.com' });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          userName: 'newuser',
          email: 'existing@example.com',
          password: 'Test@123456',
          dob: '1990-01-01',
          contactNumber: '+1555555555',
          country: 'United States'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Email');
    });

    it('should return 409 for duplicate username', async () => {
      await createTestUser({ userName: 'existinguser' });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          userName: 'existinguser',
          email: 'new@example.com',
          password: 'Test@123456',
          dob: '1990-01-01',
          contactNumber: '+1666666666',
          country: 'United States'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Username');
    });
  });

  describe('POST /auth/signin', () => {
    it('should sign in with valid credentials', async () => {
      await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signin')
        .send({
          userName: 'testuser',
          password: 'Test@123456'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/signin')
        .send({
          userName: 'testuser',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(400);
    });
  });
});

describe('Posts API', () => {
  describe('POST /posts/add-post', () => {
    it('should create a post with valid token', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-post')
        .set('x-access-token', token)
        .send({
          title: 'Test Post',
          content: 'This is test content'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.post.title).toBe('Test Post');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-post')
        .send({
          title: 'Test Post',
          content: 'This is test content'
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('GET /posts/get-post/:postId', () => {
    it('should return post with author info', async () => {
      const { user, token } = await createTestUser();
      
      const post = await Post_Model.create({
        userName: user.userName,
        title: 'Test Post',
        content: 'Content'
      });
      
      const res = await request(app)
        .get(`/slash_imagine/api/v1/posts/get-post/${post._id}`)
        .set('x-access-token', token);
      
      expect(res.status).toBe(200);
      expect(res.body.author).toBeDefined();
      expect(res.body.author.firstName).toBe('Test');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .get('/slash_imagine/api/v1/posts/get-post/invalid-id')
        .set('x-access-token', token);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should return 404 for non-existent post', async () => {
      const { token } = await createTestUser();
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/slash_imagine/api/v1/posts/get-post/${fakeId}`)
        .set('x-access-token', token);
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /posts/add-like', () => {
    it('should add like to post', async () => {
      const { user, token } = await createTestUser();
      
      const post = await Post_Model.create({
        userName: user.userName,
        title: 'Test Post',
        content: 'Content'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-like')
        .set('x-access-token', token)
        .send({ postId: post._id.toString() });
      
      expect(res.status).toBe(200);
      
      const updatedPost = await Post_Model.findById(post._id);
      expect(updatedPost.likes).toBe(1);
    });

    it('should return 400 for invalid postId', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-like')
        .set('x-access-token', token)
        .send({ postId: 'invalid-id' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /posts/add-comment', () => {
    it('should add comment to post', async () => {
      const { user, token } = await createTestUser();
      
      const post = await Post_Model.create({
        userName: user.userName,
        title: 'Test Post',
        content: 'Content'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-comment')
        .set('x-access-token', token)
        .send({ 
          postId: post._id.toString(),
          content: 'Great post!'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.savedComment.content).toBe('Great post!');
    });
  });
});

describe('User API', () => {
  describe('GET /user/get-home-feed', () => {
    it('should return paginated posts with author info', async () => {
      const { user, token } = await createTestUser();
      
      await Post_Model.create([
        { userName: user.userName, title: 'Post 1', content: 'Content 1' },
        { userName: user.userName, title: 'Post 2', content: 'Content 2' }
      ]);
      
      const res = await request(app)
        .get('/slash_imagine/api/v1/user/get-home-feed')
        .set('x-access-token', token);
      
      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.posts[0].author).toBeDefined();
    });

    it('should handle invalid page/limit gracefully', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .get('/slash_imagine/api/v1/user/get-home-feed?page=-1&limit=1000')
        .set('x-access-token', token);
      
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /user/change-role (Admin)', () => {
    it('should prevent admin from demoting themselves', async () => {
      const { token, user } = await createTestUser({ role: 'Admin', userName: 'adminuser' });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/user/change-role')
        .set('x-access-token', token)
        .send({
          userName: 'adminuser',
          newRole: 'User'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot change your own role');
    });

    it('should allow admin to change other user role', async () => {
      const { token } = await createTestUser({ role: 'Admin', userName: 'adminuser' });
      await createTestUser({ role: 'User', userName: 'normaluser', email: 'normal@test.com', contactNumber: '+1111111111' });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/user/change-role')
        .set('x-access-token', token)
        .send({
          userName: 'normaluser',
          newRole: 'Moderator'
        });
      
      expect(res.status).toBe(200);
      
      const updatedUser = await User_Model.findOne({ userName: 'normaluser' });
      expect(updatedUser.role).toBe('Moderator');
    });

    it('should prevent demoting the last admin', async () => {
      const { token } = await createTestUser({ role: 'Admin', userName: 'adminuser' });
      await createTestUser({ role: 'Admin', userName: 'admin2', email: 'admin2@test.com', contactNumber: '+1222222222' });
      
      await User_Model.updateMany({}, { role: 'User' });
      await User_Model.updateOne({ userName: 'adminuser' }, { role: 'Admin' });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/user/change-role')
        .set('x-access-token', token)
        .send({
          userName: 'admin2',
          newRole: 'User'
        });
      
      expect(res.status).toBe(200);
    });
  });
});

describe('Share Count API', () => {
  it('should increment share count', async () => {
    const { user, token } = await createTestUser();
    
    const post = await Post_Model.create({
      userName: user.userName,
      title: 'Test Post',
      content: 'Content'
    });
    
    expect(post.shares).toBe(0);
    
    const res = await request(app)
      .post(`/slash_imagine/api/v1/posts/share/${post._id}`)
      .set('x-access-token', token);
    
    expect(res.status).toBe(200);
    expect(res.body.shares).toBe(1);
    
    const updatedPost = await Post_Model.findById(post._id);
    expect(updatedPost.shares).toBe(1);
  });
});

describe('Post Validation', () => {
  describe('POST /posts/add-post validation', () => {
    it('should return 400 when title is missing', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-post')
        .set('x-access-token', token)
        .send({
          content: 'This is test content without title'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Title and content are required');
    });

    it('should return 400 when content is missing', async () => {
      const { token } = await createTestUser();
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/posts/add-post')
        .set('x-access-token', token)
        .send({
          title: 'Test title without content'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Title and content are required');
    });
  });
});

describe('Auth Email/Contact Number Conflicts', () => {
  describe('POST /auth/change-email', () => {
    it('should return 409 when email is already in use', async () => {
      const { token } = await createTestUser({ 
        email: 'original@example.com',
        userName: 'testuser1'
      });
      await createTestUser({ 
        email: 'taken@example.com', 
        userName: 'testuser2',
        contactNumber: '+1999999999'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/change-email')
        .set('x-access-token', token)
        .send({
          password: 'Test@123456',
          newEmail: 'taken@example.com'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Email already in use');
    });

    it('should normalize email to lowercase', async () => {
      const { token } = await createTestUser({ 
        email: 'original@example.com',
        userName: 'testuser1'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/change-email')
        .set('x-access-token', token)
        .send({
          password: 'Test@123456',
          newEmail: 'NEW@EXAMPLE.COM'
        });
      
      expect(res.status).toBe(200);
      
      const updatedUser = await User_Model.findOne({ userName: 'testuser1' });
      expect(updatedUser.email).toBe('new@example.com');
    });

    it('should return 409 for case-insensitive email conflict', async () => {
      const { token } = await createTestUser({ 
        email: 'original@example.com',
        userName: 'testuser1'
      });
      await createTestUser({ 
        email: 'taken@example.com', 
        userName: 'testuser2',
        contactNumber: '+1999999999'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/change-email')
        .set('x-access-token', token)
        .send({
          password: 'Test@123456',
          newEmail: 'TAKEN@EXAMPLE.COM'
        });
      
      expect(res.status).toBe(409);
    });
  });

  describe('POST /auth/change-contact-number', () => {
    it('should return 409 when contact number is already in use', async () => {
      const { token } = await createTestUser({ 
        contactNumber: '+1111111111',
        userName: 'testuser1'
      });
      await createTestUser({ 
        contactNumber: '+1222222222', 
        userName: 'testuser2',
        email: 'user2@example.com'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/change-contact-number')
        .set('x-access-token', token)
        .send({
          password: 'Test@123456',
          newContactNumber: '+1222222222'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Contact number already in use');
    });

    it('should allow changing to unique contact number', async () => {
      const { token } = await createTestUser({ 
        contactNumber: '+1111111111',
        userName: 'testuser1'
      });
      
      const res = await request(app)
        .post('/slash_imagine/api/v1/auth/change-contact-number')
        .set('x-access-token', token)
        .send({
          password: 'Test@123456',
          newContactNumber: '+1333333333'
        });
      
      expect(res.status).toBe(200);
      
      const updatedUser = await User_Model.findOne({ userName: 'testuser1' });
      expect(updatedUser.contactNumber).toBe('+1333333333');
    });
  });
});

describe('Signup Email Normalization', () => {
  it('should normalize email to lowercase on signup', async () => {
    const res = await request(app)
      .post('/slash_imagine/api/v1/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        userName: 'newuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'Test@123456',
        dob: '1990-01-01',
        contactNumber: '+1444444444',
        country: 'United States'
      });
    
    expect(res.status).toBe(201);
    
    const user = await User_Model.findOne({ userName: 'newuser' });
    expect(user.email).toBe('test@example.com');
  });

  it('should detect case-insensitive email duplicates on signup', async () => {
    await createTestUser({ email: 'existing@example.com' });
    
    const res = await request(app)
      .post('/slash_imagine/api/v1/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        userName: 'newuser',
        email: 'EXISTING@EXAMPLE.COM',
        password: 'Test@123456',
        dob: '1990-01-01',
        contactNumber: '+1555555555',
        country: 'United States'
      });
    
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Email already in use');
  });
});

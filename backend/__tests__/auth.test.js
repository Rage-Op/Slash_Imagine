import { jest } from '@jest/globals';

describe('Auth Middleware', () => {
  const mockReq = {};
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should return 401 when no token is provided', async () => {
      const { verifyToken } = await import('../middlewares/auth.mw.js');
      
      mockReq.headers = {};
      
      await verifyToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ message: 'Access Denied! No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      const { verifyToken } = await import('../middlewares/auth.mw.js');
      
      mockReq.headers = { 'x-access-token': 'invalid-token' };
      
      await verifyToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Bearer prefix correctly', async () => {
      const { verifyToken } = await import('../middlewares/auth.mw.js');
      
      mockReq.headers = { 'x-access-token': 'Bearer invalid-token' };
      
      await verifyToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});

describe('Signup Validation', () => {
  const mockReq = { body: {} };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require firstName', async () => {
    const { verifySignUpBody } = await import('../middlewares/auth.mw.js');
    
    mockReq.body = {};
    
    await verifySignUpBody(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'First name is required' });
  });

  it('should require lastName', async () => {
    const { verifySignUpBody } = await import('../middlewares/auth.mw.js');
    
    mockReq.body = { firstName: 'John' };
    
    await verifySignUpBody(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Last name is required' });
  });

  it('should require email', async () => {
    const { verifySignUpBody } = await import('../middlewares/auth.mw.js');
    
    mockReq.body = { firstName: 'John', lastName: 'Doe' };
    
    await verifySignUpBody(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Email is required' });
  });
});

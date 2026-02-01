/**
 * Response Helper Tests
 */

describe('Response Helper', () => {
  const responseHelper = require('../src/utils/responseHelper');

  // Mock response object
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    it('should return success response with default values', () => {
      responseHelper.success(mockRes, { id: 1 });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 'OK',
          message: 'Thành công',
          data: { id: 1 },
        })
      );
    });

    it('should return success response with custom message', () => {
      responseHelper.success(mockRes, { id: 1 }, 'Custom message', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Custom message',
        })
      );
    });
  });

  describe('error', () => {
    it('should return error response with default values', () => {
      responseHelper.error(mockRes, 'Something went wrong');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          status: 'ERROR',
          code: 'ERROR',
          message: 'Something went wrong',
        })
      );
    });

    it('should return error response with custom code', () => {
      responseHelper.error(mockRes, 'Not found', 404, 'NOT_FOUND');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NOT_FOUND',
        })
      );
    });
  });

  describe('paginated', () => {
    it('should return paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { total: 10, offset: 0, limit: 2 };

      responseHelper.paginated(mockRes, data, pagination);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: expect.objectContaining({
            total: 10,
            limit: 2,
            totalPages: 5,
            hasMore: true,
          }),
        })
      );
    });

    it('should calculate hasMore correctly', () => {
      const data = [{ id: 9 }, { id: 10 }];
      const pagination = { total: 10, offset: 8, limit: 2 };

      responseHelper.paginated(mockRes, data, pagination);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasMore: false,
          }),
        })
      );
    });
  });

  describe('created', () => {
    it('should return 201 status', () => {
      responseHelper.created(mockRes, { id: 1 });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Tạo mới thành công',
        })
      );
    });
  });

  describe('noContent', () => {
    it('should return 204 status', () => {
      responseHelper.noContent(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status', () => {
      responseHelper.unauthorized(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
        })
      );
    });
  });

  describe('forbidden', () => {
    it('should return 403 status', () => {
      responseHelper.forbidden(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'FORBIDDEN',
        })
      );
    });
  });

  describe('notFound', () => {
    it('should return 404 status', () => {
      responseHelper.notFound(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NOT_FOUND',
        })
      );
    });
  });

  describe('validationError', () => {
    it('should return 422 status with errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
      ];

      responseHelper.validationError(mockRes, errors);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          errors,
        })
      );
    });
  });

  describe('serverError', () => {
    it('should return 500 status', () => {
      responseHelper.serverError(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        })
      );
    });
  });
});

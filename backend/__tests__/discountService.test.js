/**
 * ============================================================================
 *                    DISCOUNT SERVICE TESTS
 * ============================================================================
 * Unit tests cho module quản lý khuyến mại
 * ============================================================================
 */

const discountService = require('../src/services/discountService');
const db = require('../src/config/database');

// Mock database
jest.mock('../src/config/database');

describe('DiscountService', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 }
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  // ==========================================================================
  // GET DISCOUNTS
  // ==========================================================================
  describe('getDiscounts', () => {
    it('should return list of discounts with pagination', async () => {
      const mockDiscounts = [
        {
          id: 1,
          code: 'SALE10',
          name: 'Giảm 10%',
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          is_active: true,
          status: 'active'
        },
        {
          id: 2,
          code: 'FREESHIP',
          name: 'Miễn phí vận chuyển',
          discount_type: 'FREE_SHIPPING',
          discount_value: 30000,
          is_active: true,
          status: 'active'
        }
      ];

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({ rows: mockDiscounts });

      await discountService.getDiscounts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDiscounts,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        },
        message: 'Lấy danh sách khuyến mại thành công'
      });
    });

    it('should filter by search query', async () => {
      mockReq.query = { search: 'sale' };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'SALE10' }] });

      await discountService.getDiscounts(mockReq, mockRes);

      expect(db.query.mock.calls[0][1]).toContain('%sale%');
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should filter by discount type', async () => {
      mockReq.query = { type: 'PERCENTAGE' };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, discount_type: 'PERCENTAGE' }] });

      await discountService.getDiscounts(mockReq, mockRes);

      expect(db.query.mock.calls[0][1]).toContain('PERCENTAGE');
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should filter by active status', async () => {
      mockReq.query = { status: 'active' };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'active' }] });

      await discountService.getDiscounts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      await discountService.getDiscounts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Lỗi khi lấy danh sách khuyến mại'
      }));
    });
  });

  // ==========================================================================
  // GET DISCOUNT BY ID
  // ==========================================================================
  describe('getDiscountById', () => {
    it('should return discount details with usage stats', async () => {
      mockReq.params = { id: 1 };

      const mockDiscount = {
        id: 1,
        code: 'SALE10',
        name: 'Giảm 10%',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        status: 'active'
      };

      const mockStats = {
        total_uses: '5',
        total_discount_given: '500000',
        unique_customers: '4'
      };

      db.query
        .mockResolvedValueOnce({ rows: [mockDiscount] })
        .mockResolvedValueOnce({ rows: [mockStats] });

      await discountService.getDiscountById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockDiscount,
          usage_stats: mockStats
        },
        message: 'Lấy thông tin khuyến mại thành công'
      });
    });

    it('should return 404 if discount not found', async () => {
      mockReq.params = { id: 999 };
      db.query.mockResolvedValueOnce({ rows: [] });

      await discountService.getDiscountById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    });
  });

  // ==========================================================================
  // CREATE DISCOUNT
  // ==========================================================================
  describe('createDiscount', () => {
    const validDiscountData = {
      code: 'NEWYEAR25',
      name: 'Khuyến mại năm mới',
      discount_type: 'PERCENTAGE',
      discount_value: 25,
      start_date: '2025-01-01',
      end_date: '2025-01-31'
    };

    it('should create a new discount successfully', async () => {
      mockReq.body = validDiscountData;

      db.query
        .mockResolvedValueOnce({ rows: [] }) // Check duplicate code
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Get discount type
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Insert discount
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'NEWYEAR25', discount_type: 'PERCENTAGE' }] }); // Get full discount

      await discountService.createDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Tạo khuyến mại thành công'
      }));
    });

    it('should return 400 if required fields missing', async () => {
      mockReq.body = { code: 'TEST' };

      await discountService.createDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Thiếu thông tin bắt buộc')
      }));
    });

    it('should return 400 if code already exists', async () => {
      mockReq.body = validDiscountData;
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Duplicate code exists

      await discountService.createDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Mã khuyến mại đã tồn tại'
      });
    });

    it('should return 400 if end_date before start_date', async () => {
      mockReq.body = {
        ...validDiscountData,
        start_date: '2025-01-31',
        end_date: '2025-01-01'
      };

      await discountService.createDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    });

    it('should return 400 if invalid discount type', async () => {
      mockReq.body = validDiscountData;

      db.query
        .mockResolvedValueOnce({ rows: [] }) // No duplicate code
        .mockResolvedValueOnce({ rows: [] }); // Invalid discount type

      await discountService.createDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Loại khuyến mại không hợp lệ'
      });
    });
  });

  // ==========================================================================
  // UPDATE DISCOUNT
  // ==========================================================================
  describe('updateDiscount', () => {
    it('should update discount successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { name: 'Khuyến mại cập nhật' };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'SALE10' }] }) // Check exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Update
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Khuyến mại cập nhật' }] }); // Get updated

      await discountService.updateDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Cập nhật khuyến mại thành công'
      }));
    });

    it('should return 404 if discount not found', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { name: 'Test' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await discountService.updateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    });

    it('should return 400 if invalid discount type provided', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { discount_type: 'INVALID_TYPE' };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Check exists
        .mockResolvedValueOnce({ rows: [] }); // Invalid type

      await discountService.updateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Loại khuyến mại không hợp lệ'
      });
    });
  });

  // ==========================================================================
  // DELETE DISCOUNT
  // ==========================================================================
  describe('deleteDiscount', () => {
    it('should delete unused discount', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'TEST', name: 'Test' }] }) // Check exists
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // No usages
        .mockResolvedValueOnce({ rows: [] }); // Delete

      await discountService.deleteDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Đã xóa khuyến mại "TEST"'
      });
    });

    it('should soft delete (deactivate) used discount', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'SALE10', name: 'Sale' }] }) // Check exists
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // Has usages
        .mockResolvedValueOnce({ rows: [] }); // Deactivate

      await discountService.deleteDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Đã vô hiệu hóa khuyến mại "SALE10" (đã có 5 lượt sử dụng)'
      });
    });

    it('should return 404 if discount not found', async () => {
      mockReq.params = { id: 999 };
      db.query.mockResolvedValueOnce({ rows: [] });

      await discountService.deleteDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    });
  });

  // ==========================================================================
  // DEACTIVATE DISCOUNT
  // ==========================================================================
  describe('deactivateDiscount', () => {
    it('should deactivate active discount', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, code: 'SALE10', name: 'Sale', is_active: true }] })
        .mockResolvedValueOnce({ rows: [] });

      await discountService.deactivateDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Đã kết thúc khuyến mại "SALE10"'
      });
    });

    it('should return 400 if already deactivated', async () => {
      mockReq.params = { id: 1 };
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, code: 'SALE10', is_active: false }] });

      await discountService.deactivateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Khuyến mại đã được vô hiệu hóa trước đó'
      });
    });

    it('should return 404 if discount not found', async () => {
      mockReq.params = { id: 999 };
      db.query.mockResolvedValueOnce({ rows: [] });

      await discountService.deactivateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Không tìm thấy khuyến mại'
      });
    });
  });

  // ==========================================================================
  // VALIDATE DISCOUNT
  // ==========================================================================
  describe('validateDiscount', () => {
    it('should validate a valid discount code', async () => {
      mockReq.body = {
        code: 'SALE10',
        order_amount: 200000,
        customer_id: 1
      };

      const mockDiscount = {
        id: 1,
        code: 'SALE10',
        name: 'Giảm 10%',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        max_discount_amount: 50000,
        min_order_amount: 100000,
        max_uses_total: 100,
        current_uses: 5,
        max_uses_per_customer: 2,
        customer_group_ids: null,
        is_active: true,
        start_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        end_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      db.query
        .mockResolvedValueOnce({ rows: [mockDiscount] }) // Find discount
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }); // Customer usage

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        valid: true,
        data: expect.objectContaining({
          code: 'SALE10',
          discount_amount: 20000 // 10% of 200000 = 20000
        })
      }));
    });

    it('should apply max discount cap for percentage', async () => {
      mockReq.body = {
        code: 'SALE10',
        order_amount: 1000000
      };

      const mockDiscount = {
        id: 1,
        code: 'SALE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        max_discount_amount: 50000, // Cap at 50k
        min_order_amount: 0,
        is_active: true,
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString()
      };

      db.query.mockResolvedValueOnce({ rows: [mockDiscount] });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        valid: true,
        data: expect.objectContaining({
          discount_amount: 50000 // Capped at max_discount_amount
        })
      }));
    });

    it('should return error for non-existent code', async () => {
      mockReq.body = { code: 'INVALID' };
      db.query.mockResolvedValueOnce({ rows: [] });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Mã khuyến mại không tồn tại'
      });
    });

    it('should return error for inactive discount', async () => {
      mockReq.body = { code: 'EXPIRED' };
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          code: 'EXPIRED',
          is_active: false
        }]
      });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết hiệu lực'
      });
    });

    it('should return error for expired discount', async () => {
      mockReq.body = { code: 'OLD' };
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          code: 'OLD',
          is_active: true,
          start_date: new Date(Date.now() - 86400000 * 10).toISOString(),
          end_date: new Date(Date.now() - 86400000).toISOString() // Yesterday
        }]
      });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết hạn'
      });
    });

    it('should return error for not-yet-started discount', async () => {
      mockReq.body = { code: 'FUTURE' };
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          code: 'FUTURE',
          is_active: true,
          start_date: new Date(Date.now() + 86400000 * 7).toISOString(), // Next week
          end_date: new Date(Date.now() + 86400000 * 14).toISOString()
        }]
      });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        valid: false,
        message: expect.stringContaining('Mã khuyến mại chưa bắt đầu')
      }));
    });

    it('should return error if max uses reached', async () => {
      mockReq.body = { code: 'MAXED' };
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          code: 'MAXED',
          is_active: true,
          max_uses_total: 100,
          current_uses: 100,
          start_date: new Date(Date.now() - 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString()
        }]
      });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Mã khuyến mại đã hết lượt sử dụng'
      });
    });

    it('should return error if customer exceeded usage limit', async () => {
      mockReq.body = { code: 'LIMIT', customer_id: 1 };

      const mockDiscount = {
        id: 1,
        code: 'LIMIT',
        is_active: true,
        max_uses_per_customer: 1,
        max_uses_total: null,
        customer_group_ids: null,
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString()
      };

      db.query
        .mockResolvedValueOnce({ rows: [mockDiscount] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // Already used once

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Bạn đã sử dụng hết lượt cho mã khuyến mại này'
      });
    });

    it('should return error if order amount below minimum', async () => {
      mockReq.body = { code: 'MIN', order_amount: 50000 };

      const mockDiscount = {
        id: 1,
        code: 'MIN',
        is_active: true,
        min_order_amount: 100000,
        max_uses_total: null,
        customer_group_ids: null,
        start_date: new Date(Date.now() - 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString()
      };

      db.query.mockResolvedValueOnce({ rows: [mockDiscount] });

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        valid: false,
        message: expect.stringContaining('Đơn hàng tối thiểu')
      }));
    });

    it('should return 400 if code not provided', async () => {
      mockReq.body = {};

      await discountService.validateDiscount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Vui lòng nhập mã khuyến mại'
      });
    });
  });

  // ==========================================================================
  // GET DISCOUNT TYPES
  // ==========================================================================
  describe('getDiscountTypes', () => {
    it('should return list of discount types', async () => {
      const mockTypes = [
        { id: 1, code: 'PERCENTAGE', name: 'Giảm theo phần trăm' },
        { id: 2, code: 'FIXED_AMOUNT', name: 'Giảm số tiền cố định' },
        { id: 3, code: 'BUY_X_GET_Y', name: 'Mua X tặng Y' },
        { id: 4, code: 'FREE_SHIPPING', name: 'Miễn phí vận chuyển' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockTypes });

      await discountService.getDiscountTypes(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTypes,
        message: 'Lấy danh sách loại khuyến mại thành công'
      });
    });

    it('should handle database error', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      await discountService.getDiscountTypes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Lỗi khi lấy danh sách loại khuyến mại'
      }));
    });
  });
});

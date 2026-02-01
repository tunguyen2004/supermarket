/**
 * Order Returns Service Tests
 * Module 16: Order Returns Management
 */

// Mock database
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn(() => Promise.resolve(mockClient)),
  },
}));

const db = require('../src/config/database');
const orderService = require('../src/services/orderService');

describe('Order Returns Service', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { id: 1, username: 'admin' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ========================================
  // GET RETURNS LIST TESTS
  // ========================================
  describe('getReturnOrders', () => {
    it('should return paginated list of returns', async () => {
      mockReq.query = { page: 1, limit: 20 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '15' }] }) // count
        .mockResolvedValueOnce({ 
          rows: [
            { 
              id: 1, 
              order_code: 'RTN-250115-00001', 
              customer_name: 'Nguyễn Văn A',
              final_amount: -500000,
              status: 'returned'
            },
            { 
              id: 2, 
              order_code: 'RTN-250115-00002', 
              customer_name: 'Trần Thị B',
              final_amount: -200000,
              status: 'returned'
            }
          ] 
        });

      await orderService.getReturnOrders(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          pagination: expect.objectContaining({
            total: 15
          })
        })
      );
    });
  });

  // ========================================
  // GET INVOICE TESTS
  // ========================================
  describe('getOrderInvoice', () => {
    it('should return invoice data for order', async () => {
      mockReq.params = { id: 101 };

      db.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 101, 
            order_code: 'DH-250115-00001',
            customer_name: 'Nguyễn Văn A',
            subtotal: 1000000,
            discount_amount: 50000,
            final_amount: 950000,
            payment_method: 'cash',
            created_at: '2024-01-15T10:30:00Z',
            staff_name: 'Admin',
            store_name: 'Siêu thị ABC'
          }] 
        }) // order info
        .mockResolvedValueOnce({ 
          rows: [
            { 
              product_name: 'Sản phẩm A',
              quantity: 2,
              unit_price: 200000,
              line_total: 400000
            },
            { 
              product_name: 'Sản phẩm B',
              quantity: 3,
              unit_price: 200000,
              line_total: 600000
            }
          ] 
        }); // order items

      await orderService.getOrderInvoice(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            invoice_number: 'DH-250115-00001',
            items: expect.any(Array),
            summary: expect.objectContaining({
              total: 950000
            })
          })
        })
      );
    });

    it('should return 404 if order not found', async () => {
      mockReq.params = { id: 99999 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await orderService.getOrderInvoice(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Không tìm thấy')
        })
      );
    });
  });

  // ========================================
  // CREATE RETURN TESTS
  // ========================================
  describe('returnOrder', () => {
    it('should return 404 if order not found', async () => {
      mockReq.params = { id: 99999 };
      mockReq.body = {
        items: [{ variant_id: 1, quantity: 1 }]
      };

      mockClient.query.mockResolvedValueOnce({ rows: [] }); // order not found

      await orderService.returnOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Không tìm thấy')
        })
      );
    });

    it('should reject return for non-delivered order', async () => {
      mockReq.params = { id: 101 };
      mockReq.body = {
        items: [{ variant_id: 1, quantity: 1 }]
      };

      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ id: 101, status: 'pending', store_name: 'Test Store' }] 
      }); // order not delivered

      await orderService.returnOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('giao')
        })
      );
    });

    it('should reject empty items array', async () => {
      mockReq.params = { id: 101 };
      mockReq.body = {
        items: [] // empty
      };

      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ id: 101, status: 'delivered', store_name: 'Test Store' }] 
      });

      await orderService.returnOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('không hợp lệ')
        })
      );
    });

    it('should reject return with item not in order', async () => {
      mockReq.params = { id: 101 };
      mockReq.body = {
        items: [{ variant_id: 999, quantity: 1 }] // variant not in order
      };

      mockClient.query
        .mockResolvedValueOnce({ 
          rows: [{ id: 101, status: 'delivered', store_name: 'Test Store' }] 
        }) // order exists
        .mockResolvedValueOnce({
          rows: [{ variant_id: 1, quantity: 3, unit_price: 100000, product_name: 'Product A' }]
        }); // order items (variant 1 only)

      await orderService.returnOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('không có trong đơn hàng')
        })
      );
    });

    it('should reject return with quantity exceeding ordered', async () => {
      mockReq.params = { id: 101 };
      mockReq.body = {
        items: [{ variant_id: 1, quantity: 10 }] // more than ordered (3)
      };

      mockClient.query
        .mockResolvedValueOnce({ 
          rows: [{ id: 101, status: 'delivered', store_name: 'Test Store' }] 
        }) // order exists
        .mockResolvedValueOnce({
          rows: [{ variant_id: 1, quantity: 3, unit_price: 100000, product_name: 'Product A' }]
        }); // order items

      await orderService.returnOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('vượt quá')
        })
      );
    });
  });
});

/**
 * Customer Service Tests
 * Module 11: Customer Management
 */

// Mock database
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

const db = require('../src/config/database');
const customerService = require('../src/services/customerService');

describe('Customer Service', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ========================================
  // GET CUSTOMERS TESTS
  // ========================================
  describe('getCustomers', () => {
    it('should return paginated list of customers', async () => {
      mockReq.query = { page: 1, limit: 20 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '50' }] }) // count query
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, code: 'KH0001', full_name: 'Nguyễn Văn A', phone: '0901234567' },
            { id: 2, code: 'KH0002', full_name: 'Trần Thị B', phone: '0907654321' }
          ] 
        }); // data query

      await customerService.getCustomers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3
          })
        })
      );
    });

    it('should filter customers by search term', async () => {
      mockReq.query = { search: 'Nguyễn', page: 1, limit: 10 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, full_name: 'Nguyễn Văn A' }] });

      await customerService.getCustomers(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%Nguyễn%'])
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should filter customers by group_id', async () => {
      mockReq.query = { group_id: 2, page: 1, limit: 10 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '10' }] })
        .mockResolvedValueOnce({ rows: [] });

      await customerService.getCustomers(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('customer_group_id'),
        expect.arrayContaining([2])
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await customerService.getCustomers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Lỗi')
        })
      );
    });
  });

  // ========================================
  // SEARCH CUSTOMERS TESTS
  // ========================================
  describe('searchCustomers', () => {
    it('should return empty array if search term is too short', async () => {
      mockReq.query = { q: 'A' };

      await customerService.searchCustomers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: []
        })
      );
    });

    it('should search customers by phone or name', async () => {
      mockReq.query = { q: '0901234567', limit: 10 };

      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, code: 'KH0001', full_name: 'Nguyễn Văn A', phone: '0901234567' }
        ]
      });

      await customerService.searchCustomers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ phone: '0901234567' })
          ])
        })
      );
    });
  });

  // ========================================
  // CREATE CUSTOMER TESTS
  // ========================================
  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      mockReq.body = {
        full_name: 'Nguyễn Văn Test',
        phone: '0901111111',
        email: 'test@example.com'
      };

      db.query
        .mockResolvedValueOnce({ rows: [] }) // check phone duplicate
        .mockResolvedValueOnce({ rows: [] }) // check email duplicate
        .mockResolvedValueOnce({ rows: [{ max_seq: 99 }] }) // get next code
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 100, 
            code: 'KH-202501-00100', 
            full_name: 'Nguyễn Văn Test',
            phone: '0901111111'
          }] 
        }) // insert
        .mockResolvedValueOnce({
          rows: [{
            id: 100,
            code: 'KH-202501-00100',
            full_name: 'Nguyễn Văn Test',
            phone: '0901111111'
          }]
        }); // get full info

      await customerService.createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            full_name: 'Nguyễn Văn Test'
          })
        })
      );
    });

    it('should reject duplicate phone number', async () => {
      mockReq.body = {
        full_name: 'Test',
        phone: '0901234567'
      };

      db.query.mockResolvedValueOnce({ 
        rows: [{ id: 1, phone: '0901234567' }] 
      }); // phone exists

      await customerService.createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Số điện thoại')
        })
      );
    });

    it('should reject if required fields missing', async () => {
      mockReq.body = {
        full_name: 'Test'
        // missing phone
      };

      await customerService.createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ========================================
  // GET CUSTOMER BY ID TESTS
  // ========================================
  describe('getCustomerById', () => {
    it('should return customer details with purchase history', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            code: 'KH-202501-00001', 
            full_name: 'Nguyễn Văn A',
            total_lifetime_value: 1000000,
            total_orders: 5,
            total_spent: 5000000
          }] 
        }) // customer info
        .mockResolvedValueOnce({ 
          rows: [
            { id: 101, order_code: 'DH00001', final_amount: 500000 }
          ] 
        }); // recent orders

      await customerService.getCustomerById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            code: 'KH-202501-00001'
          })
        })
      );
    });

    it('should return 404 if customer not found', async () => {
      mockReq.params = { id: 99999 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await customerService.getCustomerById(mockReq, mockRes);

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
  // UPDATE CUSTOMER TESTS
  // ========================================
  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        full_name: 'Nguyễn Văn A Updated',
        phone: '0901234567'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // customer exists
        .mockResolvedValueOnce({ rows: [] }) // no duplicate phone
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            full_name: 'Nguyễn Văn A Updated',
            phone: '0901234567'
          }] 
        }) // update result
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            full_name: 'Nguyễn Văn A Updated',
            phone: '0901234567'
          }]
        }); // get full info

      await customerService.updateCustomer(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            full_name: 'Nguyễn Văn A Updated'
          })
        })
      );
    });

    it('should reject update with duplicate phone', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { phone: '0909999999' };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // customer exists
        .mockResolvedValueOnce({ rows: [{ id: 2, phone: '0909999999' }] }); // phone exists for another

      await customerService.updateCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Số điện thoại')
        })
      );
    });

    it('should return 404 if customer not found', async () => {
      mockReq.params = { id: 99999 };
      mockReq.body = { full_name: 'Test' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await customerService.updateCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // ========================================
  // DELETE CUSTOMER TESTS
  // ========================================
  describe('deleteCustomer', () => {
    it('should delete customer without orders', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, full_name: 'Test' }] }) // customer exists
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // no orders
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // delete

      await customerService.deleteCustomer(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('xóa')
        })
      );
    });

    it('should reject delete customer with orders', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // customer exists
        .mockResolvedValueOnce({ rows: [{ count: '5' }] }); // has orders

      await customerService.deleteCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('đơn hàng')
        })
      );
    });

    it('should return 404 if customer not found', async () => {
      mockReq.params = { id: 99999 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await customerService.deleteCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});

// ========================================
// CUSTOMER GROUP TESTS
// ========================================
describe('Customer Group Service', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getCustomerGroups', () => {
    it('should return list of customer groups', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, code: 'VIP', name: 'Khách VIP', discount_percentage: 10, customer_count: 50 },
          { id: 2, code: 'REGULAR', name: 'Khách thường', discount_percentage: 0, customer_count: 200 }
        ]
      });

      await customerService.getCustomerGroups(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ code: 'VIP' })
          ])
        })
      );
    });
  });

  describe('updateCustomerGroup', () => {
    it('should update customer group', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { group_id: 2 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, full_name: 'Test' }] }) // customer exists
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // group exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // update
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, group_name: 'VIP', discount_percentage: 10 }] 
        }); // get updated

      await customerService.updateCustomerGroup(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ group_name: 'VIP' })
        })
      );
    });

    it('should return 404 if customer not found', async () => {
      mockReq.params = { id: 99999 };
      mockReq.body = { group_id: 1 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await customerService.updateCustomerGroup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if group not found', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { group_id: 99999 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // customer exists
        .mockResolvedValueOnce({ rows: [] }); // group not found

      await customerService.updateCustomerGroup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});

/**
 * Supplier Service Tests
 * Module 12: Supplier Management
 */

// Mock database
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

const db = require('../src/config/database');
const supplierService = require('../src/services/supplierService');

describe('Supplier Service', () => {
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
  // GET SUPPLIERS TESTS
  // ========================================
  describe('getSuppliers', () => {
    it('should return paginated list of suppliers', async () => {
      mockReq.query = { page: 1, limit: 20 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '30' }] }) // count query
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, code: 'NCC001', name: 'Công ty A', phone: '0281234567' },
            { id: 2, code: 'NCC002', name: 'Công ty B', phone: '0287654321' }
          ] 
        }); // data query

      await supplierService.getSuppliers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 30,
            totalPages: 2
          })
        })
      );
    });

    it('should filter suppliers by search term', async () => {
      mockReq.query = { search: 'Công ty A', page: 1, limit: 10 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Công ty A' }] });

      await supplierService.getSuppliers(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%Công ty A%'])
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should filter suppliers by city_id', async () => {
      mockReq.query = { city_id: 1, page: 1, limit: 10 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      await supplierService.getSuppliers(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('city_id'),
        expect.arrayContaining([1])
      );
    });

    it('should filter suppliers by is_active', async () => {
      mockReq.query = { is_active: 'true', page: 1, limit: 10 };

      db.query
        .mockResolvedValueOnce({ rows: [{ total: '20' }] })
        .mockResolvedValueOnce({ rows: [] });

      await supplierService.getSuppliers(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_active'),
        expect.arrayContaining([true])
      );
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await supplierService.getSuppliers(mockReq, mockRes);

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
  // CREATE SUPPLIER TESTS
  // ========================================
  describe('createSupplier', () => {
    it('should create a new supplier successfully', async () => {
      mockReq.body = {
        name: 'Công ty Test',
        phone: '0281111111',
        email: 'test@company.com',
        address: '123 Test Street',
        tax_code: '0123456789'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ max_seq: 0 }] }) // get sequence
        .mockResolvedValueOnce({ rows: [] }) // check email duplicate
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 100, 
            code: 'NCC-202501-00001', 
            name: 'Công ty Test',
            phone: '0281111111'
          }] 
        }) // insert
        .mockResolvedValueOnce({
          rows: [{
            id: 100,
            code: 'NCC-202501-00001',
            name: 'Công ty Test',
            city_name: null
          }]
        }); // get full info

      await supplierService.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'Công ty Test'
          })
        })
      );
    });

    it('should reject duplicate email', async () => {
      mockReq.body = {
        name: 'Test',
        email: 'existing@company.com'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ max_seq: 0 }] }) // get sequence
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // email exists

      await supplierService.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Email')
        })
      );
    });

    it('should create supplier with required fields only', async () => {
      mockReq.body = {
        name: 'Minimal Supplier'
        // no optional fields
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ max_seq: 5 }] }) // get sequence  
        .mockResolvedValueOnce({ 
          rows: [{ id: 101, code: 'NCC-202501-00006', name: 'Minimal Supplier' }] 
        }) // insert
        .mockResolvedValueOnce({
          rows: [{ id: 101, code: 'NCC-202501-00006', name: 'Minimal Supplier' }]
        }); // get full info

      await supplierService.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should reject if name is missing', async () => {
      mockReq.body = {
        phone: '0281234567'
        // missing name
      };

      await supplierService.createSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Tên')
        })
      );
    });
  });

  // ========================================
  // UPDATE SUPPLIER TESTS
  // ========================================
  describe('updateSupplier', () => {
    it('should update supplier successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        name: 'Công ty A Updated',
        phone: '0281234567'
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // supplier exists
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            name: 'Công ty A Updated',
            phone: '0281234567'
          }] 
        }) // update result
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            name: 'Công ty A Updated',
            phone: '0281234567',
            city_name: null
          }] 
        }); // get full info

      await supplierService.updateSupplier(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'Công ty A Updated'
          })
        })
      );
    });

    it('should reject update with duplicate email', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { email: 'existing@company.com' };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // supplier exists
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }); // email exists for another

      await supplierService.updateSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Email')
        })
      );
    });

    it('should return 404 if supplier not found', async () => {
      mockReq.params = { id: 99999 };
      mockReq.body = { name: 'Test' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await supplierService.updateSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // ========================================
  // DELETE SUPPLIER TESTS
  // ========================================
  describe('deleteSupplier', () => {
    it('should hard delete supplier without transactions', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test Supplier' }] }) // supplier exists
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // no transactions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // delete

      await supplierService.deleteSupplier(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Đã xóa')
        })
      );
    });

    it('should soft delete (deactivate) supplier with transactions', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test Supplier' }] }) // supplier exists
        .mockResolvedValueOnce({ rows: [{ count: '15' }] }) // has transactions
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // deactivate

      await supplierService.deleteSupplier(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('vô hiệu hóa')
        })
      );
    });

    it('should return 404 if supplier not found', async () => {
      mockReq.params = { id: 99999 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await supplierService.deleteSupplier(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // ========================================
  // GET SUPPLIER BY ID TESTS
  // ========================================
  describe('getSupplierById', () => {
    it('should return supplier details with transactions', async () => {
      mockReq.params = { id: 1 };

      db.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            code: 'NCC-202501-00001', 
            name: 'Công ty A',
            phone: '0281234567',
            city_name: 'Hà Nội'
          }] 
        }) // supplier info
        .mockResolvedValueOnce({
          rows: [
            { transaction_code: 'TX001', quantity_change: 100 }
          ]
        }); // recent transactions

      await supplierService.getSupplierById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            name: 'Công ty A'
          })
        })
      );
    });

    it('should return 404 if supplier not found', async () => {
      mockReq.params = { id: 99999 };

      db.query.mockResolvedValueOnce({ rows: [] });

      await supplierService.getSupplierById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Không tìm thấy')
        })
      );
    });
  });
});

/**
 * Bank Account Service Tests
 */

// Mock database pool
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn()
  }))
}));

const pool = require('../src/config/database');
const bankAccountService = require('../src/services/bankAccountService');

describe('BankAccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBankAccounts', () => {
    it('should return paginated list of bank accounts', async () => {
      // Mock count query
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '3' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              account_name: 'Siêu Thị Mini',
              account_number: '1234567890',
              bank_name: 'Vietcombank',
              bank_code: 'VCB',
              branch: 'Chi nhánh Quận 1',
              store_id: null,
              store_name: null,
              is_default: true,
              is_active: true,
              notes: null,
              created_at: '2026-01-31T00:00:00Z',
              updated_at: '2026-01-31T00:00:00Z',
              created_by_name: 'Admin'
            },
            {
              id: 2,
              account_name: 'Siêu Thị Mini',
              account_number: '0987654321',
              bank_name: 'Techcombank',
              bank_code: 'TCB',
              branch: 'Chi nhánh Quận 3',
              store_id: 1,
              store_name: 'Cửa hàng HCM',
              is_default: false,
              is_active: true,
              notes: null,
              created_at: '2026-01-31T00:00:00Z',
              updated_at: '2026-01-31T00:00:00Z',
              created_by_name: 'Admin'
            }
          ]
        });

      const result = await bankAccountService.getAllBankAccounts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.data[0].bank_code).toBe('VCB');
    });

    it('should filter by store_id', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 2,
              account_name: 'Siêu Thị Mini',
              account_number: '0987654321',
              bank_name: 'Techcombank',
              bank_code: 'TCB',
              store_id: 1,
              is_default: false,
              is_active: true
            }
          ]
        });

      const result = await bankAccountService.getAllBankAccounts({ store_id: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].store_id).toBe(1);
    });

    it('should filter by is_active', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, is_active: true },
            { id: 2, is_active: true }
          ]
        });

      const result = await bankAccountService.getAllBankAccounts({ is_active: true });

      expect(result.data.every(acc => acc.is_active)).toBe(true);
    });

    it('should search by account_name, account_number, or bank_name', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              account_name: 'Siêu Thị Mini',
              bank_name: 'Vietcombank'
            }
          ]
        });

      const result = await bankAccountService.getAllBankAccounts({ search: 'Vietcom' });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('getBankAccountById', () => {
    it('should return bank account details', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            account_name: 'Siêu Thị Mini',
            account_number: '1234567890',
            bank_name: 'Vietcombank',
            bank_code: 'VCB',
            is_default: true,
            is_active: true
          }
        ]
      });

      const result = await bankAccountService.getBankAccountById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.bank_code).toBe('VCB');
    });

    it('should return null if not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await bankAccountService.getBankAccountById(999);

      expect(result).toBeNull();
    });
  });

  describe('createBankAccount', () => {
    it('should create a new bank account successfully', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ // INSERT
            rows: [{
              id: 3,
              account_name: 'Siêu Thị Mini',
              account_number: '5555555555',
              bank_name: 'ACB',
              bank_code: 'ACB',
              is_default: false,
              is_active: true
            }]
          })
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const data = {
        account_name: 'Siêu Thị Mini',
        account_number: '5555555555',
        bank_name: 'ACB',
        bank_code: 'ACB'
      };

      const result = await bankAccountService.createBankAccount(data, 1);

      expect(result.id).toBe(3);
      expect(result.bank_code).toBe('ACB');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should unset other defaults when is_default is true', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // UPDATE (unset defaults)
          .mockResolvedValueOnce({ // INSERT
            rows: [{
              id: 4,
              is_default: true
            }]
          })
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const data = {
        account_name: 'Test',
        account_number: '1111111111',
        bank_name: 'Test Bank',
        bank_code: 'TEST',
        is_default: true
      };

      const result = await bankAccountService.createBankAccount(data, 1);

      expect(result.is_default).toBe(true);
      // Verify UPDATE was called to unset defaults
      expect(mockClient.query).toHaveBeenCalledTimes(4);
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account successfully', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // SELECT existing
          .mockResolvedValueOnce({ // UPDATE
            rows: [{
              id: 1,
              account_name: 'Updated Name',
              bank_name: 'Vietcombank',
              is_active: true
            }]
          })
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await bankAccountService.updateBankAccount(1, { account_name: 'Updated Name' });

      expect(result.account_name).toBe('Updated Name');
    });

    it('should return null if bank account not found', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // SELECT (not found)
          .mockResolvedValueOnce({}), // ROLLBACK
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await bankAccountService.updateBankAccount(999, { account_name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteBankAccount', () => {
    it('should soft delete bank account (set is_active = false)', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await bankAccountService.deleteBankAccount(1);

      expect(result).toBe(true);
    });

    it('should return false if bank account not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await bankAccountService.deleteBankAccount(999);

      expect(result).toBe(false);
    });
  });

  describe('generatePaymentQR', () => {
    it('should generate payment QR data', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          account_name: 'Siêu Thị Mini',
          account_number: '1234567890',
          bank_name: 'Vietcombank',
          bank_code: 'VCB',
          is_active: true
        }]
      });

      const result = await bankAccountService.generatePaymentQR(1, {
        amount: 100000,
        description: 'Thanh toan don hang'
      });

      expect(result.qr_url).toContain('img.vietqr.io');
      expect(result.qr_url).toContain('VCB');
      expect(result.qr_url).toContain('1234567890');
      expect(result.bank_code).toBe('VCB');
      expect(result.amount).toBe(100000);
    });

    it('should throw error if bank account not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(bankAccountService.generatePaymentQR(999, {}))
        .rejects.toThrow('Bank account not found');
    });

    it('should throw error if bank account is inactive', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          bank_code: 'VCB',
          is_active: false
        }]
      });

      await expect(bankAccountService.generatePaymentQR(1, {}))
        .rejects.toThrow('Bank account is inactive');
    });
  });

  describe('getDefaultBankAccount', () => {
    it('should return default bank account', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          is_default: true,
          is_active: true
        }]
      });

      const result = await bankAccountService.getDefaultBankAccount();

      expect(result.is_default).toBe(true);
    });

    it('should return null if no default found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await bankAccountService.getDefaultBankAccount();

      expect(result).toBeNull();
    });
  });
});

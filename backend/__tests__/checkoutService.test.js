/**
 * Checkout Service Tests
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
const checkoutService = require('../src/services/checkoutService');

describe('CheckoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCheckouts', () => {
    it('should return paginated list of checkouts', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '4' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              order_code: 'CK-260201-001',
              customer_name: 'Nguyễn Văn A',
              customer_email: 'a@example.com',
              customer_phone: '0901234567',
              store_id: 1,
              store_name: 'Cửa hàng HCM',
              status: 'draft',
              payment_status: 'unpaid',
              final_amount: 450000,
              subtotal: 450000,
              discount_amount: 0,
              created_at: '2026-02-01T10:32:00Z',
              email_sent: false,
              email_sent_at: null,
              item_count: '3'
            },
            {
              id: 2,
              order_code: 'CK-260201-002',
              customer_name: 'Trần Thị B',
              customer_email: 'b@example.com',
              customer_phone: null,
              store_id: 1,
              store_name: 'Cửa hàng HCM',
              status: 'abandoned',
              payment_status: 'unpaid',
              final_amount: 120000,
              subtotal: 120000,
              discount_amount: 0,
              created_at: '2026-02-01T09:15:00Z',
              email_sent: true,
              email_sent_at: '2026-02-01T10:00:00Z',
              item_count: '1'
            }
          ]
        });

      const result = await checkoutService.getAllCheckouts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(4);
      expect(result.data[0].checkoutCode).toBe('CK-260201-001');
      expect(result.data[0].status).toBe('Chưa liên hệ');
      expect(result.data[1].status).toBe('Đã gửi email');
    });

    it('should filter by store_id', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, store_id: 1, order_code: 'CK-001', email_sent: false, final_amount: 100000, item_count: '1' }
          ]
        });

      const result = await checkoutService.getAllCheckouts({ store_id: 1 });

      expect(result.data[0].storeId).toBe(1);
    });

    it('should filter by status', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 2, status: 'abandoned', order_code: 'CK-002', email_sent: false, final_amount: 50000, item_count: '1' }
          ]
        });

      const result = await checkoutService.getAllCheckouts({ status: 'abandoned' });

      expect(result.data).toHaveLength(1);
    });

    it('should search by order_code, customer name, email, phone', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, order_code: 'CK-260201-001', customer_name: 'Nguyễn Văn A', email_sent: false, final_amount: 100000, item_count: '1' }
          ]
        });

      const result = await checkoutService.getAllCheckouts({ search: 'Nguyễn' });

      expect(result.data).toHaveLength(1);
    });

    it('should sort by created_at DESC by default', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 2, created_at: '2026-02-01T10:00:00Z', order_code: 'CK-002', email_sent: false, final_amount: 100000, item_count: '1' },
            { id: 1, created_at: '2026-02-01T09:00:00Z', order_code: 'CK-001', email_sent: false, final_amount: 50000, item_count: '1' }
          ]
        });

      const result = await checkoutService.getAllCheckouts({});

      expect(result.data[0].id).toBe(2);
    });
  });

  describe('getCheckoutById', () => {
    it('should return checkout details with items', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            order_code: 'CK-260201-001',
            date_key: '2026-02-01',
            customer_id: 1,
            customer_name: 'Nguyễn Văn A',
            customer_email: 'a@example.com',
            customer_phone: '0901234567',
            customer_address: '123 ABC',
            store_id: 1,
            store_name: 'Cửa hàng HCM',
            status: 'draft',
            payment_status: 'unpaid',
            subtotal: 450000,
            discount_amount: 0,
            tax_amount: 0,
            shipping_fee: 0,
            final_amount: 450000,
            payment_method: null,
            shipping_address: null,
            customer_note: null,
            internal_note: null,
            created_by: 1,
            created_by_name: 'Admin',
            created_at: '2026-02-01T10:32:00Z',
            email_sent: false,
            email_sent_at: null
          }]
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              variant_id: 10,
              sku: 'MILK-001',
              barcode: '8934567890123',
              product_name: 'Sữa tươi Vinamilk',
              variant_name: 'Hộp 1L',
              quantity: 2,
              unit_price: 35000,
              discount_per_item: 0,
              line_subtotal: 70000,
              line_total: 70000,
              product_image: '/images/milk.jpg'
            },
            {
              id: 2,
              variant_id: 20,
              sku: 'BREAD-001',
              barcode: '8934567890456',
              product_name: 'Bánh mì sandwich',
              variant_name: 'Gói 500g',
              quantity: 3,
              unit_price: 25000,
              discount_per_item: 0,
              line_subtotal: 75000,
              line_total: 75000,
              product_image: '/images/bread.jpg'
            }
          ]
        });

      const result = await checkoutService.getCheckoutById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.checkoutCode).toBe('CK-260201-001');
      expect(result.customer.name).toBe('Nguyễn Văn A');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].productName).toBe('Sữa tươi Vinamilk');
      expect(result.displayStatus).toBe('Chưa liên hệ');
    });

    it('should return null if not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await checkoutService.getCheckoutById(999);

      expect(result).toBeNull();
    });
  });

  describe('sendPaymentLink', () => {
    it('should send payment link and update database', async () => {
      // Mock getCheckoutById
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            order_code: 'CK-260201-001',
            customer_name: 'Test',
            customer_email: 'test@example.com',
            customer_phone: null,
            status: 'draft',
            final_amount: 100000,
            email_sent: false
          }]
        })
        .mockResolvedValueOnce({ rows: [] }) // items query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // UPDATE

      const result = await checkoutService.sendPaymentLink(1, {});

      expect(result.success).toBe(true);
      expect(result.checkout_id).toBe(1);
      expect(result.sent_to).toBe('test@example.com');
      expect(result.payment_link).toBeDefined();
    });

    it('should throw error if checkout not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(checkoutService.sendPaymentLink(999, {}))
        .rejects.toThrow('Checkout not found');
    });

    it('should throw error if customer has no contact info', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            order_code: 'CK-001',
            customer_name: 'Khách vãng lai',
            customer_email: null,
            customer_phone: null,
            status: 'draft',
            final_amount: 100000,
            email_sent: false
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // items

      await expect(checkoutService.sendPaymentLink(1, {}))
        .rejects.toThrow('Customer has no email or phone contact');
    });
  });

  describe('sendMassEmail', () => {
    it('should send emails to multiple checkouts', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [
            { id: 1, order_code: 'CK-001', customer_email: 'a@example.com', final_amount: 100000 },
            { id: 2, order_code: 'CK-002', customer_email: 'b@example.com', final_amount: 200000 }
          ]
        })
        .mockResolvedValueOnce({}); // UPDATE

      const result = await checkoutService.sendMassEmail({});

      expect(result.success).toBe(true);
      expect(result.sent_count).toBe(2);
    });

    it('should return message if no eligible checkouts found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await checkoutService.sendMassEmail({});

      expect(result.sent_count).toBe(0);
      expect(result.message).toBe('No eligible checkouts found');
    });

    it('should filter by checkout_ids if provided', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [
            { id: 1, order_code: 'CK-001', customer_email: 'a@example.com', final_amount: 100000 }
          ]
        })
        .mockResolvedValueOnce({});

      const result = await checkoutService.sendMassEmail({ checkout_ids: [1, 3] });

      expect(result.sent_count).toBe(1);
    });
  });

  describe('deleteCheckout', () => {
    it('should delete checkout and its items', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1, status: 'draft' }] }) // SELECT
          .mockResolvedValueOnce({}) // DELETE items
          .mockResolvedValueOnce({}) // DELETE order
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await checkoutService.deleteCheckout(1);

      expect(result).toBe(true);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false if checkout not found or not deletable', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // SELECT (not found)
          .mockResolvedValueOnce({}), // ROLLBACK
        release: jest.fn()
      };
      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await checkoutService.deleteCheckout(999);

      expect(result).toBe(false);
    });
  });

  describe('markAsAbandoned', () => {
    it('should mark checkout as abandoned', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, order_code: 'CK-001', status: 'abandoned' }]
      });

      const result = await checkoutService.markAsAbandoned(1);

      expect(result).toBeDefined();
      expect(result.status).toBe('abandoned');
    });

    it('should return null if checkout not found or not draft', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await checkoutService.markAsAbandoned(999);

      expect(result).toBeNull();
    });
  });

  describe('getCheckoutStats', () => {
    it('should return checkout statistics', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          total_checkouts: '10',
          emailed_count: '3',
          not_contacted_count: '7',
          total_value: '5000000',
          avg_value: '500000'
        }]
      });

      const result = await checkoutService.getCheckoutStats({});

      expect(result.totalCheckouts).toBe(10);
      expect(result.emailedCount).toBe(3);
      expect(result.notContactedCount).toBe(7);
      expect(result.totalValue).toBe(5000000);
    });

    it('should filter by store_id', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          total_checkouts: '5',
          emailed_count: '2',
          not_contacted_count: '3',
          total_value: '2500000',
          avg_value: '500000'
        }]
      });

      const result = await checkoutService.getCheckoutStats({ store_id: 1 });

      expect(result.totalCheckouts).toBe(5);
    });
  });
});

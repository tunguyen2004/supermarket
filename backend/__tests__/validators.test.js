/**
 * Validation Tests
 */

describe('Staff Validator', () => {
  const { 
    addStaffSchema, 
    updateStaffSchema, 
    updateRoleSchema 
  } = require('../src/validators/staffValidator');

  describe('addStaffSchema', () => {
    it('should validate correct staff data', () => {
      const { error } = addStaffSchema.validate({
        username: 'newstaff',
        email: 'staff@test.com',
        full_name: 'Test Staff',
        phone: '0901234567',
        password: 'password123',
        role_id: 2,
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const { error } = addStaffSchema.validate({
        username: 'newstaff',
        email: 'invalid-email',
        full_name: 'Test Staff',
        password: 'password123',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject short password', () => {
      const { error } = addStaffSchema.validate({
        username: 'newstaff',
        email: 'staff@test.com',
        full_name: 'Test Staff',
        password: '12345',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    it('should reject invalid role_id', () => {
      const { error } = addStaffSchema.validate({
        username: 'newstaff',
        email: 'staff@test.com',
        full_name: 'Test Staff',
        password: 'password123',
        role_id: 5,
      });
      expect(error).toBeDefined();
    });

    it('should allow phone to be optional', () => {
      const { error } = addStaffSchema.validate({
        username: 'newstaff',
        email: 'staff@test.com',
        full_name: 'Test Staff',
        password: 'password123',
      });
      expect(error).toBeUndefined();
    });
  });

  describe('updateStaffSchema', () => {
    it('should allow partial updates', () => {
      const { error } = updateStaffSchema.validate({
        full_name: 'Updated Name',
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty update', () => {
      const { error } = updateStaffSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('updateRoleSchema', () => {
    it('should accept valid role_id', () => {
      const { error } = updateRoleSchema.validate({ role_id: 1 });
      expect(error).toBeUndefined();
    });

    it('should reject invalid role_id', () => {
      const { error } = updateRoleSchema.validate({ role_id: 10 });
      expect(error).toBeDefined();
    });
  });
});

describe('Product Validator', () => {
  const { 
    createProductSchema, 
    bulkStatusSchema 
  } = require('../src/validators/productValidator');

  describe('createProductSchema', () => {
    it('should validate correct product data', () => {
      const { error } = createProductSchema.validate({
        code: 'PROD001',
        name: 'Test Product',
        category_id: 1,
        unit_id: 1,
        selling_price: 10000,
      });
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const { error } = createProductSchema.validate({
        name: 'Test Product',
      });
      expect(error).toBeDefined();
    });

    it('should reject negative price', () => {
      const { error } = createProductSchema.validate({
        code: 'PROD001',
        name: 'Test Product',
        category_id: 1,
        unit_id: 1,
        selling_price: -100,
      });
      expect(error).toBeDefined();
    });
  });

  describe('bulkStatusSchema', () => {
    it('should validate correct bulk status data', () => {
      const { error } = bulkStatusSchema.validate({
        product_ids: [1, 2, 3],
        is_active: true,
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty product_ids array', () => {
      const { error } = bulkStatusSchema.validate({
        product_ids: [],
        is_active: true,
      });
      expect(error).toBeDefined();
    });
  });
});

describe('Order Validator', () => {
  const { 
    createOrderSchema, 
    updateOrderStatusSchema 
  } = require('../src/validators/orderValidator');

  describe('createOrderSchema', () => {
    it('should validate correct order data', () => {
      const { error } = createOrderSchema.validate({
        store_id: 1,
        items: [
          { variant_id: 1, quantity: 2, unit_price: 10000 },
        ],
        subtotal: 20000,
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty items', () => {
      const { error } = createOrderSchema.validate({
        store_id: 1,
        items: [],
        subtotal: 0,
      });
      expect(error).toBeDefined();
    });

    it('should reject invalid payment method', () => {
      const { error } = createOrderSchema.validate({
        store_id: 1,
        items: [{ variant_id: 1, quantity: 1, unit_price: 1000 }],
        subtotal: 1000,
        payment_method: 'bitcoin',
      });
      expect(error).toBeDefined();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should accept valid status', () => {
      const { error } = updateOrderStatusSchema.validate({
        status: 'completed',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const { error } = updateOrderStatusSchema.validate({
        status: 'invalid_status',
      });
      expect(error).toBeDefined();
    });
  });
});

describe('Inventory Validator', () => {
  const { 
    transferStockSchema,
    updateInventorySchema 
  } = require('../src/validators/inventoryValidator');

  describe('transferStockSchema', () => {
    it('should validate correct transfer data', () => {
      const { error } = transferStockSchema.validate({
        from_store_id: 1,
        to_store_id: 2,
        items: [{ variant_id: 1, quantity: 10 }],
      });
      expect(error).toBeUndefined();
    });

    it('should reject same source and destination store', () => {
      const { error } = transferStockSchema.validate({
        from_store_id: 1,
        to_store_id: 1,
        items: [{ variant_id: 1, quantity: 10 }],
      });
      expect(error).toBeDefined();
    });
  });

  describe('updateInventorySchema', () => {
    it('should accept valid adjustment types', () => {
      const validTypes = ['set', 'add', 'subtract'];
      validTypes.forEach(type => {
        const { error } = updateInventorySchema.validate({
          store_id: 1,
          quantity: 10,
          adjustment_type: type,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid adjustment type', () => {
      const { error } = updateInventorySchema.validate({
        store_id: 1,
        quantity: 10,
        adjustment_type: 'invalid',
      });
      expect(error).toBeDefined();
    });
  });
});

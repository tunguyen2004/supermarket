/**
 * Supplier Routes - Quản lý nhà cung cấp
 */

const express = require('express');
const router = express.Router();
const supplierService = require('../services/supplierService');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validateBody, validateQuery } = require('../middleware/validate');
const { supplierValidator } = require('../validators/supplierValidator');

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Quản lý nhà cung cấp
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Danh sách nhà cung cấp
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', 
  verifyToken, 
  validateQuery(supplierValidator.listQuery),
  supplierService.getSuppliers
);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Chi tiết nhà cung cấp
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', 
  verifyToken, 
  supplierService.getSupplierById
);

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Thêm nhà cung cấp mới
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  verifyToken, 
  requireRole([1, 3]), // Admin, Manager only
  validateBody(supplierValidator.create),
  supplierService.createSupplier
);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Cập nhật nhà cung cấp
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  verifyToken, 
  requireRole([1, 3]), // Admin, Manager only
  validateBody(supplierValidator.update),
  supplierService.updateSupplier
);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Xóa/Vô hiệu hóa nhà cung cấp
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', 
  verifyToken, 
  requireRole([1]), // Admin only
  supplierService.deleteSupplier
);

module.exports = router;

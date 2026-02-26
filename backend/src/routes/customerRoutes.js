/**
 * Customer Routes - Quản lý khách hàng
 */

const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validateBody, validateQuery } = require('../middleware/validate');
const { customerValidator } = require('../validators/customerValidator');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Quản lý khách hàng
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Danh sách khách hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: group_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 */
router.get('/', 
  verifyToken, 
  validateQuery(customerValidator.listQuery),
  customerService.getCustomers
);

/**
 * @swagger
 * /api/customers/search:
 *   get:
 *     summary: Tìm kiếm nhanh khách hàng (cho POS)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/search', 
  verifyToken, 
  validateQuery(customerValidator.searchQuery),
  customerService.searchCustomers
);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Thêm khách hàng mới
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  verifyToken, 
  validateBody(customerValidator.create),
  customerService.createCustomer
);

/**
 * @swagger
 * /api/customers/cities:
 *   get:
 *     summary: Danh sách tỉnh/thành phố
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: integer
 *         description: Lọc theo vùng miền (1=Bắc, 2=Trung, 3=Nam)
 */
router.get('/cities',
  verifyToken,
  customerService.getCities
);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Chi tiết khách hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', 
  verifyToken, 
  customerService.getCustomerById
);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Cập nhật khách hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  verifyToken, 
  validateBody(customerValidator.update),
  customerService.updateCustomer
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Xóa khách hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', 
  verifyToken, 
  requireRole([1, 3]), // Admin, Manager only
  customerService.deleteCustomer
);

/**
 * @swagger
 * /api/customers/{id}/group:
 *   put:
 *     summary: Chuyển nhóm khách hàng
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/group', 
  verifyToken, 
  validateBody(customerValidator.updateGroup),
  customerService.updateCustomerGroup
);

module.exports = router;

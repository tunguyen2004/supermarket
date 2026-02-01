/**
 * Customer Group Routes - Quản lý nhóm khách hàng
 */

const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: CustomerGroups
 *   description: Quản lý nhóm khách hàng
 */

/**
 * @swagger
 * /api/customer-groups:
 *   get:
 *     summary: Danh sách nhóm khách hàng
 *     tags: [CustomerGroups]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', verifyToken, customerService.getCustomerGroups);

module.exports = router;

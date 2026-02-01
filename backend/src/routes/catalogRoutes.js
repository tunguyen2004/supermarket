/**
 * Catalog (Price List) Routes
 * @module routes/catalogRoutes
 */

const express = require('express');
const router = express.Router();
const catalogService = require('../services/catalogService');
const { verifyToken } = require('../middleware/auth');
const { requireManagerOrAdmin } = require('../middleware/authorize');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { 
  updateCatalogSchema, 
  bulkUpdateCatalogSchema, 
  catalogListQuerySchema 
} = require('../validators/catalogValidator');
const { idParamSchema } = require('../validators/commonValidator');

/**
 * @swagger
 * /api/catalogs:
 *   get:
 *     tags: [Catalogs]
 *     summary: Danh sách bảng giá
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách bảng giá
 */
router.get('/', verifyToken, validateQuery(catalogListQuerySchema), catalogService.getCatalogs);

/**
 * @swagger
 * /api/catalogs/export:
 *   get:
 *     tags: [Catalogs]
 *     summary: Xuất bảng giá ra CSV
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File CSV
 */
router.get('/export', verifyToken, catalogService.exportCatalogs);

/**
 * @swagger
 * /api/catalogs/bulk-update:
 *   patch:
 *     tags: [Catalogs]
 *     summary: Cập nhật giá hàng loạt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variant_ids, price_change_type, price_change_value]
 *             properties:
 *               variant_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               price_change_type:
 *                 type: string
 *                 enum: [fixed, percent]
 *               price_change_value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/bulk-update', verifyToken, requireManagerOrAdmin, validateBody(bulkUpdateCatalogSchema), catalogService.bulkUpdateCatalogs);

/**
 * @swagger
 * /api/catalogs/{id}:
 *   get:
 *     tags: [Catalogs]
 *     summary: Chi tiết bảng giá
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết bảng giá
 */
router.get('/:id', verifyToken, validateParams(idParamSchema), catalogService.getCatalogById);

/**
 * @swagger
 * /api/catalogs/{id}:
 *   put:
 *     tags: [Catalogs]
 *     summary: Cập nhật giá sản phẩm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cost_price:
 *                 type: number
 *               selling_price:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), validateBody(updateCatalogSchema), catalogService.updateCatalog);

module.exports = router;

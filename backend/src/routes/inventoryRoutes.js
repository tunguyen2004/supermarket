/**
 * Inventory Routes
 * @module routes/inventoryRoutes
 */

const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const { verifyToken } = require('../middleware/auth');
const { requireManagerOrAdmin } = require('../middleware/authorize');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { 
  receiveInventorySchema, 
  transferStockSchema, 
  returnToSupplierSchema,
  updateInventorySchema,
  inventoryListQuerySchema,
  inventoryHistoryQuerySchema
} = require('../validators/inventoryValidator');
const { variantIdParamSchema } = require('../validators/commonValidator');

/**
 * @swagger
 * /api/inventories:
 *   get:
 *     tags: [Inventory]
 *     summary: Danh sách tồn kho
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
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, low_stock, out_of_stock]
 *     responses:
 *       200:
 *         description: Danh sách tồn kho
 */
router.get('/', verifyToken, validateQuery(inventoryListQuerySchema), inventoryService.getInventories);

/**
 * @swagger
 * /api/inventories/receive:
 *   post:
 *     tags: [Inventory]
 *     summary: Nhập kho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store_id, items]
 *             properties:
 *               store_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     unit_cost:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nhập kho thành công
 */
router.post('/receive', verifyToken, requireManagerOrAdmin, validateBody(receiveInventorySchema), inventoryService.receiveInventory);

/**
 * @swagger
 * /api/inventories/transfer:
 *   post:
 *     tags: [Inventory]
 *     summary: Chuyển kho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from_store_id, to_store_id, items]
 *             properties:
 *               from_store_id:
 *                 type: integer
 *               to_store_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chuyển kho thành công
 */
router.post('/transfer', verifyToken, requireManagerOrAdmin, validateBody(transferStockSchema), inventoryService.transferStock);

/**
 * @swagger
 * /api/inventories/return:
 *   post:
 *     tags: [Inventory]
 *     summary: Trả hàng nhà cung cấp
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store_id, items]
 *             properties:
 *               store_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả hàng thành công
 */
router.post('/return', verifyToken, requireManagerOrAdmin, validateBody(returnToSupplierSchema), inventoryService.returnToSupplier);

/**
 * @swagger
 * /api/inventories/{variantId}:
 *   get:
 *     tags: [Inventory]
 *     summary: Chi tiết tồn kho của sản phẩm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết tồn kho
 */
router.get('/:variantId', verifyToken, validateParams(variantIdParamSchema), inventoryService.getInventoryById);

/**
 * @swagger
 * /api/inventories/{variantId}:
 *   put:
 *     tags: [Inventory]
 *     summary: Điều chỉnh tồn kho
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store_id, quantity, adjustment_type]
 *             properties:
 *               store_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               adjustment_type:
 *                 type: string
 *                 enum: [set, add, subtract]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Điều chỉnh thành công
 */
router.put('/:variantId', verifyToken, requireManagerOrAdmin, validateParams(variantIdParamSchema), validateBody(updateInventorySchema), inventoryService.updateInventory);

/**
 * @swagger
 * /api/inventories/{variantId}/history:
 *   get:
 *     tags: [Inventory]
 *     summary: Lịch sử xuất nhập kho
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lịch sử giao dịch
 */
router.get('/:variantId/history', verifyToken, validateParams(variantIdParamSchema), validateQuery(inventoryHistoryQuerySchema), inventoryService.getInventoryHistory);

module.exports = router;

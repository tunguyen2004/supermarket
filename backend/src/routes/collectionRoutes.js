/**
 * Collection (Category) Routes
 * @module routes/collectionRoutes
 */

const express = require('express');
const router = express.Router();
const collectionService = require('../services/collectionService');
const { verifyToken } = require('../middleware/auth');
const { requireManagerOrAdmin } = require('../middleware/authorize');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { 
  createCollectionSchema, 
  updateCollectionSchema, 
  collectionListQuerySchema 
} = require('../validators/collectionValidator');
const { idParamSchema } = require('../validators/commonValidator');

/**
 * @swagger
 * /api/collections:
 *   get:
 *     tags: [Collections]
 *     summary: Danh sách danh mục
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
 *         name: parent_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/', verifyToken, validateQuery(collectionListQuerySchema), collectionService.getCollections);

/**
 * @swagger
 * /api/collections:
 *   post:
 *     tags: [Collections]
 *     summary: Thêm danh mục mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name]
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post('/', verifyToken, requireManagerOrAdmin, validateBody(createCollectionSchema), collectionService.createCollection);

/**
 * @swagger
 * /api/collections/tree:
 *   get:
 *     tags: [Collections]
 *     summary: Lấy cấu trúc cây danh mục
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cây danh mục
 */
router.get('/tree', verifyToken, collectionService.getCollectionTree);

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     tags: [Collections]
 *     summary: Chi tiết danh mục
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
 *         description: Chi tiết danh mục
 */
router.get('/:id', verifyToken, validateParams(idParamSchema), collectionService.getCollectionById);

/**
 * @swagger
 * /api/collections/{id}:
 *   put:
 *     tags: [Collections]
 *     summary: Cập nhật danh mục
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
 *               name:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), validateBody(updateCollectionSchema), collectionService.updateCollection);

/**
 * @swagger
 * /api/collections/{id}:
 *   delete:
 *     tags: [Collections]
 *     summary: Xóa danh mục
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
 *         description: Xóa thành công
 */
router.delete('/:id', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), collectionService.deleteCollection);

module.exports = router;

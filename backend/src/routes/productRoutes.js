/**
 * Product Routes
 * @module routes/productRoutes
 */

const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const productImageService = require('../services/productImageService');
const { verifyToken } = require('../middleware/auth');
const { requireManagerOrAdmin } = require('../middleware/authorize');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { 
  createProductSchema, 
  updateProductSchema, 
  productListQuerySchema,
  bulkStatusSchema
} = require('../validators/productValidator');
const { idParamSchema, imageIdParamSchema, reorderImagesSchema } = require('../validators/commonValidator');
const { uploadCSV, uploadProductImage, uploadProductImages, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Danh sách sản phẩm
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
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/', verifyToken, validateQuery(productListQuerySchema), productService.getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Thêm sản phẩm mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
router.post('/', verifyToken, requireManagerOrAdmin, validateBody(createProductSchema), productService.createProduct);

/**
 * @swagger
 * /api/products/export:
 *   get:
 *     tags: [Products]
 *     summary: Export sản phẩm ra CSV
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', verifyToken, productService.exportProducts);

/**
 * @swagger
 * /api/products/import:
 *   post:
 *     tags: [Products]
 *     summary: Import sản phẩm từ CSV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import kết quả
 */
router.post('/import', verifyToken, requireManagerOrAdmin, uploadLimiter, uploadCSV.single('file'), handleMulterError, productService.importProducts);

/**
 * @swagger
 * /api/products/bulk-status:
 *   patch:
 *     tags: [Products]
 *     summary: Cập nhật trạng thái hàng loạt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_ids, is_active]
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/bulk-status', verifyToken, requireManagerOrAdmin, validateBody(bulkStatusSchema), productService.bulkUpdateStatus);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Chi tiết sản phẩm
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
 *         description: Chi tiết sản phẩm
 */
router.get('/:id', verifyToken, validateParams(idParamSchema), productService.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Cập nhật sản phẩm
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
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), validateBody(updateProductSchema), productService.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Xóa sản phẩm
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
router.delete('/:id', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), productService.deleteProduct);

// ============== PRODUCT IMAGES ==============

/**
 * @swagger
 * /api/products/{id}/images:
 *   get:
 *     tags: [Products]
 *     summary: Lấy danh sách ảnh sản phẩm
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
 *         description: Danh sách ảnh
 */
router.get('/:id/images', verifyToken, validateParams(idParamSchema), productImageService.getProductImages);

/**
 * @swagger
 * /api/products/{id}/image:
 *   post:
 *     tags: [Products]
 *     summary: Upload ảnh chính
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post('/:id/image', verifyToken, requireManagerOrAdmin, uploadLimiter, validateParams(idParamSchema), uploadProductImage.single('image'), handleMulterError, productImageService.uploadMainImage);

/**
 * @swagger
 * /api/products/{id}/image:
 *   delete:
 *     tags: [Products]
 *     summary: Xóa ảnh chính
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
router.delete('/:id/image', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), productImageService.deleteMainImage);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Upload nhiều ảnh gallery
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post('/:id/images', verifyToken, requireManagerOrAdmin, uploadLimiter, validateParams(idParamSchema), uploadProductImages.array('images', 5), handleMulterError, productImageService.uploadGalleryImages);

/**
 * @swagger
 * /api/products/{id}/images/{imageId}:
 *   delete:
 *     tags: [Products]
 *     summary: Xóa ảnh trong gallery
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id/images/:imageId', verifyToken, requireManagerOrAdmin, validateParams(imageIdParamSchema), productImageService.deleteGalleryImage);

/**
 * @swagger
 * /api/products/{id}/images/{imageId}/primary:
 *   put:
 *     tags: [Products]
 *     summary: Đặt ảnh làm ảnh chính
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id/images/:imageId/primary', verifyToken, requireManagerOrAdmin, validateParams(imageIdParamSchema), productImageService.setPrimaryImage);

/**
 * @swagger
 * /api/products/{id}/images/reorder:
 *   put:
 *     tags: [Products]
 *     summary: Sắp xếp lại thứ tự ảnh
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
 *               image_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Sắp xếp thành công
 */
router.put('/:id/images/reorder', verifyToken, requireManagerOrAdmin, validateParams(idParamSchema), validateBody(reorderImagesSchema), productImageService.reorderImages);

module.exports = router;

const express = require('express');
const router = express.Router();

const posService = require('../services/posService');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { posValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   - name: POS
 *     description: Point of Sale - Thanh toán tại quầy
 */

/**
 * @swagger
 * /api/pos/checkout:
 *   post:
 *     summary: Xử lý thanh toán đơn hàng POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/POSCheckoutRequest'
 *     responses:
 *       201:
 *         description: Thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                     order_code:
 *                       type: string
 *                     receipt_url:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/checkout', 
  verifyToken, 
  validate(posValidator.checkoutSchema),
  posService.checkout
);

/**
 * @swagger
 * /api/pos/products/search:
 *   get:
 *     summary: Tìm kiếm sản phẩm nhanh (barcode/SKU/tên)
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: ID cửa hàng để lấy giá và tồn kho
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm tìm được
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/POSProduct'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/products/search', 
  verifyToken, 
  posService.searchProducts
);

/**
 * @swagger
 * /api/pos/products/{variantId}/price:
 *   get:
 *     summary: Lấy giá sản phẩm theo store
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin giá và tồn kho
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/products/:variantId/price', 
  verifyToken, 
  posService.getProductPrice
);

/**
 * @swagger
 * /api/pos/orders/draft:
 *   post:
 *     summary: Lưu đơn hàng tạm (draft)
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/POSDraftRequest'
 *     responses:
 *       201:
 *         description: Lưu đơn tạm thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/orders/draft', 
  verifyToken, 
  validate(posValidator.draftSchema),
  posService.saveDraft
);

/**
 * @swagger
 * /api/pos/orders/drafts:
 *   get:
 *     summary: Danh sách đơn hàng tạm
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đơn tạm
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/orders/drafts', 
  verifyToken, 
  posService.getDrafts
);

/**
 * @swagger
 * /api/pos/orders/drafts/{id}:
 *   get:
 *     summary: Chi tiết đơn hàng tạm
 *     tags: [POS]
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
 *         description: Chi tiết đơn tạm
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/orders/drafts/:id', 
  verifyToken, 
  posService.getDraftById
);

/**
 * @swagger
 * /api/pos/orders/draft/{id}:
 *   put:
 *     summary: Cập nhật đơn hàng tạm (thêm/xóa/sửa items)
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
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
 *                     unit_price:
 *                       type: number
 *               discount_amount:
 *                 type: number
 *               discount_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/orders/draft/:id', 
  verifyToken, 
  posService.updateDraft
);

/**
 * @swagger
 * /api/pos/orders/draft/{id}:
 *   delete:
 *     summary: Xóa đơn hàng tạm
 *     tags: [POS]
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/orders/draft/:id', 
  verifyToken, 
  posService.deleteDraft
);

/**
 * @swagger
 * /api/pos/orders/{id}/receipt:
 *   get:
 *     summary: Lấy dữ liệu hóa đơn POS để in
 *     tags: [POS]
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
 *         description: Dữ liệu hóa đơn
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/orders/:id/receipt', 
  verifyToken, 
  posService.getReceipt
);

/**
 * @swagger
 * /api/pos/discounts/validate:
 *   post:
 *     summary: Kiểm tra mã giảm giá
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *               order_amount:
 *                 type: number
 *               customer_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra mã giảm giá
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/discounts/validate', 
  verifyToken, 
  posService.validateDiscountCode
);

/**
 * @swagger
 * /api/pos/payment-methods:
 *   get:
 *     summary: Danh sách phương thức thanh toán
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phương thức thanh toán
 */
router.get('/payment-methods', 
  verifyToken, 
  posService.getPaymentMethods
);

module.exports = router;

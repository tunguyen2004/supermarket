/**
 * Order Routes
 * @module routes/orderRoutes
 */

const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");
const { verifyToken } = require("../middleware/auth");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middleware/validate");
const {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderListQuerySchema,
} = require("../validators/orderValidator");
const { idParamSchema } = require("../validators/commonValidator");

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sách đơn hàng
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [paid, unpaid, refunded]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [order_code, final_amount, status, created_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get(
  "/",
  verifyToken,
  validateQuery(orderListQuerySchema),
  orderService.getOrderList,
);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 */
router.post(
  "/",
  verifyToken,
  validateBody(createOrderSchema),
  orderService.createOrder,
);

/**
 * @swagger
 * /api/orders/stats/summary:
 *   get:
 *     tags: [Orders]
 *     summary: Thống kê đơn hàng tổng quan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê đơn hàng
 */
router.get("/stats/summary", verifyToken, orderService.getOrderStats);

/**
 * @swagger
 * /api/orders/stats/detailed:
 *   get:
 *     tags: [Orders]
 *     summary: Thống kê đơn hàng chi tiết
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê chi tiết
 */
router.get("/stats/detailed", verifyToken, orderService.getDetailedStats);

/**
 * @swagger
 * /api/orders/returns:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sách đơn hoàn trả
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đơn hoàn trả
 */
router.get("/returns", verifyToken, orderService.getReturnOrders);

/**
 * @swagger
 * /api/orders/drafts:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sách đơn nháp
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
 *         description: Danh sách đơn nháp
 */
router.get("/drafts", verifyToken, orderService.getDraftOrders);

/**
 * @swagger
 * /api/orders/drafts:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn nháp
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *               customer_id:
 *                 type: integer
 *               store_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn nháp thành công
 */
router.post("/drafts", verifyToken, orderService.createDraftOrder);

/**
 * @swagger
 * /api/orders/drafts/{id}/convert:
 *   post:
 *     tags: [Orders]
 *     summary: Chuyển đơn nháp thành đơn hàng
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
 *         description: Chuyển đổi thành công
 */
router.post(
  "/drafts/:id/convert",
  verifyToken,
  validateParams(idParamSchema),
  orderService.convertDraftToOrder,
);

/**
 * @swagger
 * /api/orders/drafts/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Xóa đơn nháp
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
router.delete(
  "/drafts/:id",
  verifyToken,
  validateParams(idParamSchema),
  orderService.deleteDraftOrder,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Chi tiết đơn hàng
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
 *         description: Chi tiết đơn hàng
 */
router.get(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  orderService.getOrderDetail,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Cập nhật trạng thái đơn hàng
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
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *               payment_status:
 *                 type: string
 *                 enum: [paid, unpaid, refunded]
 *               payment_method:
 *                 type: string
 *                 enum: [cash, card, bank transfer]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  validateBody(updateOrderStatusSchema),
  orderService.updateOrderStatus,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Hủy đơn hàng
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hủy thành công
 */
router.delete(
  "/:id",
  verifyToken,
  validateParams(idParamSchema),
  validateBody(cancelOrderSchema),
  orderService.cancelOrder,
);

/**
 * @swagger
 * /api/orders/{id}/return:
 *   post:
 *     tags: [Orders]
 *     summary: Hoàn trả đơn hàng
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
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variant_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     reason:
 *                       type: string
 *               reason:
 *                 type: string
 *               refund_method:
 *                 type: string
 *                 enum: [cash, card, bank_transfer]
 *     responses:
 *       201:
 *         description: Hoàn trả thành công
 */
router.post(
  "/:id/return",
  verifyToken,
  validateParams(idParamSchema),
  orderService.returnOrder,
);

/**
 * @swagger
 * /api/orders/{id}/invoice:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy thông tin in hóa đơn
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
 *         description: Thông tin hóa đơn
 */
router.get(
  "/:id/invoice",
  verifyToken,
  validateParams(idParamSchema),
  orderService.getOrderInvoice,
);

module.exports = router;

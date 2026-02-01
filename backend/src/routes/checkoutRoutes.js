/**
 * Checkout Routes
 * @module routes/checkoutRoutes
 */

const express = require('express');
const router = express.Router();
const checkoutService = require('../services/checkoutService');
const { verifyToken: auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const checkoutValidator = require('../validators/checkoutValidator');
const { success, error } = require('../utils/responseHelper');

/**
 * @swagger
 * tags:
 *   name: Checkouts
 *   description: Quản lý đơn chưa hoàn tất (abandoned carts)
 */

/**
 * @swagger
 * /api/checkouts:
 *   get:
 *     summary: Danh sách đơn chưa hoàn tất
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, abandoned, pending]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã đơn, tên/email/SĐT khách hàng
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Từ ngày
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Đến ngày
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, final_amount, order_code]
 *           default: created_at
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách đơn chưa hoàn tất
 */
router.get('/',
  auth,
  async (req, res) => {
    try {
      const result = await checkoutService.getAllCheckouts({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        store_id: req.query.store_id ? parseInt(req.query.store_id) : undefined,
        status: req.query.status,
        search: req.query.search,
        from: req.query.from,
        to: req.query.to,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      });

      return success(res, result.data, 'Checkouts retrieved successfully', 200, result.pagination);
    } catch (err) {
      console.error('Get checkouts error:', err);
      return error(res, 'Failed to retrieve checkouts', 500);
    }
  }
);

/**
 * @swagger
 * /api/checkouts/stats:
 *   get:
 *     summary: Thống kê đơn chưa hoàn tất
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Từ ngày
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Đến ngày
 *     responses:
 *       200:
 *         description: Thống kê đơn chưa hoàn tất
 */
router.get('/stats',
  auth,
  async (req, res) => {
    try {
      const stats = await checkoutService.getCheckoutStats({
        store_id: req.query.store_id ? parseInt(req.query.store_id) : undefined,
        from: req.query.from,
        to: req.query.to
      });

      return success(res, stats, 'Checkout statistics retrieved successfully');
    } catch (err) {
      console.error('Get checkout stats error:', err);
      return error(res, 'Failed to retrieve checkout statistics', 500);
    }
  }
);

/**
 * @swagger
 * /api/checkouts/{id}:
 *   get:
 *     summary: Chi tiết đơn chưa hoàn tất
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn với danh sách sản phẩm
 *       404:
 *         description: Không tìm thấy đơn
 */
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const checkout = await checkoutService.getCheckoutById(parseInt(req.params.id));

      if (!checkout) {
        return error(res, 'Checkout not found', 404);
      }

      return success(res, checkout, 'Checkout retrieved successfully');
    } catch (err) {
      console.error('Get checkout error:', err);
      return error(res, 'Failed to retrieve checkout', 500);
    }
  }
);

/**
 * @swagger
 * /api/checkouts/{id}/send-link:
 *   post:
 *     summary: Gửi link thanh toán cho khách hàng
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_message:
 *                 type: string
 *                 description: Tin nhắn tùy chỉnh
 *     responses:
 *       200:
 *         description: Gửi link thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 checkout_id:
 *                   type: integer
 *                 checkout_code:
 *                   type: string
 *                 payment_link:
 *                   type: string
 *                 sent_to:
 *                   type: string
 *                 sent_at:
 *                   type: string
 *       404:
 *         description: Không tìm thấy đơn
 *       400:
 *         description: Khách hàng không có thông tin liên hệ
 */
router.post('/:id/send-link',
  auth,
  validate(checkoutValidator.sendLinkSchema),
  async (req, res) => {
    try {
      const result = await checkoutService.sendPaymentLink(
        parseInt(req.params.id),
        {
          custom_message: req.body.custom_message,
          sender_id: req.user.id
        }
      );

      return success(res, result, 'Payment link sent successfully');
    } catch (err) {
      console.error('Send payment link error:', err);
      
      if (err.message === 'Checkout not found') {
        return error(res, err.message, 404);
      }
      if (err.message === 'Customer has no email or phone contact') {
        return error(res, err.message, 400);
      }
      
      return error(res, 'Failed to send payment link', 500);
    }
  }
);

/**
 * @swagger
 * /api/checkouts/mass-email:
 *   post:
 *     summary: Gửi email hàng loạt cho nhiều đơn chưa hoàn tất
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkout_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID đơn (nếu không có sẽ gửi tất cả)
 *               store_id:
 *                 type: integer
 *                 description: Lọc theo cửa hàng
 *               exclude_already_sent:
 *                 type: boolean
 *                 default: true
 *                 description: Bỏ qua đơn đã gửi email
 *               custom_message:
 *                 type: string
 *                 description: Tin nhắn tùy chỉnh
 *     responses:
 *       200:
 *         description: Kết quả gửi email hàng loạt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sent_count:
 *                   type: integer
 *                 failed_count:
 *                   type: integer
 *                 sent_checkout_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 */
router.post('/mass-email',
  auth,
  authorize(['admin', 'manager']),
  validate(checkoutValidator.massEmailSchema),
  async (req, res) => {
    try {
      const result = await checkoutService.sendMassEmail({
        checkout_ids: req.body.checkout_ids,
        store_id: req.body.store_id,
        exclude_already_sent: req.body.exclude_already_sent !== false,
        custom_message: req.body.custom_message,
        sender_id: req.user.id
      });

      return success(res, result, 'Mass email completed');
    } catch (err) {
      console.error('Mass email error:', err);
      return error(res, 'Failed to send mass email', 500);
    }
  }
);

/**
 * @swagger
 * /api/checkouts/{id}:
 *   delete:
 *     summary: Xóa đơn chưa hoàn tất
 *     tags: [Checkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy đơn hoặc đơn không thể xóa
 */
router.delete('/:id',
  auth,
  authorize(['admin', 'manager']),
  async (req, res) => {
    try {
      const deleted = await checkoutService.deleteCheckout(parseInt(req.params.id));

      if (!deleted) {
        return error(res, 'Checkout not found or cannot be deleted', 404);
      }

      return success(res, null, 'Checkout deleted successfully');
    } catch (err) {
      console.error('Delete checkout error:', err);
      return error(res, 'Failed to delete checkout', 500);
    }
  }
);

module.exports = router;

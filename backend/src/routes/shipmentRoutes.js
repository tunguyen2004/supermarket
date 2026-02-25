/**
 * ============================================================================
 *                    MODULE 15: SHIPMENT ROUTES
 * ============================================================================
 * API endpoints quản lý vận đơn / giao hàng
 * ============================================================================
 */

const express = require("express");
const router = express.Router();
const shipmentService = require("../services/shipmentService");
const { authenticate, authorize } = require("../middleware");
const validate = require("../middleware/validate");
const { shipmentValidator } = require("../validators");

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Quản lý vận đơn / giao hàng
 */

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Lấy danh sách vận đơn
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã vận đơn, tracking, tên/SĐT người nhận
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, picking, picked, in_transit, out_for_delivery, delivered, failed, returned, cancelled]
 *       - in: query
 *         name: carrier_id
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
 *     responses:
 *       200:
 *         description: Danh sách vận đơn
 */
router.get("/", authenticate, shipmentService.getShipments);

/**
 * @swagger
 * /api/shipment-statuses:
 *   get:
 *     summary: Lấy danh sách trạng thái vận đơn
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách trạng thái
 */
router.get("/statuses", authenticate, shipmentService.getShipmentStatuses);

/**
 * @swagger
 * /api/carriers:
 *   get:
 *     summary: Lấy danh sách đơn vị vận chuyển
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn vị vận chuyển
 */
router.get("/carriers", authenticate, shipmentService.getCarriers);

/**
 * @swagger
 * /api/shipments/reports/dashboard:
 *   get:
 *     summary: Báo cáo tổng quan vận chuyển
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: store_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dữ liệu báo cáo vận chuyển
 */
router.get(
  "/reports/dashboard",
  authenticate,
  shipmentService.getShipmentReportDashboard,
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   get:
 *     summary: Chi tiết vận đơn
 *     tags: [Shipments]
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
 *         description: Chi tiết vận đơn với lịch sử tracking
 *       404:
 *         description: Không tìm thấy vận đơn
 */
router.get("/:id", authenticate, shipmentService.getShipmentById);

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Tạo vận đơn mới
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - sender_store_id
 *               - recipient_name
 *               - recipient_phone
 *               - recipient_address
 *             properties:
 *               order_id:
 *                 type: integer
 *               carrier_id:
 *                 type: integer
 *               tracking_code:
 *                 type: string
 *               sender_store_id:
 *                 type: integer
 *               recipient_name:
 *                 type: string
 *               recipient_phone:
 *                 type: string
 *               recipient_address:
 *                 type: string
 *               recipient_city_id:
 *                 type: integer
 *               recipient_district:
 *                 type: string
 *               recipient_ward:
 *                 type: string
 *               package_weight:
 *                 type: number
 *               shipping_fee:
 *                 type: number
 *               cod_amount:
 *                 type: number
 *               insurance_fee:
 *                 type: number
 *               estimated_delivery_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo vận đơn thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post(
  "/",
  authenticate,
  validate(shipmentValidator.createShipment),
  shipmentService.createShipment,
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   put:
 *     summary: Cập nhật vận đơn
 *     tags: [Shipments]
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
 *               carrier_id:
 *                 type: integer
 *               tracking_code:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               recipient_phone:
 *                 type: string
 *               recipient_address:
 *                 type: string
 *               shipping_fee:
 *                 type: number
 *               cod_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Không thể sửa vận đơn đã giao
 *       404:
 *         description: Không tìm thấy vận đơn
 */
router.put(
  "/:id",
  authenticate,
  validate(shipmentValidator.updateShipment),
  shipmentService.updateShipment,
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   delete:
 *     summary: Xóa/Hủy vận đơn
 *     tags: [Shipments]
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
 *         description: Xóa/Hủy thành công
 *       404:
 *         description: Không tìm thấy vận đơn
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "manager"]),
  shipmentService.deleteShipment,
);

/**
 * @swagger
 * /api/shipments/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái vận đơn
 *     tags: [Shipments]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, picking, picked, in_transit, out_for_delivery, delivered, failed, returned, cancelled]
 *               location:
 *                 type: string
 *                 description: Vị trí hiện tại
 *               description:
 *                 type: string
 *                 description: Mô tả trạng thái
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy vận đơn
 */
router.patch(
  "/:id/status",
  authenticate,
  validate(shipmentValidator.updateStatus),
  shipmentService.updateShipmentStatus,
);

module.exports = router;

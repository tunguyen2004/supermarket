const express = require('express');
const router = express.Router();

const reportService = require('../services/reportService');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateQuery } = validate;
const { reportValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   - name: Reports
 *     description: Báo cáo doanh thu và cuối ngày
 */

/**
 * @swagger
 * /api/reports/daily:
 *   get:
 *     summary: Báo cáo doanh thu theo ngày
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (mặc định hôm nay)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (mặc định hôm nay)
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: integer
 *         description: Lọc theo nhân viên
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *     responses:
 *       200:
 *         description: Báo cáo doanh thu
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
 *                     period:
 *                       type: object
 *                     summary:
 *                       $ref: '#/components/schemas/DailyReportSummary'
 *                     by_date:
 *                       type: array
 *                     by_payment_method:
 *                       type: array
 *                     by_staff:
 *                       type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/daily', 
  verifyToken, 
  validateQuery(reportValidator.reportQuerySchema),
  reportService.getDailyReport
);

/**
 * @swagger
 * /api/reports/actual-revenue:
 *   get:
 *     summary: Báo cáo thực thu
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: integer
 *         description: Lọc theo nhân viên
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *     responses:
 *       200:
 *         description: Báo cáo thực thu theo phương thức thanh toán
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
 *                     summary:
 *                       type: object
 *                     by_method:
 *                       type: array
 *                     pending:
 *                       type: object
 *                     refunds:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/actual-revenue', 
  verifyToken, 
  validateQuery(reportValidator.reportQuerySchema),
  reportService.getActualRevenue
);

/**
 * @swagger
 * /api/reports/sold-products:
 *   get:
 *     summary: Danh sách sản phẩm đã bán
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: store_id
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
 *           default: 50
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [quantity, revenue, orders, profit]
 *           default: quantity
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm đã bán
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SoldProduct'
 *                     summary:
 *                       type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse/properties/pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sold-products', 
  verifyToken, 
  validateQuery(reportValidator.soldProductsQuerySchema),
  reportService.getSoldProducts
);

/**
 * @swagger
 * /api/reports/daily/print:
 *   get:
 *     summary: Báo cáo cuối ngày để in
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày báo cáo (mặc định hôm nay)
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: integer
 *         description: Lọc theo nhân viên
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Lọc theo cửa hàng
 *     responses:
 *       200:
 *         description: Dữ liệu báo cáo để in
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
 *                     report_info:
 *                       type: object
 *                     revenue_summary:
 *                       type: object
 *                     actual_revenue:
 *                       type: object
 *                     top_products:
 *                       type: array
 *                     orders_list:
 *                       type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/daily/print', 
  verifyToken, 
  validateQuery(reportValidator.printReportQuerySchema),
  reportService.getDailyPrintReport
);

/**
 * @swagger
 * /api/reports/staff:
 *   get:
 *     summary: Danh sách nhân viên để lọc báo cáo
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       username:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/staff', 
  verifyToken, 
  reportService.getStaffList
);

// ============ SUBMITTED REPORTS (NỘP BÁO CÁO) ============

/**
 * @swagger
 * /api/reports/submit:
 *   post:
 *     summary: Staff nộp báo cáo cuối ngày
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, period_from, period_to]
 *             properties:
 *               title:
 *                 type: string
 *               period_from:
 *                 type: string
 *                 format: date
 *               period_to:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               revenue_summary:
 *                 type: object
 *               actual_summary:
 *                 type: object
 *     responses:
 *       201:
 *         description: Nộp báo cáo thành công
 *       400:
 *         description: Thiếu thông tin
 */
router.post('/submit',
  verifyToken,
  reportService.submitReport
);

/**
 * @swagger
 * /api/reports/submitted:
 *   get:
 *     summary: Danh sách báo cáo đã nộp (admin)
 *     tags: [Reports]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, approved, rejected]
 *     responses:
 *       200:
 *         description: Danh sách báo cáo
 */
router.get('/submitted',
  verifyToken,
  reportService.getSubmittedReports
);

/**
 * @swagger
 * /api/reports/submitted/{id}:
 *   get:
 *     summary: Chi tiết báo cáo đã nộp
 *     tags: [Reports]
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
 *         description: Chi tiết báo cáo
 *       404:
 *         description: Không tìm thấy
 */
router.get('/submitted/:id',
  verifyToken,
  reportService.getSubmittedReportById
);

/**
 * @swagger
 * /api/reports/submitted/{id}/status:
 *   patch:
 *     summary: Admin duyệt / từ chối báo cáo
 *     tags: [Reports]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch('/submitted/:id/status',
  verifyToken,
  reportService.updateReportStatus
);

module.exports = router;

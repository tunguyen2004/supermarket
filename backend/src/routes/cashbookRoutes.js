/**
 * ============================================================================
 *                    MODULE 14: CASHBOOK/TRANSACTION ROUTES
 * ============================================================================
 * API endpoints quản lý sổ quỹ (Fundbook)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const cashbookService = require('../services/cashbookService');
const { authenticate, authorize } = require('../middleware');
const validate = require('../middleware/validate');
const { cashbookValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Quản lý sổ quỹ / Phiếu thu chi
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch thu chi
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [thu, chi]
 *         description: Loại giao dịch
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
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
 *         description: Danh sách giao dịch
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
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticate, cashbookService.getTransactions);

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Thống kê tồn quỹ
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Thống kê sổ quỹ
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
 *                     totals:
 *                       type: object
 *                       properties:
 *                         total_income:
 *                           type: number
 *                         total_expense:
 *                           type: number
 *                         net_amount:
 *                           type: number
 *                     by_store:
 *                       type: array
 *                     by_type:
 *                       type: array
 */
router.get('/summary', authenticate, cashbookService.getTransactionSummary);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Chi tiết giao dịch
 *     tags: [Transactions]
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
 *         description: Chi tiết giao dịch
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.get('/:id', authenticate, cashbookService.getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Tạo phiếu thu/chi
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - cashbook_type
 *               - amount
 *             properties:
 *               store_id:
 *                 type: integer
 *               cashbook_type:
 *                 type: string
 *                 description: "Code: SALES_INCOME, OTHER_INCOME, PURCHASE_EXPENSE, SALARY_EXPENSE, etc."
 *               payment_method:
 *                 type: string
 *                 description: "Code: CASH, BANK_TRANSFER, CARD, MOMO, etc."
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               date_key:
 *                 type: string
 *                 format: date
 *               reference_type:
 *                 type: string
 *               reference_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               recipient_phone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', 
  authenticate, 
  validate(cashbookValidator.createTransaction),
  cashbookService.createTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
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
 *               cashbook_type:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               amount:
 *                 type: number
 *               date_key:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               recipient_phone:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.put('/:id', 
  authenticate, 
  validate(cashbookValidator.updateTransaction),
  cashbookService.updateTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Xóa giao dịch
 *     tags: [Transactions]
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
 *         description: Không tìm thấy giao dịch
 */
router.delete('/:id', 
  authenticate, 
  authorize(['admin', 'manager']),
  cashbookService.deleteTransaction
);

/**
 * @swagger
 * /api/transactions/{id}/approve:
 *   patch:
 *     summary: Duyệt/Từ chối giao dịch
 *     tags: [Transactions]
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
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Duyệt thành công
 *       400:
 *         description: Giao dịch không ở trạng thái chờ duyệt
 */
router.patch('/:id/approve', 
  authenticate, 
  authorize(['admin', 'manager']),
  cashbookService.approveTransaction
);

module.exports = router;

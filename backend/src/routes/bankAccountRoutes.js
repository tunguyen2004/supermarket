/**
 * Bank Account Routes
 * @module routes/bankAccountRoutes
 */

const express = require('express');
const router = express.Router();
const bankAccountService = require('../services/bankAccountService');
const { verifyToken: auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const bankAccountValidator = require('../validators/bankAccountValidator');
const { success, error } = require('../utils/responseHelper');

/**
 * @swagger
 * tags:
 *   name: Bank Accounts
 *   description: Quản lý tài khoản ngân hàng
 */

/**
 * @swagger
 * /api/bank-accounts:
 *   get:
 *     summary: Lấy danh sách tài khoản ngân hàng
 *     tags: [Bank Accounts]
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo tên, số tài khoản, ngân hàng
 *     responses:
 *       200:
 *         description: Danh sách tài khoản ngân hàng
 */
router.get('/',
  auth,
  async (req, res) => {
    try {
      const result = await bankAccountService.getAllBankAccounts({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        store_id: req.query.store_id ? parseInt(req.query.store_id) : undefined,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        search: req.query.search
      });

      return success(res, result.data, 'Bank accounts retrieved successfully', 200, result.pagination);
    } catch (err) {
      console.error('Get bank accounts error:', err);
      return error(res, 'Failed to retrieve bank accounts', 500);
    }
  }
);

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   get:
 *     summary: Lấy chi tiết tài khoản ngân hàng
 *     tags: [Bank Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tài khoản
 *     responses:
 *       200:
 *         description: Chi tiết tài khoản ngân hàng
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.get('/:id',
  auth,
  async (req, res) => {
    try {
      const account = await bankAccountService.getBankAccountById(parseInt(req.params.id));

      if (!account) {
        return error(res, 'Bank account not found', 404);
      }

      return success(res, account, 'Bank account retrieved successfully');
    } catch (err) {
      console.error('Get bank account error:', err);
      return error(res, 'Failed to retrieve bank account', 500);
    }
  }
);

/**
 * @swagger
 * /api/bank-accounts:
 *   post:
 *     summary: Thêm tài khoản ngân hàng mới
 *     tags: [Bank Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_name
 *               - account_number
 *               - bank_name
 *               - bank_code
 *             properties:
 *               account_name:
 *                 type: string
 *                 description: Tên chủ tài khoản
 *               account_number:
 *                 type: string
 *                 description: Số tài khoản
 *               bank_name:
 *                 type: string
 *                 description: Tên ngân hàng
 *               bank_code:
 *                 type: string
 *                 description: Mã ngân hàng (VCB, TCB, ACB...)
 *               branch:
 *                 type: string
 *                 description: Chi nhánh
 *               store_id:
 *                 type: integer
 *                 description: ID cửa hàng (null = dùng chung)
 *               is_default:
 *                 type: boolean
 *                 description: Đặt làm mặc định
 *               notes:
 *                 type: string
 *                 description: Ghi chú
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/',
  auth,
  authorize(['admin', 'manager']),
  validate(bankAccountValidator.createSchema),
  async (req, res) => {
    try {
      const account = await bankAccountService.createBankAccount(req.body, req.user.id);
      return success(res, account, 'Bank account created successfully', 201);
    } catch (err) {
      console.error('Create bank account error:', err);
      return error(res, err.message || 'Failed to create bank account', 500);
    }
  }
);

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   put:
 *     summary: Cập nhật tài khoản ngân hàng
 *     tags: [Bank Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tài khoản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *               account_number:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               bank_code:
 *                 type: string
 *               branch:
 *                 type: string
 *               store_id:
 *                 type: integer
 *               is_default:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.put('/:id',
  auth,
  authorize(['admin', 'manager']),
  validate(bankAccountValidator.updateSchema),
  async (req, res) => {
    try {
      const account = await bankAccountService.updateBankAccount(
        parseInt(req.params.id),
        req.body
      );

      if (!account) {
        return error(res, 'Bank account not found', 404);
      }

      return success(res, account, 'Bank account updated successfully');
    } catch (err) {
      console.error('Update bank account error:', err);
      return error(res, err.message || 'Failed to update bank account', 500);
    }
  }
);

/**
 * @swagger
 * /api/bank-accounts/{id}:
 *   delete:
 *     summary: Xóa tài khoản ngân hàng (soft delete)
 *     tags: [Bank Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tài khoản
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.delete('/:id',
  auth,
  authorize(['admin', 'manager']),
  async (req, res) => {
    try {
      const deleted = await bankAccountService.deleteBankAccount(parseInt(req.params.id));

      if (!deleted) {
        return error(res, 'Bank account not found', 404);
      }

      return success(res, null, 'Bank account deleted successfully');
    } catch (err) {
      console.error('Delete bank account error:', err);
      return error(res, 'Failed to delete bank account', 500);
    }
  }
);

/**
 * @swagger
 * /api/bank-accounts/{id}/qr:
 *   get:
 *     summary: Tạo mã QR thanh toán
 *     tags: [Bank Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tài khoản
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         description: Số tiền thanh toán
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Nội dung thanh toán
 *       - in: query
 *         name: order_code
 *         schema:
 *           type: string
 *         description: Mã đơn hàng
 *     responses:
 *       200:
 *         description: Thông tin QR thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bank_code:
 *                   type: string
 *                 bank_name:
 *                   type: string
 *                 account_number:
 *                   type: string
 *                 account_name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 qr_url:
 *                   type: string
 *                   description: URL hình ảnh QR từ VietQR
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.get('/:id/qr',
  auth,
  async (req, res) => {
    try {
      const qrData = await bankAccountService.generatePaymentQR(
        parseInt(req.params.id),
        {
          amount: req.query.amount ? parseFloat(req.query.amount) : undefined,
          description: req.query.description,
          order_code: req.query.order_code
        }
      );

      return success(res, qrData, 'Payment QR generated successfully');
    } catch (err) {
      console.error('Generate QR error:', err);
      
      if (err.message === 'Bank account not found') {
        return error(res, err.message, 404);
      }
      if (err.message === 'Bank account is inactive') {
        return error(res, err.message, 400);
      }
      
      return error(res, 'Failed to generate payment QR', 500);
    }
  }
);

module.exports = router;

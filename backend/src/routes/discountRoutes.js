/**
 * ============================================================================
 *                    MODULE 13: DISCOUNT ROUTES
 * ============================================================================
 * API endpoints quản lý khuyến mại/mã giảm giá
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const discountService = require('../services/discountService');
const { authenticate, authorize, validate } = require('../middleware');
const { discountValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   name: Discounts
 *   description: Quản lý khuyến mại/mã giảm giá
 */

/**
 * @swagger
 * /api/discounts:
 *   get:
 *     summary: Lấy danh sách khuyến mại
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã hoặc tên
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, FREE_SHIPPING]
 *         description: Loại khuyến mại
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, upcoming, inactive]
 *         description: Trạng thái
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, code, name, start_date, end_date, discount_value]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Danh sách khuyến mại
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
 *                     $ref: '#/components/schemas/Discount'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticate, discountService.getDiscounts);

/**
 * @swagger
 * /api/discounts/types:
 *   get:
 *     summary: Lấy danh sách loại khuyến mại
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách loại khuyến mại
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
 *                     $ref: '#/components/schemas/DiscountType'
 */
router.get('/types', authenticate, discountService.getDiscountTypes);

/**
 * @swagger
 * /api/discounts/validate:
 *   post:
 *     summary: Kiểm tra mã khuyến mại (dùng cho POS)
 *     tags: [Discounts]
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
 *                 description: Mã khuyến mại
 *               order_amount:
 *                 type: number
 *                 description: Giá trị đơn hàng
 *               customer_id:
 *                 type: integer
 *                 description: ID khách hàng
 *               items:
 *                 type: array
 *                 description: Danh sách sản phẩm
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Mã hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     discount_id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     discount_amount:
 *                       type: number
 *       400:
 *         description: Mã không hợp lệ
 */
router.post('/validate', 
  authenticate, 
  validate(discountValidator.validateCode),
  discountService.validateDiscount
);

/**
 * @swagger
 * /api/discounts/{id}:
 *   get:
 *     summary: Lấy chi tiết khuyến mại
 *     tags: [Discounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID khuyến mại
 *     responses:
 *       200:
 *         description: Chi tiết khuyến mại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *       404:
 *         description: Không tìm thấy khuyến mại
 */
router.get('/:id', authenticate, discountService.getDiscountById);

/**
 * @swagger
 * /api/discounts:
 *   post:
 *     summary: Tạo khuyến mại mới
 *     tags: [Discounts]
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
 *               - name
 *               - discount_type
 *               - discount_value
 *               - start_date
 *               - end_date
 *             properties:
 *               code:
 *                 type: string
 *                 description: Mã khuyến mại (unique)
 *               name:
 *                 type: string
 *                 description: Tên khuyến mại
 *               description:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, FREE_SHIPPING]
 *               discount_value:
 *                 type: number
 *                 description: Giá trị giảm (% hoặc số tiền)
 *               max_discount_amount:
 *                 type: number
 *                 description: Số tiền giảm tối đa
 *               min_order_amount:
 *                 type: number
 *                 description: Giá trị đơn hàng tối thiểu
 *               max_uses_total:
 *                 type: integer
 *                 description: Tổng lượt sử dụng tối đa
 *               max_uses_per_customer:
 *                 type: integer
 *                 default: 1
 *               applies_to:
 *                 type: string
 *                 enum: [all, categories, products]
 *                 default: all
 *               applicable_product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               applicable_category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               customer_group_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', 
  authenticate, 
  authorize(['admin', 'manager']),
  validate(discountValidator.createDiscount),
  discountService.createDiscount
);

/**
 * @swagger
 * /api/discounts/{id}:
 *   put:
 *     summary: Cập nhật khuyến mại
 *     tags: [Discounts]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, FREE_SHIPPING]
 *               discount_value:
 *                 type: number
 *               max_discount_amount:
 *                 type: number
 *               min_order_amount:
 *                 type: number
 *               max_uses_total:
 *                 type: integer
 *               max_uses_per_customer:
 *                 type: integer
 *               applies_to:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy khuyến mại
 */
router.put('/:id', 
  authenticate, 
  authorize(['admin', 'manager']),
  validate(discountValidator.updateDiscount),
  discountService.updateDiscount
);

/**
 * @swagger
 * /api/discounts/{id}:
 *   delete:
 *     summary: Xóa khuyến mại
 *     tags: [Discounts]
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
 *         description: Không tìm thấy khuyến mại
 */
router.delete('/:id', 
  authenticate, 
  authorize(['admin', 'manager']),
  discountService.deleteDiscount
);

/**
 * @swagger
 * /api/discounts/{id}/deactivate:
 *   patch:
 *     summary: Kết thúc khuyến mại
 *     tags: [Discounts]
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
 *         description: Kết thúc thành công
 *       404:
 *         description: Không tìm thấy khuyến mại
 */
router.patch('/:id/deactivate', 
  authenticate, 
  authorize(['admin', 'manager']),
  discountService.deactivateDiscount
);

module.exports = router;

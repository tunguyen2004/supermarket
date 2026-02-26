const express = require("express");
const router = express.Router();

const posService = require("../services/posService");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { posValidator } = require("../validators");

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
router.post(
  "/checkout",
  verifyToken,
  validate(posValidator.checkoutSchema),
  posService.checkout,
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
router.get("/products/search", verifyToken, posService.searchProducts);

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
router.get(
  "/products/:variantId/price",
  verifyToken,
  posService.getProductPrice,
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
router.post(
  "/orders/draft",
  verifyToken,
  validate(posValidator.draftSchema),
  posService.saveDraft,
);

/**
 * @swagger
 * /api/pos/orders/draft/create-empty:
 *   post:
 *     summary: Tạo đơn hàng tạm trống khi mở POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               store_id:
 *                 type: integer
 *                 description: ID cửa hàng
 *     responses:
 *       201:
 *         description: Tạo đơn tạm trống thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/orders/draft/create-empty",
  verifyToken,
  posService.createEmptyDraft,
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
router.get("/orders/drafts", verifyToken, posService.getDrafts);

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
router.get("/orders/drafts/:id", verifyToken, posService.getDraftById);

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
router.put("/orders/draft/:id", verifyToken, posService.updateDraft);

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
router.delete("/orders/draft/:id", verifyToken, posService.deleteDraft);

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
router.get("/orders/:id/receipt", verifyToken, posService.getReceipt);

/**
 * @swagger
 * /api/pos/discounts/active:
 *   get:
 *     summary: Lấy danh sách mã giảm giá đang hoạt động cho POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *         description: ID khách hàng (optional)
 *       - in: query
 *         name: order_amount
 *         schema:
 *           type: number
 *         description: Tổng tiền đơn hàng (optional)
 *     responses:
 *       200:
 *         description: Danh sách mã giảm giá đang hoạt động
 */
router.get("/discounts/active", verifyToken, posService.getActiveDiscountsForPOS);

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
router.post(
  "/discounts/validate",
  verifyToken,
  posService.validateDiscountCode,
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
router.get("/payment-methods", verifyToken, posService.getPaymentMethods);

/**
 * @swagger
 * /api/pos/qr/generate:
 *   post:
 *     summary: Tạo mã QR thanh toán chuyển khoản (VietQR)
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Số tiền thanh toán
 *               order_info:
 *                 type: string
 *                 description: Mã đơn hàng
 *     responses:
 *       200:
 *         description: Tạo QR thành công
 */
router.post("/qr/generate", verifyToken, posService.generateQRCode);

/**
 * @swagger
 * /api/pos/webhook/sepay:
 *   post:
 *     summary: Webhook nhận thông báo giao dịch từ Sepay.vn
 *     tags: [POS]
 *     description: |
 *       Endpoint nhận webhook từ Sepay.vn khi có giao dịch ngân hàng.
 *       Sepay gửi POST request mỗi khi phát hiện giao dịch mới.
 *       Xác thực bằng API Key trong header Authorization.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               gateway: { type: string }
 *               transferType: { type: string, enum: [in, out] }
 *               transferAmount: { type: number }
 *               content: { type: string }
 *               accountNumber: { type: string }
 *               referenceCode: { type: string }
 *               transactionDate: { type: string }
 *     responses:
 *       200:
 *         description: Webhook nhận thành công
 */
router.post(
  "/webhook/sepay",
  (req, res, next) => {
    // Log webhook request cho debug
    const authHeader = req.headers.authorization || "";
    console.log(
      `[Sepay Webhook] Received webhook, auth: ${authHeader ? authHeader.substring(0, 30) + "..." : "NONE"}`,
    );

    // Xác thực Sepay webhook key (nếu có cấu hình SEPAY_WEBHOOK_KEY)
    // Nếu không có SEPAY_WEBHOOK_KEY, chấp nhận mọi request (dùng với ngrok)
    const webhookKey = process.env.SEPAY_WEBHOOK_KEY;
    if (webhookKey) {
      const providedKey = authHeader.replace(/^(Apikey|Bearer)\s+/i, "").trim();
      if (providedKey !== webhookKey) {
        console.warn("[Sepay Webhook] Invalid webhook key, rejecting");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
    }
    next();
  },
  posService.handleSepayWebhook,
);

/**
 * @swagger
 * /api/pos/qr/check-payment:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán QR
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: account_number
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: transfer_content
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trạng thái thanh toán
 */
router.get("/qr/check-payment", verifyToken, posService.checkQRPayment);

module.exports = router;

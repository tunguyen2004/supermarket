/**
 * ============================================================================
 *                    MODULE 19: CHATBOT ROUTES
 * ============================================================================
 * API endpoints cho chatbot AI
 * Base path: /api/chatbot
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');
const { authenticate } = require('../middleware');
const validate = require('../middleware/validate');
const { chatbotValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chatbot AI hỗ trợ quản lý siêu thị
 */

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Gửi tin nhắn cho chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Tin nhắn người dùng
 *                 example: "Doanh thu hôm nay bao nhiêu?"
 *               session_id:
 *                 type: string
 *                 description: ID phiên chat (tùy chọn, auto-generate nếu không có)
 *                 example: "chat_1707456000_abc123"
 *     responses:
 *       200:
 *         description: Phản hồi từ chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                       description: Câu trả lời của chatbot
 *                     intent:
 *                       type: string
 *                       description: Intent được phân loại
 *                     data:
 *                       type: object
 *                       description: Dữ liệu truy vấn (nếu có)
 *                     type:
 *                       type: string
 *                       description: Loại response
 *                     processing_time_ms:
 *                       type: number
 *                       description: Thời gian xử lý (ms)
 *                     session_id:
 *                       type: string
 *       400:
 *         description: Tin nhắn không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post(
  '/message',
  authenticate,
  validate(chatbotValidator.sendMessageSchema),
  chatbotService.sendMessage
);

/**
 * @swagger
 * /api/chatbot/suggestions:
 *   get:
 *     summary: Lấy danh sách gợi ý câu hỏi
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách gợi ý theo category
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
 *                       category:
 *                         type: string
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get('/suggestions', authenticate, chatbotService.getSuggestions);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Lấy lịch sử chat
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         description: Lọc theo phiên chat
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Số lượng tin nhắn
 *     responses:
 *       200:
 *         description: Lịch sử chat
 */
router.get(
  '/history',
  authenticate,
  validate.validateQuery(chatbotValidator.chatHistoryQuerySchema),
  chatbotService.getChatHistory
);

/**
 * @swagger
 * /api/chatbot/history:
 *   delete:
 *     summary: Xóa lịch sử chat
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         description: Xóa theo phiên chat (không truyền = xóa tất cả)
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/history', authenticate, chatbotService.deleteChatHistory);

/**
 * @swagger
 * /api/chatbot/faq:
 *   get:
 *     summary: Lấy danh sách FAQ
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *     responses:
 *       200:
 *         description: Danh sách câu hỏi thường gặp
 */
router.get('/faq', authenticate, chatbotService.getFAQList);

module.exports = router;

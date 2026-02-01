/**
 * Authentication Routes
 * @module routes/authRoutes
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { verifyToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { loginSchema, refreshTokenSchema } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/login', authLimiter, validateBody(loginSchema), authService.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', verifyToken, authService.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Làm mới token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token đã được làm mới
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/refresh', validateBody(refreshTokenSchema), authService.refreshToken);

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy danh sách roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách roles
 */
router.get('/roles', verifyToken, authService.getRoles);

module.exports = router;

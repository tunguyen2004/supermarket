/**
 * Profile Routes
 * @module routes/profileRoutes
 */

const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');
const { verifyToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { updateProfileSchema, changePasswordSchema } = require('../validators/profileValidator');
const { uploadAvatar, handleMulterError } = require('../middleware/upload');
const { uploadLimiter, strictLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Xem thông tin profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 */
router.get('/profile', verifyToken, profileService.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Cập nhật profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/profile', verifyToken, validateBody(updateProfileSchema), profileService.updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags: [Profile]
 *     summary: Đổi mật khẩu
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword, confirmPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */
router.put('/change-password', verifyToken, strictLimiter, validateBody(changePasswordSchema), profileService.changePassword);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload ảnh đại diện
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post('/avatar', verifyToken, uploadLimiter, uploadAvatar.single('avatar'), handleMulterError, profileService.uploadAvatar);

/**
 * @swagger
 * /api/users/avatar:
 *   delete:
 *     tags: [Profile]
 *     summary: Xóa ảnh đại diện
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/avatar', verifyToken, profileService.deleteAvatar);

module.exports = router;

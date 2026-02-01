/**
 * Staff Management Routes
 * @module routes/staffRoutes
 */

const express = require('express');
const router = express.Router();
const staffService = require('../services/staffService');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { 
  addStaffSchema, 
  updateStaffSchema, 
  updateRoleSchema,
  idParamSchema,
  listQuerySchema
} = require('../validators/staffValidator');

/**
 * @swagger
 * /api/staff:
 *   get:
 *     tags: [Staff]
 *     summary: Danh sách nhân viên
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', verifyToken, requireAdmin, validateQuery(listQuerySchema), staffService.getStaffList);

/**
 * @swagger
 * /api/staff:
 *   post:
 *     tags: [Staff]
 *     summary: Thêm nhân viên mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffRequest'
 *     responses:
 *       201:
 *         description: Thêm nhân viên thành công
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', verifyToken, requireAdmin, validateBody(addStaffSchema), staffService.addStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Chi tiết nhân viên
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
 *         description: Thông tin chi tiết nhân viên
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', verifyToken, requireAdmin, validateParams(idParamSchema), staffService.getStaffDetail);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     tags: [Staff]
 *     summary: Cập nhật thông tin nhân viên
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
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', verifyToken, requireAdmin, validateParams(idParamSchema), validateBody(updateStaffSchema), staffService.updateStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     tags: [Staff]
 *     summary: Xóa nhân viên
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
 */
router.delete('/:id', verifyToken, requireAdmin, validateParams(idParamSchema), staffService.deleteStaff);

/**
 * @swagger
 * /api/staff/{id}/role:
 *   put:
 *     tags: [Staff]
 *     summary: Phân quyền cho nhân viên
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
 *             required: [role_id]
 *             properties:
 *               role_id:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Cập nhật quyền thành công
 */
router.put('/:id/role', verifyToken, requireAdmin, validateParams(idParamSchema), validateBody(updateRoleSchema), staffService.updateStaffRole);

module.exports = router;

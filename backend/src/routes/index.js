const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const staffService = require('../services/staffService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ============ AUTHENTICATION ROUTES (Module 1) ============

// Đăng nhập - POST /api/auth/login
router.post('/auth/login', authService.login);

// Đăng xuất - POST /api/auth/logout
router.post('/auth/logout', verifyToken, authService.logout);

// Refresh token - POST /api/auth/refresh
router.post('/auth/refresh', authService.refreshToken);

// Lấy thông tin user đang đăng nhập - GET /api/auth/me
router.get('/auth/me', verifyToken, authService.getMe);

// ============ PROFILE ROUTES (Module 2) ============

// Xem thông tin cá nhân - GET /api/users/profile
router.get('/users/profile', verifyToken, profileService.getProfile);

// Cập nhật thông tin cá nhân - PUT /api/users/profile
router.put('/users/profile', verifyToken, profileService.updateProfile);

// Đổi mật khẩu - PUT /api/users/change-password
router.put('/users/change-password', verifyToken, profileService.changePassword);

// Upload avatar - POST /api/users/avatar
// (Cần cài multer để xử lý file upload)
router.post('/users/avatar', verifyToken, profileService.uploadAvatar);

// ============ STAFF ROUTES (Module 3) ============

// Danh sách nhân viên - GET /api/staff
router.get('/staff', verifyToken, staffService.getStaffList);

// Thêm nhân viên - POST /api/staff
router.post('/staff', verifyToken, staffService.addStaff);

// Chi tiết nhân viên - GET /api/staff/:id
router.get('/staff/:id', verifyToken, staffService.getStaffDetail);

// Sửa nhân viên - PUT /api/staff/:id
router.put('/staff/:id', verifyToken, staffService.updateStaff);

// Xóa nhân viên - DELETE /api/staff/:id
router.delete('/staff/:id', verifyToken, staffService.deleteStaff);

// Phân quyền nhân viên - PUT /api/staff/:id/role
router.put('/staff/:id/role', verifyToken, staffService.updateStaffRole);

module.exports = router;

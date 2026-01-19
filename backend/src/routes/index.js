const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const staffService = require('../services/staffService');
const productService = require('../services/productService');
const collectionService = require('../services/collectionService');
const { verifyToken } = require('../middleware/auth');
const { uploadCSV, handleMulterError } = require('../middleware/upload');

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

// ============ PRODUCT ROUTES (Module 4) ============

// Danh sách sản phẩm - GET /api/products
router.get('/products', verifyToken, productService.getProducts);

// Export sản phẩm - GET /api/products/export (phải đặt trước /:id)
router.get('/products/export', verifyToken, productService.exportProducts);

// Bật/tắt trạng thái hàng loạt - PATCH /api/products/bulk-status
router.patch('/products/bulk-status', verifyToken, productService.bulkUpdateStatus);

// Import sản phẩm - POST /api/products/import
router.post('/products/import', verifyToken, uploadCSV.single('file'), handleMulterError, productService.importProducts);

// Thêm sản phẩm - POST /api/products
router.post('/products', verifyToken, productService.createProduct);

// Chi tiết sản phẩm - GET /api/products/:id
router.get('/products/:id', verifyToken, productService.getProductById);

// Sửa sản phẩm - PUT /api/products/:id
router.put('/products/:id', verifyToken, productService.updateProduct);

// Xóa sản phẩm - DELETE /api/products/:id
router.delete('/products/:id', verifyToken, productService.deleteProduct);

// Danh sách thương hiệu - GET /api/brands
router.get('/brands', verifyToken, productService.getBrands);

// Danh sách đơn vị tính - GET /api/units
router.get('/units', verifyToken, productService.getUnits);

// ============ COLLECTION ROUTES (Module 5) ============

// Danh sách danh mục - GET /api/collections
router.get('/collections', verifyToken, collectionService.getCollections);

// Cây danh mục - GET /api/collections/tree
router.get('/collections/tree', verifyToken, collectionService.getCollectionTree);

// Thêm danh mục - POST /api/collections
router.post('/collections', verifyToken, collectionService.createCollection);

// Chi tiết danh mục - GET /api/collections/:id
router.get('/collections/:id', verifyToken, collectionService.getCollectionById);

// Sửa danh mục - PUT /api/collections/:id
router.put('/collections/:id', verifyToken, collectionService.updateCollection);

// Xóa danh mục - DELETE /api/collections/:id
router.delete('/collections/:id', verifyToken, collectionService.deleteCollection);

module.exports = router;

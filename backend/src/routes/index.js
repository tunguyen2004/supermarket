const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const staffService = require('../services/staffService');
const productService = require('../services/productService');
const collectionService = require('../services/collectionService');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin, requireManagerOrAdmin, requireRole } = require('../middleware/authorize');
const { uploadCSV, uploadAvatar, handleMulterError } = require('../middleware/upload');

const router = express.Router();

/**
 * ============================================================================
 *                    MODULE 1: AUTHENTICATION ROUTES
 * ============================================================================
 * Quản lý đăng nhập, đăng xuất, refresh token và lấy thông tin user
 */

/**
 * @POST /api/auth/login
 * @description Đăng nhập bằng username và password
 * @body { username: string, password: string }
 * @returns { id, username, email, full_name, token }
 */
router.post('/auth/login', authService.login);

/**
 * @POST /api/auth/logout
 * @description Đăng xuất (phía client xóa token)
 * @headers Authorization: Bearer <token>
 * @returns { message: "Logout successful" }
 */
router.post('/auth/logout', verifyToken, authService.logout);

/**
 * @POST /api/auth/refresh
 * @description Làm mới token khi hết hạn
 * @body { token: string }
 * @returns { token, wasExpired }
 */
router.post('/auth/refresh', authService.refreshToken);

/**
 * @GET /api/auth/roles
 * @description Lấy danh sách role và quyền hạn của chúng
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns { roles: { 1: { name, description, permissions }, ... } }
 */
router.get('/auth/roles', verifyToken, authService.getRoles);

/**
 * ============================================================================
 *                    MODULE 2: STAFF MANAGEMENT ROUTES
 * ============================================================================
 * Quản lý danh sách nhân viên, thêm, sửa, xóa, phân quyền
 * ⚠️ Chỉ ADMIN (role_id = 1) mới có quyền truy cập
 */

/**
 * @GET /api/staff
 * @description Danh sách tất cả nhân viên (có phân trang)
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @query { limit: number, offset: number }
 * @returns { data: [{ id, username, email, full_name, phone, is_active }], pagination }
 */
router.get('/staff', verifyToken, requireAdmin, staffService.getStaffList);

/**
 * @POST /api/staff
 * @description Thêm nhân viên mới
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @body { username, email, full_name, phone, password, role_id }
 * @returns { id, username, email, full_name, phone, is_active }
 */
router.post('/staff', verifyToken, requireAdmin, staffService.addStaff);

/**
 * @GET /api/staff/:id
 * @description Chi tiết thông tin nhân viên
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID nhân viên
 * @returns { id, username, email, full_name, phone, is_active, created_at }
 */
router.get('/staff/:id', verifyToken, requireAdmin, staffService.getStaffDetail);

/**
 * @PUT /api/staff/:id
 * @description Cập nhật thông tin nhân viên (full_name, phone)
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID nhân viên
 * @body { full_name, phone }
 * @returns { id, username, email, full_name, phone, is_active }
 */
router.put('/staff/:id', verifyToken, requireAdmin, staffService.updateStaff);

/**
 * @DELETE /api/staff/:id
 * @description Xóa nhân viên
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID nhân viên
 * @returns { message: "Staff deleted successfully" }
 */
router.delete('/staff/:id', verifyToken, requireAdmin, staffService.deleteStaff);

/**
 * @PUT /api/staff/:id/role
 * @description Phân quyền cho nhân viên (thay đổi role)
 * @auth Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID nhân viên
 * @body { role_id: 1|2|3 } - 1=Admin, 2=Staff, 3=Manager
 * @returns { id, username, email, full_name, role_id, is_active }
 */
router.put('/staff/:id/role', verifyToken, requireAdmin, staffService.updateStaffRole);

/**
 * ============================================================================
 *                    MODULE 3: PROFILE MANAGEMENT ROUTES
 * ============================================================================
 * Quản lý thông tin cá nhân, cập nhật profile, đổi mật khẩu
 */

/**
 * @GET /api/users/profile
 * @description Xem thông tin profile cá nhân
 * @headers Authorization: Bearer <token>
 * @returns { id, username, email, full_name, phone, is_active, created_at }
 */
router.get('/users/profile', verifyToken, profileService.getProfile);

/**
 * @PUT /api/users/profile
 * @description Cập nhật thông tin profile (full_name, phone)
 * @headers Authorization: Bearer <token>
 * @body { full_name, phone }
 * @returns { id, username, email, full_name, phone, is_active }
 */
router.put('/users/profile', verifyToken, profileService.updateProfile);

/**
 * @PUT /api/users/change-password
 * @description Đổi mật khẩu người dùng
 * @headers Authorization: Bearer <token>
 * @body { oldPassword, newPassword, confirmPassword }
 * @returns { message: "Password changed successfully" }
 */
router.put('/users/change-password', verifyToken, profileService.changePassword);

/**
 * @POST /api/users/avatar
 * @description Upload ảnh đại diện
 * @headers Authorization: Bearer <token>
 * @form-data { avatar: File (JPG, PNG, GIF, WEBP - max 5MB) }
 * @returns { avatar_url, user }
 */
router.post('/users/avatar', verifyToken, uploadAvatar.single('avatar'), handleMulterError, profileService.uploadAvatar);

/**
 * @DELETE /api/users/avatar
 * @description Xóa ảnh đại diện
 * @headers Authorization: Bearer <token>
 * @returns { message: "Avatar deleted successfully" }
 */
router.delete('/users/avatar', verifyToken, profileService.deleteAvatar);

/**
 * ============================================================================
 *                    MODULE 4: PRODUCT MANAGEMENT ROUTES
 * ============================================================================
 * Quản lý sản phẩm, thêm, sửa, xóa, import/export, danh sách thương hiệu, đơn vị
 * 
 * Quyền truy cập:
 * - Xem danh sách, chi tiết, xuất: Tất cả role (verifyToken)
 * - Thêm, sửa, xóa, import: Chỉ Manager hoặc Admin (requireManagerOrAdmin)
 */

/**
 * @GET /api/products
 * @description Danh sách sản phẩm (có phân trang và lọc)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { search, category_id, brand_id, is_active, page, limit }
 * @returns { products: [{ id, code, name, category_name, brand_name, unit_name, is_active, price }], pagination }
 */
router.get('/products', verifyToken, productService.getProducts);

/**
 * @POST /api/products
 * @description Thêm sản phẩm mới
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { code, name, category_id, brand_id, unit_id, description, is_active, sku, barcode, cost_price, selling_price }
 * @returns { product: { id, code, name }, variant: { id, sku } }
 */
router.post('/products', verifyToken, requireManagerOrAdmin, productService.createProduct);

/**
 * @GET /api/products/export
 * @description Export danh sách sản phẩm ra file CSV
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns File CSV
 */
router.get('/products/export', verifyToken, productService.exportProducts);

/**
 * @POST /api/products/import
 * @description Import sản phẩm từ file CSV
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @form-data { file: File }
 * @returns { total, success, errors, errorDetails }
 */
router.post('/products/import', verifyToken, requireManagerOrAdmin, uploadCSV.single('file'), handleMulterError, productService.importProducts);

/**
 * @PATCH /api/products/bulk-status
 * @description Bật/tắt trạng thái hàng loạt cho nhiều sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { product_ids: [number], is_active: boolean }
 * @returns { updated_count: number }
 */
router.patch('/products/bulk-status', verifyToken, requireManagerOrAdmin, productService.bulkUpdateStatus);

/**
 * @GET /api/products/:id
 * @description Chi tiết thông tin sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param id - ID sản phẩm
 * @returns { id, code, name, category_name, brand_name, unit_name, variants: [{ id, sku, barcode, selling_price }] }
 */
router.get('/products/:id', verifyToken, productService.getProductById);

/**
 * @PUT /api/products/:id
 * @description Cập nhật thông tin sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID sản phẩm
 * @body { name, description, is_active }
 * @returns { message: "Cập nhật sản phẩm thành công" }
 */
router.put('/products/:id', verifyToken, requireManagerOrAdmin, productService.updateProduct);

/**
 * @DELETE /api/products/:id
 * @description Xóa sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID sản phẩm
 * @returns { message: "Xóa sản phẩm thành công" }
 */
router.delete('/products/:id', verifyToken, requireManagerOrAdmin, productService.deleteProduct);

/**
 * @GET /api/brands
 * @description Danh sách tất cả thương hiệu
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns { data: [{ id, code, name }] }
 */
router.get('/brands', verifyToken, productService.getBrands);

/**
 * @GET /api/units
 * @description Danh sách tất cả đơn vị tính
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns { data: [{ id, code, name }] }
 */
router.get('/units', verifyToken, productService.getUnits);

/**
 * ============================================================================
 *                    MODULE 5: COLLECTION (CATEGORY) ROUTES
 * ============================================================================
 * Quản lý danh mục sản phẩm, hỗ trợ cấu trúc cây (tree) và lọc, tìm kiếm
 * 
 * Quyền truy cập:
 * - Xem danh sách, chi tiết, tree view: Tất cả role (verifyToken)
 * - Thêm, sửa, xóa: Chỉ Manager hoặc Admin (requireManagerOrAdmin)
 */

/**
 * @GET /api/collections
 * @description Danh sách danh mục sản phẩm (có phân trang và lọc)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { search, parent_id, page, limit }
 * @returns { collections: [{ id, code, name, parent_id, level, product_count }], pagination }
 */
router.get('/collections', verifyToken, collectionService.getCollections);

/**
 * @POST /api/collections
 * @description Thêm danh mục mới
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { code, name, parent_id }
 * @returns { message: "Thêm danh mục thành công" }
 */
router.post('/collections', verifyToken, requireManagerOrAdmin, collectionService.createCollection);

/**
 * @GET /api/collections/tree
 * @description Lấy cấu trúc cây danh mục (tree view)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns { data: [{ id, code, name, children: [] }] }
 */
router.get('/collections/tree', verifyToken, collectionService.getCollectionTree);

/**
 * @GET /api/collections/:id
 * @description Chi tiết thông tin danh mục
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param id - ID danh mục
 * @returns { id, code, name, parent_id, level, product_count }
 */
router.get('/collections/:id', verifyToken, collectionService.getCollectionById);

/**
 * @PUT /api/collections/:id
 * @description Cập nhật thông tin danh mục
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID danh mục
 * @body { name, parent_id }
 * @returns { message: "Cập nhật danh mục thành công" }
 */
router.put('/collections/:id', verifyToken, requireManagerOrAdmin, collectionService.updateCollection);

/**
 * @DELETE /api/collections/:id
 * @description Xóa danh mục
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID danh mục
 * @returns { message: "Xóa danh mục thành công" }
 * @note Không thể xóa danh mục nếu có sản phẩm hoặc danh mục con
 */
router.delete('/collections/:id', verifyToken, requireManagerOrAdmin, collectionService.deleteCollection);

/**
 * ============================================================================
 *                              EXPORT
 * ============================================================================
 * Xuất router để sử dụng trong app.js hoặc index.js
 */
module.exports = router;

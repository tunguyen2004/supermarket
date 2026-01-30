const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const staffService = require('../services/staffService');
const productService = require('../services/productService');
const collectionService = require('../services/collectionService');
const catalogService = require('../services/catalogService');
const inventoryService = require('../services/inventoryService');
const productImageService = require('../services/productImageService');
const dashboardService = require('../services/dashboardService');
const orderService = require('../services/orderService');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin, requireManagerOrAdmin, requireRole } = require('../middleware/authorize');
const { uploadCSV, uploadAvatar, uploadProductImage, uploadProductImages, handleMulterError } = require('../middleware/upload');

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
 * ============================================================================
 *                    PRODUCT IMAGE ROUTES
 * ============================================================================
 * Quản lý ảnh sản phẩm
 */

/**
 * @GET /api/products/:id/images
 * @description Lấy danh sách ảnh của sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param id - ID sản phẩm
 * @returns { main_image, gallery: [...] }
 */
router.get('/products/:id/images', verifyToken, productImageService.getProductImages);

/**
 * @POST /api/products/:id/image
 * @description Upload ảnh chính cho sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @form-data { image: File }
 * @returns { image_url }
 */
router.post('/products/:id/image', verifyToken, requireManagerOrAdmin, uploadProductImage.single('image'), handleMulterError, productImageService.uploadMainImage);

/**
 * @DELETE /api/products/:id/image
 * @description Xóa ảnh chính của sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID sản phẩm
 * @returns { message }
 */
router.delete('/products/:id/image', verifyToken, requireManagerOrAdmin, productImageService.deleteMainImage);

/**
 * @POST /api/products/:id/images
 * @description Upload nhiều ảnh cho sản phẩm (gallery)
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @form-data { images: File[] } (max 5 files)
 * @returns { images: [...] }
 */
router.post('/products/:id/images', verifyToken, requireManagerOrAdmin, uploadProductImages.array('images', 5), handleMulterError, productImageService.uploadGalleryImages);

/**
 * @DELETE /api/products/:id/images/:imageId
 * @description Xóa một ảnh trong gallery
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @returns { message }
 */
router.delete('/products/:id/images/:imageId', verifyToken, requireManagerOrAdmin, productImageService.deleteGalleryImage);

/**
 * @PUT /api/products/:id/images/:imageId/primary
 * @description Đặt một ảnh làm ảnh chính trong gallery
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @returns { message }
 */
router.put('/products/:id/images/:imageId/primary', verifyToken, requireManagerOrAdmin, productImageService.setPrimaryImage);

/**
 * @PUT /api/products/:id/images/reorder
 * @description Sắp xếp lại thứ tự ảnh
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { image_ids: [1, 3, 2] }
 * @returns { message }
 */
router.put('/products/:id/images/reorder', verifyToken, requireManagerOrAdmin, productImageService.reorderImages);

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

 *                    MODULE 6: DASHBOARD / REPORTS ROUTES
 * ============================================================================
 * APIs cho trang Dashboard và Reports
 */

/**
 * @GET /api/dashboard/overview
 * @description Lấy số liệu tổng quan cho trang Home Dashboard
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns { totalOrders, totalProducts, totalCustomers, totalRevenue, recentOrders }
 */
router.get('/dashboard/overview', verifyToken, dashboardService.getOverview);

/**
 * @GET /api/dashboard/stats
 * @description Lấy số liệu thống kê với so sánh kỳ trước (cho trang Reports)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { from: YYYY-MM-DD, to: YYYY-MM-DD }
 * @returns { totalRevenue, revenueChange, totalOrders, ordersChange, avgOrderValue, avgOrderChange, newCustomers, customersChange }
 */
router.get('/dashboard/stats', verifyToken, dashboardService.getStats);

/**
 * @GET /api/dashboard/revenue-chart
 * @description Lấy dữ liệu cho biểu đồ doanh thu
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { from, to, groupBy: day|week|month }
 * @returns { labels, datasets }
 */
router.get('/dashboard/revenue-chart', verifyToken, dashboardService.getRevenueChart);

/**
 * @GET /api/dashboard/top-products
 * @description Lấy top sản phẩm bán chạy
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { limit, from, to }
 * @returns [{ id, name, quantity }]
 */
router.get('/dashboard/top-products', verifyToken, dashboardService.getTopProducts);

/**
 * @GET /api/dashboard/sales-channels
 * @description Phân loại doanh thu theo kênh bán hàng
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { from, to }
 * @returns [{ channel, revenue, percentage }]
 */
router.get('/dashboard/sales-channels', verifyToken, dashboardService.getSalesChannels);

/**
 * @GET /api/dashboard/top-customers
 * @description Top khách hàng chi tiêu nhiều nhất
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { limit, from, to }
 * @returns [{ id, name, totalSpent, avatarUrl }]
 */
router.get('/dashboard/top-customers', verifyToken, dashboardService.getTopCustomers);

/**
 * @GET /api/dashboard/low-stock
 * @description Danh sách sản phẩm sắp hết hàng
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { threshold, limit }
 * @returns [{ id, name, stock, imageUrl }]
 */
router.get('/dashboard/low-stock', verifyToken, dashboardService.getLowStock);

/**
 * ============================================================================
 *                    MODULE 7: CATALOG (PRICE LIST) ROUTES
 * ============================================================================
 * Quản lý bảng giá sản phẩm
 * Sử dụng bảng: dim_product_variants
 * 
 * Quyền truy cập:
 * - Xem danh sách, chi tiết, xuất: Tất cả role (verifyToken)
 * - Cập nhật giá: Chỉ Manager hoặc Admin (requireManagerOrAdmin)
 */

/**
 * @GET /api/catalogs
 * @description Danh sách bảng giá sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { search, page, limit }
 * @returns { data: [{ id, code, name, sku, price, unit }], pagination }
 */
router.get('/catalogs', verifyToken, catalogService.getCatalogs);

/**
 * @GET /api/catalogs/export
 * @description Xuất bảng giá ra file CSV
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns File CSV
 */
router.get('/catalogs/export', verifyToken, catalogService.exportCatalogs);

/**
 * @PATCH /api/catalogs/bulk-update
 * @description Cập nhật giá hàng loạt
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { variant_ids: [number], price_change_type: 'fixed'|'percent', price_change_value: number }
 * @returns { updated_count, message }
 */
router.patch('/catalogs/bulk-update', verifyToken, requireManagerOrAdmin, catalogService.bulkUpdateCatalogs);

/**
 * @GET /api/catalogs/:id
 * @description Chi tiết bảng giá sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param id - ID variant sản phẩm
 * @returns { id, code, name, sku, cost_price, price, unit }
 */
router.get('/catalogs/:id', verifyToken, catalogService.getCatalogById);

/**
 * @PUT /api/catalogs/:id
 * @description Cập nhật giá sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param id - ID variant sản phẩm
 * @body { cost_price, selling_price, is_active }
 * @returns { message, data }
 */
router.put('/catalogs/:id', verifyToken, requireManagerOrAdmin, catalogService.updateCatalog);

/**
 * ============================================================================
 *                    MODULE 8: INVENTORY MANAGEMENT ROUTES
 * ============================================================================
 * Quản lý tồn kho, nhập kho, chuyển kho, trả hàng
 * Sử dụng bảng: fact_inventory_stocks, fact_inventory_transactions
 * 
 * Quyền truy cập:
 * - Xem: Tất cả role (verifyToken)
 * - Thao tác kho: Manager hoặc Admin (requireManagerOrAdmin)
 */
/**
 * @GET /api/inventories
 * @description Danh sách tồn kho sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { search, store_id, status, page, limit }
 * @returns { data: [{ id, code, name, stock, location, stock_status }], pagination }
 */
router.get('/inventories', verifyToken, inventoryService.getInventories);

/**
 * @POST /api/inventories/receive
 * @description Nhập kho sản phẩm
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { store_id, items: [{ variant_id, quantity, unit_cost }], notes }
 * @returns { message, transaction_codes }
 */
router.post('/inventories/receive', verifyToken, requireManagerOrAdmin, inventoryService.receiveInventory);

/**
 * @POST /api/inventories/transfer
 * @description Chuyển kho giữa các cửa hàng
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { from_store_id, to_store_id, items: [{ variant_id, quantity }], notes }
 * @returns { message, transaction_codes }
 */
router.post('/inventories/transfer', verifyToken, requireManagerOrAdmin, inventoryService.transferStock);

/**
 * @POST /api/inventories/return
 * @description Trả hàng nhà cung cấp
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @body { store_id, items: [{ variant_id, quantity }], notes }
 * @returns { message, transaction_codes }
 */
router.post('/inventories/return', verifyToken, requireManagerOrAdmin, inventoryService.returnToSupplier);

/**
 * @GET /api/inventories/:variantId
 * @description Chi tiết tồn kho của sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param variantId - ID variant sản phẩm
 * @query { store_id }
 * @returns { variant_info, stock_by_store: [...] }
 */
router.get('/inventories/:variantId', verifyToken, inventoryService.getInventoryById);

/**
 * @PUT /api/inventories/:variantId
 * @description Điều chỉnh số lượng tồn kho
 * @auth Manager or Admin only
 * @headers Authorization: Bearer <token>
 * @param variantId - ID variant sản phẩm
 * @body { store_id, quantity, adjustment_type: 'set'|'add'|'subtract', notes }
 * @returns { message, new_stock }
 */
router.put('/inventories/:variantId', verifyToken, requireManagerOrAdmin, inventoryService.updateInventory);

/**
 * @GET /api/inventories/:variantId/history
 * @description Lịch sử xuất nhập kho của sản phẩm
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param variantId - ID variant sản phẩm
 * @query { store_id, from, to, page, limit }
 * @returns { data: [...], pagination }
 */
router.get('/inventories/:variantId/history', verifyToken, inventoryService.getInventoryHistory);

/**
 * @route   GET /api/stores
 * @desc    Lấy danh sách cửa hàng
 * @access  Private
 */
router.get('/stores', verifyToken, inventoryService.getStores);

/**
 * @route   GET /api/transaction-types
 * @desc    Lấy danh sách loại giao dịch kho
 * @access  Private
 */
router.get('/transaction-types', verifyToken, inventoryService.getTransactionTypes);

/**
 * @GET /api/orders
 * @description Danh sách tất cả đơn hàng (có phân trang, lọc, tìm kiếm, sắp xếp)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @query { 
 *   limit: number (default: 10, max: 100),
 *   offset: number (default: 0),
 *   status: string (pending, completed, cancelled),
 *   payment_status: string (paid, unpaid),
 *   search: string (tìm kiếm theo order_code hoặc customer name),
 *   sort: string (order_code, final_amount, status, created_at),
 *   order: string (ASC, DESC)
 * }
 * @returns { 
 *   data: [{
 *     id, order_code, date, customer, store, status, payment_status,
 *     payment_method, amount, items, notes, created_by, created_at
 *   }],
 *   pagination
 * }
 * @example GET /api/orders?limit=20&offset=0&status=completed&sort=created_at&order=DESC
 */
router.get('/orders', verifyToken, orderService.getOrderList);

/**
 * @POST /api/orders
 * @description Tạo đơn hàng mới
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @body {
 *   store_id: number (required),
 *   customer_id: number (optional),
 *   items: [{ variant_id, quantity, unit_price, discount_per_item }, ...] (required),
 *   subtotal: number (required),
 *   discount_amount: number (default: 0),
 *   tax_amount: number (default: 0),
 *   shipping_fee: number (default: 0),
 *   payment_method: string (cash, card, bank transfer),
 *   shipping_address: string,
 *   customer_note: string,
 *   internal_note: string
 * }
 * @returns {
 *   id, order_code, date, customer_name, store_name, status, payment_status,
 *   amount, items_count, created_at
 * }
 * @example POST /api/orders
 */
router.post('/orders', verifyToken, orderService.createOrder);

/**
 * @GET /api/orders/stats/summary
 * @description Thống kê đơn hàng (tổng, theo trạng thái, doanh thu, etc)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns {
 *   total_orders, by_status, by_payment, revenue
 * }
 */
router.get('/orders/stats/summary', verifyToken, orderService.getOrderStats);

/**
 * @GET /api/orders/stats/detailed
 * @description Chi tiết thống kê (completion rate, payment rate, etc)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @returns {
 *   orders (total, by_status, completion_rate),
 *   payment (by_status, payment_rate),
 *   revenue (total, by_status, avg),
 *   financials (discount, tax, items)
 * }
 */
router.get('/orders/stats/detailed', verifyToken, orderService.getDetailedStats);

/**
 * @GET /api/orders/:id
 * @description Chi tiết đơn hàng (bao gồm danh sách items)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>
 * @param id - ID đơn hàng
 * @returns {
 *   id, order_code, date, customer, store, status, payment_status,
 *   amount, shipping_address, items, notes, created_by, created_at
 * }
 */
router.get('/orders/:id', verifyToken, orderService.getOrderDetail);

/**
 * @PUT /api/orders/:id
 * @description Cập nhật trạng thái đơn hàng hoặc phương thức thanh toán
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>, Content-Type: application/json
 * @body { status?, payment_status?, payment_method? }
 * @param id - ID đơn hàng
 * @returns {
 *   id, order_code, status, payment_status, payment_method, updated_at
 * }
 */
router.put('/orders/:id', verifyToken, orderService.updateOrderStatus);

/**
 * @DELETE /api/orders/:id
 * @description Hủy đơn hàng (soft delete - set status = cancelled)
 * @auth All authenticated users
 * @headers Authorization: Bearer <token>, Content-Type: application/json
 * @body { reason? }
 * @param id - ID đơn hàng
 * @returns {
 *   id, order_code, status, payment_status, cancelled_at, note
 * }
 */
router.delete('/orders/:id', verifyToken, orderService.cancelOrder);

/**
 * ============================================================================
 *                              EXPORT
 * ============================================================================
 * Xuất router để sử dụng trong app.js hoặc index.js
 */
module.exports = router;

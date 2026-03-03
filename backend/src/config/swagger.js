/**
 * Swagger Configuration - Supermarket Management System
 * @module config/swagger
 * @description API Documentation với Swagger/OpenAPI 3.0
 * @version 4.0.0
 * @updated 03/03/2026
 *
 * Tổng cộng: 150+ APIs - 22 Modules
 * Database: PostgreSQL
 * Authentication: JWT Bearer Token
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Supermarket Management System API',
      version: '4.0.0',
      description: `
# 🛒 Supermarket Management System API

Hệ thống quản lý siêu thị mini đầy đủ tính năng với **150+ API** trên **22 modules**.

---

## 🔐 Xác thực (Authentication)

Sử dụng **JWT Bearer Token**. Quy trình:
1. Gọi \`POST /api/auth/login\` với \`username\` và \`password\`
2. Lấy \`token\` từ \`data.token\` trong response
3. Thêm vào header: \`Authorization: Bearer <token>\`
4. Dùng \`POST /api/auth/refresh\` khi token sắp hết hạn (24h)

---

## 🌐 Base URL

| Môi trường | URL |
|-----------|-----|
| Development | \`http://localhost:5000\` |
| Production  | \`https://api.supermarket.com\` |

**Rate Limiting:** 100 req / 15 phút mỗi IP

---

## 👤 Phân quyền (Roles)

| Role ID | Tên | Mô tả |
|---------|-----|-------|
| 1 | Admin | Toàn quyền hệ thống |
| 2 | Staff | Bán hàng, xem báo cáo |
| 3 | Manager | Quản lý kho, sản phẩm, nhân viên |

---

## 📦 22 Modules

| # | Module | Prefix | APIs |
|---|--------|--------|------|
| 1  | Auth            | \`/api/auth\`             | 4  |
| 2  | Staff           | \`/api/staff\`            | 6  |
| 3  | Profile         | \`/api/users\`            | 5  |
| 4  | Products        | \`/api/products\`         | 13 |
| 5  | Collections     | \`/api/collections\`      | 6  |
| 6  | Dashboard       | \`/api/dashboard\`        | 7  |
| 7  | Catalogs        | \`/api/catalogs\`         | 5  |
| 8  | Inventory       | \`/api/inventories\`      | 10 |
| 9  | Orders          | \`/api/orders\`           | 14 |
| 10 | Customers       | \`/api/customers\`        | 8  |
| 11 | Customer Groups | \`/api/customer-groups\`  | 1  |
| 12 | Suppliers       | \`/api/suppliers\`        | 5  |
| 13 | Discounts       | \`/api/discounts\`        | 8  |
| 14 | Transactions    | \`/api/transactions\`     | 7  |
| 15 | Shipments       | \`/api/shipments\`        | 9  |
| 16 | Reports         | \`/api/reports\`          | 5  |
| 17 | POS             | \`/api/pos\`              | 16 |
| 18 | Bank Accounts   | \`/api/bank-accounts\`    | 5  |
| 19 | Checkouts       | \`/api/checkouts\`        | 4  |
| 20 | Chatbot         | \`/api/chatbot\`          | 4  |
| 21 | Search          | \`/api/search\`           | 1  |
| 22 | Utilities       | \`/api/...\`              | 6  |

---

## 🔄 Response Format

\`\`\`json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {},
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
\`\`\`

## ⚠️ HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | OK – Thành công |
| 201 | Created – Tạo mới thành công |
| 400 | Bad Request – Dữ liệu không hợp lệ |
| 401 | Unauthorized – Token không hợp lệ / hết hạn |
| 403 | Forbidden – Không đủ quyền |
| 404 | Not Found – Không tìm thấy |
| 422 | Unprocessable Entity – Validation error |
| 429 | Too Many Requests – Vượt rate limit |
| 500 | Internal Server Error |
      `,
      contact: {
        name: 'Supermarket Dev Team',
        email: 'dev@supermarket.com',
        url: 'https://github.com/tunguyen2004/supermarket'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      { url: 'http://localhost:5000',         description: '🛠 Development Server' },
      { url: 'https://api.supermarket.com',   description: '🚀 Production Server' }
    ],
    tags: [
      { name: 'Auth',           description: '🔐 Xác thực – Đăng nhập, Đăng xuất, Refresh Token' },
      { name: 'Staff',          description: '👥 Nhân viên – Quản lý tài khoản nhân viên' },
      { name: 'Profile',        description: '🙍 Hồ sơ – Cập nhật thông tin cá nhân' },
      { name: 'Products',       description: '📦 Sản phẩm – Quản lý sản phẩm & biến thể' },
      { name: 'Product Images', description: '🖼️ Ảnh sản phẩm – Upload & quản lý hình ảnh' },
      { name: 'Collections',    description: '📂 Danh mục – Phân loại sản phẩm theo cây danh mục' },
      { name: 'Dashboard',      description: '📊 Dashboard – Tổng quan & biểu đồ thống kê' },
      { name: 'Catalogs',       description: '💰 Bảng giá – Quản lý giá bán & giá vốn' },
      { name: 'Inventory',      description: '🏪 Tồn kho – Nhập xuất & điều chỉnh tồn kho' },
      { name: 'Orders',         description: '🛒 Đơn hàng – Tạo, cập nhật & hoàn trả đơn hàng' },
      { name: 'Customers',      description: '🧑 Khách hàng – Hồ sơ & nhóm khách hàng' },
      { name: 'CustomerGroups', description: '🏷️ Nhóm KH – Phân nhóm khách hàng theo hạng' },
      { name: 'Suppliers',      description: '🏭 Nhà cung cấp – Danh sách nhà cung cấp' },
      { name: 'Discounts',      description: '🎁 Khuyến mại – Mã giảm giá & ưu đãi' },
      { name: 'Transactions',   description: '💳 Sổ quỹ – Phiếu thu chi & thống kê tồn quỹ' },
      { name: 'Shipments',      description: '🚚 Vận chuyển – Quản lý vận đơn & đơn vị giao hàng' },
      { name: 'Reports',        description: '📈 Báo cáo – Doanh thu, thực thu & sản phẩm bán ra' },
      { name: 'POS',            description: '🖥️ Point of Sale – Bán hàng tại quầy' },
      { name: 'Bank Accounts',  description: '🏦 Tài khoản NH – Quản lý tài khoản ngân hàng' },
      { name: 'Checkouts',      description: '🛍️ Đơn chưa TT – Abandoned cart / đơn chưa hoàn tất' },
      { name: 'Chatbot',        description: '🤖 Chatbot AI – Hỏi đáp tự động' },
      { name: 'Search',         description: '🔍 Tìm kiếm – Tìm kiếm toàn cục' },
      { name: 'Utilities',      description: '⚙️ Tiện ích – Brands, Units, Stores, loại giao dịch' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token lấy từ `POST /api/auth/login` → `data.token`'
        }
      },
      schemas: {

        // ───────────────────────── COMMON ─────────────────────────────────────
        Pagination: {
          type: 'object',
          properties: {
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            total:      { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Thao tác thành công' },
            data:    { type: 'object' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success:    { type: 'boolean', example: true },
            message:    { type: 'string' },
            data:       { type: 'array', items: { type: 'object' } },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success:   { type: 'boolean', example: false },
            message:   { type: 'string',  example: 'Đã xảy ra lỗi' },
            timestamp: { type: 'string',  format: 'date-time' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'Dữ liệu không hợp lệ' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },

        // ───────────────────────── MODULE 1: AUTH ─────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin',    description: 'Tên đăng nhập (3–50 ký tự)' },
            password: { type: 'string', example: 'admin123', description: 'Mật khẩu' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Đăng nhập thành công' },
            data: {
              type: 'object',
              properties: {
                id:           { type: 'integer', example: 1 },
                username:     { type: 'string',  example: 'admin' },
                email:        { type: 'string',  example: 'admin@supermarket.com' },
                full_name:    { type: 'string',  example: 'Administrator' },
                role_id:      { type: 'integer', example: 1, description: '1=Admin | 2=Staff | 3=Manager' },
                role_name:    { type: 'string',  example: 'Admin' },
                is_active:    { type: 'boolean', example: true },
                avatar_url:   { type: 'string',  nullable: true },
                token:        { type: 'string',  description: 'JWT Access Token (24h)' },
                refreshToken: { type: 'string',  description: 'Refresh Token (7d)' },
                tokenExpires: { type: 'string',  format: 'date-time' }
              }
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', description: 'Access token cần refresh' }
          }
        },

        // ───────────────────────── MODULE 2: STAFF ────────────────────────────
        CreateStaffRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'full_name', 'role_id'],
          properties: {
            username:  { type: 'string', example: 'nhanvien01', minLength: 3, maxLength: 50 },
            email:     { type: 'string', format: 'email', example: 'nv01@supermarket.com' },
            password:  { type: 'string', example: 'password123', minLength: 6 },
            full_name: { type: 'string', example: 'Nguyễn Văn A' },
            phone:     { type: 'string', example: '0912345678' },
            role_id:   { type: 'integer', example: 2, description: '1=Admin | 2=Staff | 3=Manager' }
          }
        },
        UpdateStaffRequest: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            phone:     { type: 'string' },
            role_id:   { type: 'integer' },
            is_active: { type: 'boolean' }
          }
        },
        UpdateRoleRequest: {
          type: 'object',
          required: ['role_id'],
          properties: {
            role_id: { type: 'integer', example: 3, description: '1=Admin | 2=Staff | 3=Manager' }
          }
        },
        Staff: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            username:   { type: 'string' },
            email:      { type: 'string' },
            full_name:  { type: 'string' },
            phone:      { type: 'string' },
            avatar_url: { type: 'string', nullable: true },
            role_id:    { type: 'integer' },
            role_name:  { type: 'string' },
            is_active:  { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ───────────────────────── MODULE 3: PROFILE ──────────────────────────
        UpdateProfileRequest: {
          type: 'object',
          required: ['full_name'],
          properties: {
            full_name:     { type: 'string', example: 'Nguyễn Admin' },
            phone:         { type: 'string', example: '0987654321' },
            date_of_birth: { type: 'string', format: 'date', example: '1995-01-15' },
            gender:        { type: 'string', enum: ['male', 'female', 'other'] },
            address:       { type: 'string', example: '123 Lê Lợi, Q.1, TP.HCM' }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword', 'confirmPassword'],
          properties: {
            oldPassword:     { type: 'string', description: 'Mật khẩu hiện tại' },
            newPassword:     { type: 'string', minLength: 6, description: 'Mật khẩu mới' },
            confirmPassword: { type: 'string', description: 'Xác nhận mật khẩu mới' }
          }
        },

        // ───────────────────────── MODULE 4: PRODUCT ──────────────────────────
        CreateProductRequest: {
          type: 'object',
          required: ['code', 'name', 'category_id', 'unit_id'],
          properties: {
            code:          { type: 'string',  example: 'MILK002' },
            name:          { type: 'string',  example: 'Sữa chua Vinamilk 100g' },
            category_id:   { type: 'integer', example: 2 },
            brand_id:      { type: 'integer', example: 1, nullable: true },
            unit_id:       { type: 'integer', example: 1 },
            description:   { type: 'string',  example: 'Sữa chua không đường hộp 100g' },
            is_active:     { type: 'boolean', default: true },
            sku:           { type: 'string',  example: 'MILK002-001' },
            barcode:       { type: 'string',  example: '8934567890789' },
            cost_price:    { type: 'number',  example: 8000 },
            selling_price: { type: 'number',  example: 12000 }
          }
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name:        { type: 'string' },
            description: { type: 'string' },
            category_id: { type: 'integer' },
            brand_id:    { type: 'integer', nullable: true },
            is_active:   { type: 'boolean' }
          }
        },
        BulkStatusRequest: {
          type: 'object',
          required: ['product_ids', 'is_active'],
          properties: {
            product_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
            is_active:   { type: 'boolean', example: false }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id:            { type: 'integer' },
            code:          { type: 'string' },
            name:          { type: 'string' },
            category_name: { type: 'string' },
            brand_name:    { type: 'string', nullable: true },
            unit_name:     { type: 'string' },
            is_active:     { type: 'boolean' },
            price:         { type: 'string' },
            image_url:     { type: 'string', nullable: true }
          }
        },
        Brand: {
          type: 'object',
          properties: {
            id:   { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Unit: {
          type: 'object',
          properties: {
            id:   { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' }
          }
        },
        ProductImage: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            product_id: { type: 'integer' },
            image_url:  { type: 'string' },
            alt_text:   { type: 'string', nullable: true },
            sort_order: { type: 'integer' },
            is_primary: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ReorderImagesRequest: {
          type: 'object',
          required: ['imageIds'],
          properties: {
            imageIds: {
              type: 'array',
              items: { type: 'integer' },
              description: 'Mảng ID ảnh theo thứ tự mong muốn'
            }
          }
        },

        // ───────────────────────── MODULE 5: COLLECTION ───────────────────────
        CreateCollectionRequest: {
          type: 'object',
          required: ['code', 'name'],
          properties: {
            code:      { type: 'string',  example: 'SNACK' },
            name:      { type: 'string',  example: 'Bánh kẹo' },
            parent_id: { type: 'integer', nullable: true, description: 'ID danh mục cha (để tạo sub-category)' }
          }
        },
        Collection: {
          type: 'object',
          properties: {
            id:            { type: 'integer' },
            code:          { type: 'string' },
            name:          { type: 'string' },
            parent_id:     { type: 'integer', nullable: true },
            level:         { type: 'integer', description: 'Cấp danh mục (0 = gốc)' },
            product_count: { type: 'string' }
          }
        },
        CollectionTree: {
          type: 'object',
          properties: {
            id:       { type: 'integer' },
            code:     { type: 'string' },
            name:     { type: 'string' },
            children: { type: 'array', items: { $ref: '#/components/schemas/CollectionTree' } }
          }
        },

        // ───────────────────────── MODULE 6: DASHBOARD ────────────────────────
        DashboardStats: {
          type: 'object',
          properties: {
            revenue:       { type: 'object', properties: { current: { type: 'number' }, previous: { type: 'number' }, change: { type: 'number' } } },
            orders:        { type: 'object', properties: { current: { type: 'integer' }, previous: { type: 'integer' }, change: { type: 'number' } } },
            newCustomers:  { type: 'object', properties: { current: { type: 'integer' }, previous: { type: 'integer' }, change: { type: 'number' } } },
            avgOrderValue: { type: 'object', properties: { current: { type: 'number'  }, previous: { type: 'number'  }, change: { type: 'number' } } }
          }
        },
        RevenueChart: {
          type: 'object',
          properties: {
            labels:   { type: 'array', items: { type: 'string' } },
            datasets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  data:  { type: 'array', items: { type: 'number' } }
                }
              }
            },
            summary: {
              type: 'object',
              properties: {
                totalRevenue: { type: 'number' },
                totalOrders:  { type: 'integer' },
                avgDaily:     { type: 'number' }
              }
            }
          }
        },
        TopProduct: {
          type: 'object',
          properties: {
            id:        { type: 'integer' },
            name:      { type: 'string' },
            code:      { type: 'string' },
            totalSold: { type: 'integer' },
            revenue:   { type: 'number' },
            image_url: { type: 'string', nullable: true }
          }
        },
        TopCustomer: {
          type: 'object',
          properties: {
            id:          { type: 'integer' },
            name:        { type: 'string' },
            phone:       { type: 'string' },
            totalOrders: { type: 'integer' },
            totalSpent:  { type: 'number' },
            lastOrder:   { type: 'string', format: 'date-time' }
          }
        },
        LowStockProduct: {
          type: 'object',
          properties: {
            id:           { type: 'integer' },
            name:         { type: 'string' },
            code:         { type: 'string' },
            currentStock: { type: 'integer' },
            threshold:    { type: 'integer' },
            status:       { type: 'string', enum: ['critical', 'warning'] }
          }
        },

        // ───────────────────────── MODULE 7: CATALOG ──────────────────────────
        Catalog: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            code:       { type: 'string' },
            name:       { type: 'string' },
            sku:        { type: 'string' },
            barcode:    { type: 'string', nullable: true },
            cost_price: { type: 'string' },
            price:      { type: 'string' },
            unit:       { type: 'string' },
            is_active:  { type: 'boolean' },
            product_id: { type: 'integer' }
          }
        },
        UpdateCatalogRequest: {
          type: 'object',
          properties: {
            cost_price:    { type: 'number', example: 8000 },
            selling_price: { type: 'number', example: 12000 },
            is_active:     { type: 'boolean' }
          }
        },
        BulkUpdateCatalogRequest: {
          type: 'object',
          required: ['variant_ids', 'price_change_type', 'price_change_value'],
          properties: {
            variant_ids:        { type: 'array', items: { type: 'integer' } },
            price_change_type:  { type: 'string', enum: ['fixed', 'percent'], description: 'fixed = đặt giá | percent = % thay đổi' },
            price_change_value: { type: 'number', description: 'Số dương = tăng, số âm = giảm (khi type=percent)' }
          }
        },

        // ───────────────────────── MODULE 8: INVENTORY ────────────────────────
        Store: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            code:       { type: 'string' },
            name:       { type: 'string' },
            store_type: { type: 'string', enum: ['main', 'branch', 'warehouse'] },
            address:    { type: 'string' },
            is_active:  { type: 'boolean' }
          }
        },
        Inventory: {
          type: 'object',
          properties: {
            store_id:           { type: 'integer' },
            id:                 { type: 'integer' },
            code:               { type: 'string' },
            name:               { type: 'string' },
            sku:                { type: 'string' },
            barcode:            { type: 'string', nullable: true },
            unit:               { type: 'string' },
            stock:              { type: 'string' },
            quantity_reserved:  { type: 'string' },
            quantity_available: { type: 'string' },
            min_stock_level:    { type: 'string' },
            max_stock_level:    { type: 'string' },
            stock_status:       { type: 'string', enum: ['out', 'low', 'normal', 'high'] }
          }
        },
        ReceiveInventoryRequest: {
          type: 'object',
          required: ['store_id', 'items'],
          properties: {
            store_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 },
                  unit_cost:  { type: 'number',  nullable: true }
                }
              }
            },
            notes: { type: 'string', nullable: true }
          }
        },
        TransferStockRequest: {
          type: 'object',
          required: ['from_store_id', 'to_store_id', 'items'],
          properties: {
            from_store_id: { type: 'integer' },
            to_store_id:   { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 }
                }
              }
            },
            notes: { type: 'string', nullable: true }
          }
        },
        ReturnToSupplierRequest: {
          type: 'object',
          required: ['store_id', 'items'],
          properties: {
            store_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 },
                  reason:     { type: 'string' }
                }
              }
            },
            notes: { type: 'string', nullable: true }
          }
        },
        AdjustInventoryRequest: {
          type: 'object',
          required: ['store_id', 'quantity', 'adjustment_type'],
          properties: {
            store_id:        { type: 'integer' },
            quantity:        { type: 'integer' },
            adjustment_type: { type: 'string', enum: ['set', 'add', 'subtract'], description: 'set=đặt giá trị | add=cộng | subtract=trừ' },
            notes:           { type: 'string', nullable: true }
          }
        },
        InventoryTransaction: {
          type: 'object',
          properties: {
            id:               { type: 'string' },
            transaction_code: { type: 'string' },
            date_key:         { type: 'string', format: 'date-time' },
            transaction_type: { type: 'string' },
            store_name:       { type: 'string' },
            quantity_change:  { type: 'string' },
            balance_before:   { type: 'string' },
            balance_after:    { type: 'string' },
            unit_cost:        { type: 'string', nullable: true },
            total_value:      { type: 'string', nullable: true },
            notes:            { type: 'string', nullable: true },
            created_by_name:  { type: 'string' }
          }
        },

        // ───────────────────────── MODULE 9: ORDER ────────────────────────────
        CreateOrderRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal'],
          properties: {
            store_id:        { type: 'integer' },
            customer_id:     { type: 'integer', nullable: true },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['variant_id', 'quantity', 'unit_price'],
                properties: {
                  variant_id:        { type: 'integer' },
                  quantity:          { type: 'integer', minimum: 1 },
                  unit_price:        { type: 'number' },
                  discount_per_item: { type: 'number', default: 0 }
                }
              }
            },
            subtotal:         { type: 'number' },
            discount_amount:  { type: 'number', default: 0 },
            tax_amount:       { type: 'number', default: 0 },
            shipping_fee:     { type: 'number', default: 0 },
            payment_method:   { type: 'string', enum: ['cash', 'card', 'bank_transfer', 'momo', 'vnpay'] },
            shipping_address: { type: 'string', nullable: true },
            customer_note:    { type: 'string', nullable: true },
            internal_note:    { type: 'string', nullable: true }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          properties: {
            status:         { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'] },
            payment_status: { type: 'string', enum: ['paid', 'unpaid', 'refunded'] },
            payment_method: { type: 'string', enum: ['cash', 'card', 'bank_transfer'] }
          }
        },
        ReturnOrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 },
                  reason:     { type: 'string' }
                }
              }
            },
            reason:        { type: 'string' },
            refund_method: { type: 'string', enum: ['cash', 'card', 'bank_transfer'] }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            order_code:     { type: 'string' },
            customer: {
              type: 'object',
              properties: { id: { type: 'integer' }, name: { type: 'string' }, phone: { type: 'string' } }
            },
            store: {
              type: 'object',
              properties: { id: { type: 'integer' }, name: { type: 'string' } }
            },
            status:         { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'] },
            payment_status: { type: 'string', enum: ['paid', 'unpaid', 'refunded'] },
            payment_method: { type: 'string' },
            amount: {
              type: 'object',
              properties: {
                subtotal: { type: 'number' },
                discount: { type: 'number' },
                tax:      { type: 'number' },
                shipping: { type: 'number' },
                final:    { type: 'number' }
              }
            },
            items_count: { type: 'integer' },
            created_at:  { type: 'string', format: 'date-time' }
          }
        },
        OrderStats: {
          type: 'object',
          properties: {
            total_orders: { type: 'integer' },
            by_status: {
              type: 'object',
              properties: {
                pending:    { type: 'integer' },
                processing: { type: 'integer' },
                completed:  { type: 'integer' },
                cancelled:  { type: 'integer' }
              }
            },
            by_payment: {
              type: 'object',
              properties: {
                paid:     { type: 'integer' },
                unpaid:   { type: 'integer' },
                refunded: { type: 'integer' }
              }
            },
            revenue: {
              type: 'object',
              properties: {
                total:   { type: 'number' },
                average: { type: 'number' }
              }
            }
          }
        },

        // ───────────────────────── MODULE 10: CUSTOMER ────────────────────────
        CreateCustomerRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name:     { type: 'string', example: 'Nguyễn Văn An' },
            phone:    { type: 'string', example: '0901234567' },
            email:    { type: 'string', format: 'email', nullable: true },
            address:  { type: 'string', nullable: true },
            city_id:  { type: 'integer', nullable: true },
            group_id: { type: 'integer', nullable: true },
            notes:    { type: 'string', nullable: true }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id:           { type: 'integer' },
            name:         { type: 'string' },
            phone:        { type: 'string' },
            email:        { type: 'string', nullable: true },
            address:      { type: 'string', nullable: true },
            city_name:    { type: 'string', nullable: true },
            group_id:     { type: 'integer', nullable: true },
            group_name:   { type: 'string',  nullable: true },
            total_orders: { type: 'integer' },
            total_spent:  { type: 'number' },
            created_at:   { type: 'string', format: 'date-time' }
          }
        },
        CustomerGroup: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            code:             { type: 'string' },
            name:             { type: 'string' },
            discount_percent: { type: 'number' },
            customer_count:   { type: 'integer' }
          }
        },

        // ───────────────────────── MODULE 12: SUPPLIER ────────────────────────
        CreateSupplierRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            code:           { type: 'string', example: 'NCC001' },
            name:           { type: 'string', example: 'Công ty TNHH Vinamilk' },
            phone:          { type: 'string', nullable: true },
            email:          { type: 'string', format: 'email', nullable: true },
            address:        { type: 'string', nullable: true },
            tax_code:       { type: 'string', nullable: true },
            contact_person: { type: 'string', nullable: true },
            notes:          { type: 'string', nullable: true }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            code:           { type: 'string' },
            name:           { type: 'string' },
            phone:          { type: 'string', nullable: true },
            email:          { type: 'string', nullable: true },
            address:        { type: 'string', nullable: true },
            tax_code:       { type: 'string', nullable: true },
            contact_person: { type: 'string', nullable: true },
            is_active:      { type: 'boolean' },
            created_at:     { type: 'string', format: 'date-time' }
          }
        },

        // ───────────────────────── MODULE 13: DISCOUNT ────────────────────────
        CreateDiscountRequest: {
          type: 'object',
          required: ['code', 'name', 'discount_type', 'discount_value', 'start_date', 'end_date'],
          properties: {
            code:                { type: 'string',  example: 'SALE10' },
            name:                { type: 'string',  example: 'Giảm 10% đơn từ 100k' },
            discount_type:       { type: 'string',  enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'] },
            discount_value:      { type: 'number',  example: 10 },
            start_date:          { type: 'string',  format: 'date-time' },
            end_date:            { type: 'string',  format: 'date-time' },
            min_order_amount:    { type: 'number',  nullable: true },
            max_discount_amount: { type: 'number',  nullable: true },
            max_uses:            { type: 'integer', nullable: true },
            is_active:           { type: 'boolean', default: true },
            description:         { type: 'string',  nullable: true }
          }
        },
        Discount: {
          type: 'object',
          properties: {
            id:                  { type: 'integer' },
            code:                { type: 'string' },
            name:                { type: 'string' },
            discount_type:       { type: 'string' },
            discount_value:      { type: 'number' },
            start_date:          { type: 'string', format: 'date-time' },
            end_date:            { type: 'string', format: 'date-time' },
            min_order_amount:    { type: 'number', nullable: true },
            max_discount_amount: { type: 'number', nullable: true },
            max_uses:            { type: 'integer', nullable: true },
            used_count:          { type: 'integer' },
            is_active:           { type: 'boolean' },
            status:              { type: 'string', enum: ['active', 'expired', 'upcoming', 'inactive'] }
          }
        },
        ValidateDiscountRequest: {
          type: 'object',
          required: ['code'],
          properties: {
            code:         { type: 'string' },
            order_amount: { type: 'number', nullable: true },
            customer_id:  { type: 'integer', nullable: true },
            items: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity:   { type: 'integer' },
                  price:      { type: 'number' }
                }
              }
            }
          }
        },

        // ───────────────────────── MODULE 14: TRANSACTION ─────────────────────
        CreateTransactionRequest: {
          type: 'object',
          required: ['store_id', 'cashbook_type', 'amount'],
          properties: {
            store_id:          { type: 'integer' },
            cashbook_type:     { type: 'string', example: 'SALES_INCOME', description: 'SALES_INCOME | OTHER_INCOME | PURCHASE_EXPENSE | SALARY_EXPENSE | ...' },
            payment_method:    { type: 'string', example: 'CASH', description: 'CASH | BANK_TRANSFER | CARD | MOMO | ...' },
            amount:            { type: 'number', minimum: 0.01 },
            date_key:          { type: 'string', format: 'date', nullable: true },
            reference_id:      { type: 'integer', nullable: true },
            reference_type:    { type: 'string',  nullable: true },
            counterparty_name: { type: 'string',  nullable: true },
            description:       { type: 'string',  nullable: true },
            notes:             { type: 'string',  nullable: true }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id:               { type: 'integer' },
            transaction_code: { type: 'string' },
            store_id:         { type: 'integer' },
            store_name:       { type: 'string' },
            cashbook_type:    { type: 'string' },
            type_name:        { type: 'string' },
            direction:        { type: 'string', enum: ['thu', 'chi'] },
            payment_method:   { type: 'string' },
            amount:           { type: 'number' },
            status:           { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
            date_key:         { type: 'string', format: 'date' },
            description:      { type: 'string', nullable: true },
            created_by:       { type: 'string' },
            created_at:       { type: 'string', format: 'date-time' }
          }
        },

        // ───────────────────────── MODULE 15: SHIPMENT ────────────────────────
        CreateShipmentRequest: {
          type: 'object',
          required: ['order_id', 'sender_store_id', 'recipient_name', 'recipient_phone', 'recipient_address'],
          properties: {
            order_id:                { type: 'integer' },
            carrier_id:              { type: 'integer', nullable: true },
            tracking_code:           { type: 'string',  nullable: true },
            sender_store_id:         { type: 'integer' },
            recipient_name:          { type: 'string' },
            recipient_phone:         { type: 'string' },
            recipient_address:       { type: 'string' },
            recipient_city_id:       { type: 'integer', nullable: true },
            recipient_district:      { type: 'string',  nullable: true },
            recipient_ward:          { type: 'string',  nullable: true },
            package_weight:          { type: 'number',  nullable: true },
            shipping_fee:            { type: 'number',  default: 0 },
            cod_amount:              { type: 'number',  default: 0 },
            insurance_fee:           { type: 'number',  default: 0 },
            estimated_delivery_date: { type: 'string',  format: 'date', nullable: true },
            notes:                   { type: 'string',  nullable: true }
          }
        },
        Shipment: {
          type: 'object',
          properties: {
            id:                      { type: 'integer' },
            shipment_code:           { type: 'string' },
            tracking_code:           { type: 'string', nullable: true },
            order_id:                { type: 'integer' },
            order_code:              { type: 'string' },
            carrier_name:            { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['pending','confirmed','picking','picked','in_transit','out_for_delivery','delivered','failed','returned','cancelled']
            },
            recipient_name:          { type: 'string' },
            recipient_phone:         { type: 'string' },
            recipient_address:       { type: 'string' },
            shipping_fee:            { type: 'number' },
            cod_amount:              { type: 'number' },
            estimated_delivery_date: { type: 'string', format: 'date', nullable: true },
            actual_delivery_date:    { type: 'string', format: 'date', nullable: true },
            created_at:              { type: 'string', format: 'date-time' }
          }
        },
        Carrier: {
          type: 'object',
          properties: {
            id:        { type: 'integer' },
            code:      { type: 'string' },
            name:      { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },

        // ───────────────────────── MODULE 17: POS ─────────────────────────────
        POSCheckoutRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal', 'payment_method'],
          properties: {
            store_id:        { type: 'integer' },
            customer_id:     { type: 'integer', nullable: true },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['variant_id', 'quantity', 'unit_price'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 },
                  unit_price: { type: 'number' },
                  discount:   { type: 'number', default: 0 }
                }
              }
            },
            subtotal:        { type: 'number' },
            discount_code:   { type: 'string',  nullable: true },
            discount_amount: { type: 'number',  default: 0 },
            tax_amount:      { type: 'number',  default: 0 },
            payment_method:  { type: 'string',  enum: ['cash', 'card', 'bank_transfer', 'momo', 'vnpay'] },
            amount_paid:     { type: 'number',  nullable: true, description: 'Tiền khách đưa (chỉ với tiền mặt)' },
            notes:           { type: 'string',  nullable: true }
          }
        },
        POSProduct: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            variant_id: { type: 'integer' },
            code:       { type: 'string' },
            name:       { type: 'string' },
            sku:        { type: 'string' },
            barcode:    { type: 'string', nullable: true },
            price:      { type: 'number' },
            stock:      { type: 'number' },
            image_url:  { type: 'string', nullable: true }
          }
        },
        POSDraftRequest: {
          type: 'object',
          required: ['store_id', 'items'],
          properties: {
            store_id:        { type: 'integer' },
            customer_id:     { type: 'integer', nullable: true },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variant_id: { type: 'integer' },
                  quantity:   { type: 'integer', minimum: 1 },
                  unit_price: { type: 'number' }
                }
              }
            },
            discount_amount: { type: 'number', default: 0 },
            discount_id:     { type: 'integer', nullable: true },
            notes:           { type: 'string',  nullable: true }
          }
        },
        GenerateQRRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount:     { type: 'number',  description: 'Số tiền thanh toán (VNĐ)' },
            order_info: { type: 'string',  nullable: true, description: 'Mã đơn hàng / nội dung' }
          }
        },
        SepayWebhookPayload: {
          type: 'object',
          properties: {
            id:              { type: 'integer' },
            gateway:         { type: 'string',  example: 'VCB' },
            transferType:    { type: 'string',  enum: ['in', 'out'] },
            transferAmount:  { type: 'number' },
            content:         { type: 'string' },
            accountNumber:   { type: 'string' },
            referenceCode:   { type: 'string' },
            transactionDate: { type: 'string',  format: 'date-time' }
          }
        },

        // ───────────────────────── MODULE 18: BANK ACCOUNT ────────────────────
        CreateBankAccountRequest: {
          type: 'object',
          required: ['account_name', 'account_number', 'bank_name', 'bank_code'],
          properties: {
            account_name:   { type: 'string',  example: 'Siêu Thị Mini ABC' },
            account_number: { type: 'string',  example: '0001234567890' },
            bank_name:      { type: 'string',  example: 'Vietcombank' },
            bank_code:      { type: 'string',  example: 'VCB' },
            branch:         { type: 'string',  example: 'Chi nhánh Quận 1', nullable: true },
            store_id:       { type: 'integer', nullable: true },
            is_default:     { type: 'boolean', default: false },
            notes:          { type: 'string',  nullable: true }
          }
        },
        BankAccount: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            account_name:   { type: 'string' },
            account_number: { type: 'string' },
            bank_name:      { type: 'string' },
            bank_code:      { type: 'string' },
            branch:         { type: 'string', nullable: true },
            store_id:       { type: 'integer', nullable: true },
            store_name:     { type: 'string',  nullable: true },
            is_default:     { type: 'boolean' },
            is_active:      { type: 'boolean' },
            created_at:     { type: 'string', format: 'date-time' }
          }
        },

        // ───────────────────────── MODULE 19: CHECKOUT ────────────────────────
        Checkout: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            order_code:     { type: 'string' },
            customer_name:  { type: 'string',  nullable: true },
            customer_phone: { type: 'string',  nullable: true },
            store_id:       { type: 'integer' },
            store_name:     { type: 'string' },
            created_at:     { type: 'string',  format: 'date-time' },
            final_amount:   { type: 'number' },
            status:         { type: 'string',  enum: ['draft', 'abandoned', 'pending'] },
            items_count:    { type: 'integer' }
          }
        },
        SendPaymentLinkRequest: {
          type: 'object',
          properties: {
            custom_message: { type: 'string', nullable: true }
          }
        },

        // ───────────────────────── MODULE 20: CHATBOT ─────────────────────────
        ChatbotMessageRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message:    { type: 'string', maxLength: 500, example: 'Doanh thu hôm nay bao nhiêu?' },
            session_id: { type: 'string', nullable: true, example: 'chat_1740000000_abc123' }
          }
        },
        ChatbotMessageResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                reply:              { type: 'string', description: 'Câu trả lời của chatbot' },
                intent:             { type: 'string', description: 'Intent phân loại: revenue_query | inventory_query | ...' },
                data:               { type: 'object', nullable: true, description: 'Dữ liệu truy vấn kèm theo (nếu có)' },
                type:               { type: 'string', enum: ['text', 'table', 'chart'] },
                processing_time_ms: { type: 'number' },
                session_id:         { type: 'string' }
              }
            }
          }
        },
        ChatbotSuggestion: {
          type: 'object',
          properties: {
            category:  { type: 'string', example: 'Doanh thu' },
            questions: { type: 'array',  items: { type: 'string' } }
          }
        },

        // ───────────────────────── MODULE 21: SEARCH ──────────────────────────
        GlobalSearchResult: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' }, name: { type: 'string' }, code: { type: 'string' },
                  type: { type: 'string', example: 'product' }, image_url: { type: 'string', nullable: true }
                }
              }
            },
            customers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' }, name: { type: 'string' }, phone: { type: 'string' },
                  type: { type: 'string', example: 'customer' }
                }
              }
            },
            orders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' }, order_code: { type: 'string' },
                  type: { type: 'string', example: 'order' }
                }
              }
            }
          }
        }
      },

      // ─── SHARED RESPONSES ──────────────────────────────────────────────────
      responses: {
        Success200: {
          description: '200 – Thành công',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } }
        },
        Created201: {
          description: '201 – Tạo mới thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string',  example: 'Tạo mới thành công' },
                  data:    { type: 'object' }
                }
              }
            }
          }
        },
        PaginatedList: {
          description: '200 – Danh sách có phân trang',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        },
        UnauthorizedError: {
          description: '401 – Token không hợp lệ hoặc đã hết hạn',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string',  example: 'Unauthorized: Token không hợp lệ' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: '403 – Không đủ quyền truy cập',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string',  example: 'Forbidden: Không có quyền thực hiện' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: '404 – Không tìm thấy resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string',  example: 'Không tìm thấy dữ liệu' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: '422 – Dữ liệu đầu vào không hợp lệ',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } }
        },
        RateLimitError: {
          description: '429 – Vượt quá giới hạn request (100 req / 15 phút)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success:    { type: 'boolean', example: false },
                  message:    { type: 'string',  example: 'Too many requests. Vui lòng thử lại sau.' },
                  retryAfter: { type: 'integer', example: 900 }
                }
              }
            }
          }
        },
        ServerError: {
          description: '500 – Lỗi server nội bộ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success:   { type: 'boolean', example: false },
                  message:   { type: 'string',  example: 'Lỗi server, vui lòng thử lại sau' },
                  timestamp: { type: 'string',  format: 'date-time' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    './src/routes/*.js',
    './src/services/*.js'
  ]
};

const specs = swaggerJsdoc(options);

/**
 * Khởi tạo Swagger UI cho Express app
 * @param {import('express').Application} app
 */
const setupSwagger = (app) => {
  const uiOptions = {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0; border-bottom: 2px solid #2d6a4f; padding-bottom: 20px; }
      .swagger-ui .info .title { font-size: 2.2em; color: #1b4332; font-weight: 700; }
      .swagger-ui .scheme-container { background: #f0faf4; padding: 15px; border-radius: 6px; }
      .swagger-ui .opblock { border-radius: 6px; }
    `,
    customSiteTitle: 'Supermarket API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      deepLinking: true
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));

  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(specs);
  });

  app.get('/api-docs/health', (_req, res) => {
    res.json({ status: 'ok', docs: '/api-docs', spec: '/api-docs.json' });
  });

  console.log('📚 Swagger UI   → http://localhost:5000/api-docs');
  console.log('📋 OpenAPI JSON → http://localhost:5000/api-docs.json');
};

module.exports = { specs, setupSwagger };

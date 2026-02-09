/**
 * Swagger Configuration - Supermarket Management System
 * @module config/swagger
 * @description API Documentation với Swagger/OpenAPI 3.0
 * @version 3.1.0
 * @updated 05/02/2026
 * 
 * Tổng cộng: 129+ APIs - 21 Modules
 * Database: PostgreSQL
 * Authentication: JWT Bearer Token
 * Rate Limiting: Enabled
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Supermarket Management System API',
      version: '3.1.0',
      description: `
# 🛒 Supermarket Management System API Documentation

Hệ thống quản lý siêu thị mini với đầy đủ các tính năng:
- ✅ Quản lý sản phẩm, danh mục, tồn kho
- ✅ Quản lý đơn hàng, khách hàng, nhà cung cấp
- ✅ Hệ thống POS (Point of Sale)
- ✅ Báo cáo doanh thu, sổ quỹ
- ✅ Quản lý khuyến mại, vận chuyển
- ✅ Quản lý tài khoản ngân hàng

## 🔐 Authentication
Sử dụng JWT Bearer Token. Lấy token từ endpoint \`POST /api/auth/login\`.

**Quy trình:**
1. Gọi \`POST /api/auth/login\` với username và password
2. Lấy token từ response
3. Thêm token vào header: \`Authorization: Bearer <token>\`
4. Dùng \`POST /api/auth/refresh\` để cập nhật token khi sắp hết hạn

## 🚀 Getting Started
- Base URL: \`http://localhost:5000\` (Development) hoặc \`https://api.supermarket.com\` (Production)
- Response Format: JSON
- Pagination: \`page\` và \`limit\` query parameters
- Rate Limiting: 100 requests/15 minutes per IP

## 📊 Tổng quan Modules (129 APIs)

| # | Module | APIs | Description |
|---|--------|------|-------------|
| 1 | Authentication | 4 | Đăng nhập, đăng xuất, refresh token |
| 2 | Staff | 6 | Quản lý nhân viên |
| 3 | Profile | 5 | Quản lý hồ sơ cá nhân |
| 4 | Products | 10 | Quản lý sản phẩm |
| 5 | Collections | 6 | Quản lý danh mục |
| 6 | Dashboard | 7 | Tổng quan, thống kê |
| 7 | Catalog | 5 | Bảng giá |
| 8 | Inventory | 9 | Quản lý tồn kho |
| 9 | Product Images | 7 | Ảnh sản phẩm |
| 10 | Orders | 7 | Quản lý đơn hàng |
| 11 | Customers | 8 | Quản lý khách hàng |
| 12 | Suppliers | 5 | Nhà cung cấp |
| 13 | Discounts | 8 | Khuyến mại |
| 14 | Transactions | 7 | Sổ quỹ |
| 15 | Shipments | 8 | Vận chuyển |
| 16 | Order Returns | 4 | Hoàn trả |
| 17 | Reports | 5 | Báo cáo |
| 18 | POS | 10 | Point of Sale |
| 19 | Bank Accounts | 5 | Tài khoản ngân hàng |
| 20 | Checkouts | 4 | Đơn chưa hoàn tất |
| 21 | Customer Groups | 3 | Nhóm khách hàng |

## 🔄 Response Format
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`

## ⚠️ Error Handling
- \`400\`: Bad Request - Dữ liệu không hợp lệ
- \`401\`: Unauthorized - Token không hợp lệ/hết hạn
- \`403\`: Forbidden - Không có quyền thực hiện
- \`404\`: Not Found - Không tìm thấy resource
- \`422\`: Unprocessable Entity - Validation error
- \`429\`: Too Many Requests - Vượt quá rate limit
- \`500\`: Internal Server Error - Lỗi server
      `,
      contact: {
        name: 'API Support Team',
        email: 'support@supermarket.com',
        url: 'https://supermarket.com/support'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      },
      {
        url: 'https://api.supermarket.com',
        description: 'Production Server'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication - Xác thực người dùng' },
      { name: 'Staff', description: 'Staff Management - Quản lý nhân viên' },
      { name: 'Profile', description: 'Profile Management - Hồ sơ cá nhân' },
      { name: 'Products', description: 'Product Management - Quản lý sản phẩm' },
      { name: 'Collections', description: 'Category Management - Quản lý danh mục' },
      { name: 'Dashboard', description: 'Dashboard - Tổng quan & thống kê' },
      { name: 'Catalogs', description: 'Price Catalog - Bảng giá sản phẩm' },
      { name: 'Inventory', description: 'Inventory Management - Quản lý tồn kho' },
      { name: 'Product Images', description: 'Product Images - Ảnh sản phẩm' },
      { name: 'Orders', description: 'Order Management - Quản lý đơn hàng' },
      { name: 'Customers', description: 'Customer Management - Quản lý khách hàng' },
      { name: 'Customer Groups', description: 'Customer Groups - Nhóm khách hàng' },
      { name: 'Suppliers', description: 'Supplier Management - Quản lý nhà cung cấp' },
      { name: 'Discounts', description: 'Discount Management - Quản lý khuyến mại' },
      { name: 'Transactions', description: 'Cashbook - Quản lý sổ quỹ & giao dịch' },
      { name: 'Shipments', description: 'Shipment Management - Quản lý vận chuyển' },
      { name: 'Order Returns', description: 'Order Returns - Quản lý hoàn trả' },
      { name: 'Reports', description: 'Reports - Báo cáo doanh thu & thống kê' },
      { name: 'POS', description: 'Point of Sale - Bán hàng tại quầy' },
      { name: 'Bank Accounts', description: 'Bank Account Management - Tài khoản ngân hàng' },
      { name: 'Checkouts', description: 'Checkouts - Đơn chưa hoàn tất' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token. Lấy token từ endpoint POST /api/auth/login'
        }
      },
      schemas: {
        // ==================== COMMON SCHEMAS ====================
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object', description: 'Response data' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Retrieved successfully' },
            data: {
              type: 'array',
              items: { type: 'object' }
            },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1, description: 'Current page number' },
            limit: { type: 'integer', example: 20, description: 'Items per page' },
            total: { type: 'integer', example: 100, description: 'Total items' },
            totalPages: { type: 'integer', example: 5, description: 'Total pages' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', description: 'Field name' },
                  message: { type: 'string', description: 'Error message' }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time', description: 'Error timestamp' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        },

        // ==================== AUTH SCHEMAS ====================
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin', minLength: 3, maxLength: 50, description: 'Tên đăng nhập' },
            password: { type: 'string', example: 'password123', minLength: 6, description: 'Mật khẩu' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'admin' },
                email: { type: 'string', example: 'admin@supermarket.com', format: 'email' },
                full_name: { type: 'string', example: 'Administrator' },
                role_id: { type: 'integer', example: 1, description: '1=Admin, 2=Manager, 3=Staff' },
                role_name: { type: 'string', example: 'Admin' },
                is_active: { type: 'boolean', example: true },
                avatar_url: { type: 'string', nullable: true, description: 'URL ảnh đại diện' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT Bearer Token (hết hạn sau 24h)' },
                refreshToken: { type: 'string', description: 'Token để làm mới access token' },
                tokenExpires: { type: 'string', format: 'date-time', example: '2026-02-06T05:30:00Z', description: 'Thời gian token hết hạn' }
              }
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', description: 'JWT token cần refresh' }
          }
        },
        Role: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string', example: 'ADMIN' },
            name: { type: 'string', example: 'Admin' },
            description: { type: 'string' },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },

        // ==================== STAFF SCHEMAS ====================
        CreateStaffRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'full_name', 'role_id'],
          properties: {
            username: { type: 'string', example: 'staff1', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email', example: 'staff1@supermarket.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            full_name: { type: 'string', example: 'Nguyễn Văn A' },
            phone: { type: 'string', example: '0912345678' },
            role_id: { type: 'integer', example: 2, description: '1=Admin, 2=Staff, 3=Manager' }
          }
        },
        UpdateStaffRequest: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            phone: { type: 'string' },
            role_id: { type: 'integer' },
            is_active: { type: 'boolean' }
          }
        },
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone: { type: 'string' },
            avatar_url: { type: 'string' },
            is_active: { type: 'boolean' },
            role_id: { type: 'integer' },
            role_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ==================== PROFILE SCHEMAS ====================
        UpdateProfileRequest: {
          type: 'object',
          required: ['full_name'],
          properties: {
            full_name: { type: 'string', example: 'Admin Supermarket' },
            phone: { type: 'string', example: '0987654321' },
            date_of_birth: { type: 'string', format: 'date', example: '1990-01-15' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            address: { type: 'string', example: '123 Đường ABC, Quận 1, TP.HCM' }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['oldPassword', 'newPassword', 'confirmPassword'],
          properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
            confirmPassword: { type: 'string' }
          }
        },

        // ==================== PRODUCT SCHEMAS ====================
        CreateProductRequest: {
          type: 'object',
          required: ['code', 'name', 'category_id', 'unit_id'],
          properties: {
            code: { type: 'string', example: 'MILK002' },
            name: { type: 'string', example: 'Sữa chua Vinamilk' },
            category_id: { type: 'integer', example: 1 },
            brand_id: { type: 'integer', example: 1 },
            unit_id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Sữa chua hộp 100g' },
            is_active: { type: 'boolean', default: true },
            sku: { type: 'string', example: 'MILK002-SKU' },
            barcode: { type: 'string', example: '8934567890789' },
            cost_price: { type: 'number', example: 8000 },
            selling_price: { type: 'number', example: 12000 }
          }
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category_id: { type: 'integer' },
            brand_id: { type: 'integer' },
            is_active: { type: 'boolean' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            category_name: { type: 'string' },
            brand_name: { type: 'string' },
            unit_name: { type: 'string' },
            is_active: { type: 'boolean' },
            price: { type: 'string' },
            image_url: { type: 'string' }
          }
        },
        ProductDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category_name: { type: 'string' },
            brand_name: { type: 'string' },
            unit_name: { type: 'string' },
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  sku: { type: 'string' },
                  barcode: { type: 'string' },
                  selling_price: { type: 'string' }
                }
              }
            }
          }
        },
        BulkStatusRequest: {
          type: 'object',
          required: ['product_ids', 'is_active'],
          properties: {
            product_ids: {
              type: 'array',
              items: { type: 'integer' },
              example: [1, 2, 3]
            },
            is_active: { type: 'boolean', example: false }
          }
        },
        Brand: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Unit: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' }
          }
        },

        // ==================== COLLECTION SCHEMAS ====================
        CreateCollectionRequest: {
          type: 'object',
          required: ['code', 'name'],
          properties: {
            code: { type: 'string', example: 'SNACK' },
            name: { type: 'string', example: 'Bánh kẹo' },
            parent_id: { type: 'integer', nullable: true, description: 'ID danh mục cha' }
          }
        },
        Collection: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            parent_id: { type: 'integer' },
            level: { type: 'integer' },
            product_count: { type: 'string' }
          }
        },
        CollectionTree: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/CollectionTree' }
            }
          }
        },

        // ==================== DASHBOARD SCHEMAS ====================
        DashboardOverview: {
          type: 'object',
          properties: {
            totalOrders: { type: 'integer' },
            totalProducts: { type: 'integer' },
            totalCustomers: { type: 'integer' },
            recentOrders: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderSummary' }
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            revenue: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                previous: { type: 'number' },
                change: { type: 'number' }
              }
            },
            orders: {
              type: 'object',
              properties: {
                current: { type: 'integer' },
                previous: { type: 'integer' },
                change: { type: 'number' }
              }
            },
            newCustomers: {
              type: 'object',
              properties: {
                current: { type: 'integer' },
                previous: { type: 'integer' },
                change: { type: 'number' }
              }
            },
            avgOrderValue: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                previous: { type: 'number' },
                change: { type: 'number' }
              }
            }
          }
        },
        RevenueChart: {
          type: 'object',
          properties: {
            labels: { type: 'array', items: { type: 'string' } },
            datasets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  data: { type: 'array', items: { type: 'number' } }
                }
              }
            },
            summary: {
              type: 'object',
              properties: {
                totalRevenue: { type: 'number' },
                totalOrders: { type: 'integer' },
                avgDaily: { type: 'number' }
              }
            }
          }
        },
        TopProduct: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' },
            totalSold: { type: 'integer' },
            revenue: { type: 'number' },
            image_url: { type: 'string' }
          }
        },
        SalesChannel: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            orders: { type: 'integer' },
            revenue: { type: 'number' },
            percentage: { type: 'number' }
          }
        },
        TopCustomer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            totalOrders: { type: 'integer' },
            totalSpent: { type: 'number' },
            lastOrder: { type: 'string', format: 'date-time' }
          }
        },
        LowStockProduct: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' },
            currentStock: { type: 'integer' },
            threshold: { type: 'integer' },
            status: { type: 'string', enum: ['critical', 'warning'] }
          }
        },

        // ==================== CATALOG SCHEMAS ====================
        Catalog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            cost_price: { type: 'string' },
            price: { type: 'string' },
            unit: { type: 'string' },
            is_active: { type: 'boolean' },
            product_id: { type: 'integer' }
          }
        },
        UpdateCatalogRequest: {
          type: 'object',
          properties: {
            cost_price: { type: 'number' },
            selling_price: { type: 'number' },
            is_active: { type: 'boolean' }
          }
        },
        BulkUpdateCatalogRequest: {
          type: 'object',
          required: ['variant_ids', 'price_change_type', 'price_change_value'],
          properties: {
            variant_ids: {
              type: 'array',
              items: { type: 'integer' }
            },
            price_change_type: {
              type: 'string',
              enum: ['fixed', 'percent'],
              description: 'fixed = đặt giá cố định, percent = tăng/giảm %'
            },
            price_change_value: {
              type: 'number',
              description: 'Giá trị (số dương = tăng, số âm = giảm khi type=percent)'
            }
          }
        },

        // ==================== INVENTORY SCHEMAS ====================
        Store: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            store_type: { type: 'string' },
            address: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },
        TransactionType: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            affects_stock: { type: 'integer', description: '1=tăng, -1=giảm, 0=không đổi' }
          }
        },
        Inventory: {
          type: 'object',
          properties: {
            store_id: { type: 'integer' },
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            unit: { type: 'string' },
            location: { type: 'string' },
            store_code: { type: 'string' },
            stock: { type: 'string' },
            quantity_reserved: { type: 'string' },
            quantity_available: { type: 'string' },
            min_stock_level: { type: 'string' },
            max_stock_level: { type: 'string' },
            stock_status: { type: 'string', enum: ['out', 'low', 'normal', 'high'] }
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
                  quantity: { type: 'integer', minimum: 1 },
                  unit_cost: { type: 'number' }
                }
              }
            },
            notes: { type: 'string' }
          }
        },
        TransferStockRequest: {
          type: 'object',
          required: ['from_store_id', 'to_store_id', 'items'],
          properties: {
            from_store_id: { type: 'integer' },
            to_store_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'integer' }
                }
              }
            },
            notes: { type: 'string' }
          }
        },
        AdjustInventoryRequest: {
          type: 'object',
          required: ['store_id', 'quantity', 'adjustment_type'],
          properties: {
            store_id: { type: 'integer' },
            quantity: { type: 'integer' },
            adjustment_type: {
              type: 'string',
              enum: ['set', 'add', 'subtract'],
              description: 'set=đặt số lượng, add=cộng thêm, subtract=trừ đi'
            },
            notes: { type: 'string' }
          }
        },
        InventoryHistory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            transaction_code: { type: 'string' },
            date_key: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            transaction_type: { type: 'string' },
            transaction_type_code: { type: 'string' },
            store_name: { type: 'string' },
            quantity_change: { type: 'string' },
            balance_before: { type: 'string' },
            balance_after: { type: 'string' },
            reference_type: { type: 'string' },
            unit_cost: { type: 'string' },
            total_value: { type: 'string' },
            notes: { type: 'string' },
            created_by_name: { type: 'string' }
          }
        },

        // ==================== ORDER SCHEMAS ====================
        CreateOrderRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['variant_id', 'quantity', 'unit_price'],
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'integer', minimum: 1 },
                  unit_price: { type: 'number' },
                  discount_per_item: { type: 'number', default: 0 }
                }
              }
            },
            subtotal: { type: 'number' },
            discount_amount: { type: 'number', default: 0 },
            tax_amount: { type: 'number', default: 0 },
            shipping_fee: { type: 'number', default: 0 },
            payment_method: { type: 'string', enum: ['cash', 'card', 'bank transfer'] },
            shipping_address: { type: 'string' },
            customer_note: { type: 'string' },
            internal_note: { type: 'string' }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
            payment_status: { type: 'string', enum: ['paid', 'unpaid'] },
            payment_method: { type: 'string', enum: ['cash', 'card', 'bank transfer'] }
          }
        },
        CancelOrderRequest: {
          type: 'object',
          properties: {
            reason: { type: 'string' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_code: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            customer: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                phone: { type: 'string' }
              }
            },
            store: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' }
              }
            },
            status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
            payment_status: { type: 'string', enum: ['paid', 'unpaid'] },
            payment_method: { type: 'string' },
            amount: {
              type: 'object',
              properties: {
                subtotal: { type: 'number' },
                discount: { type: 'number' },
                tax: { type: 'number' },
                shipping: { type: 'number' },
                final: { type: 'number' }
              }
            },
            items: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        OrderSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_code: { type: 'string' },
            customer_name: { type: 'string' },
            total_amount: { type: 'number' },
            status: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        OrderStats: {
          type: 'object',
          properties: {
            total_orders: { type: 'integer' },
            by_status: {
              type: 'object',
              properties: {
                pending: { type: 'integer' },
                completed: { type: 'integer' },
                cancelled: { type: 'integer' }
              }
            },
            by_payment: {
              type: 'object',
              properties: {
                paid: { type: 'integer' },
                unpaid: { type: 'integer' }
              }
            },
            revenue: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                average: { type: 'number' }
              }
            }
          }
        },

        // ==================== CUSTOMER SCHEMAS ====================
        CreateCustomerRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Nguyễn Văn An' },
            phone: { type: 'string', example: '0901234567' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            group_id: { type: 'integer' },
            notes: { type: 'string' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            group_id: { type: 'integer' },
            group_name: { type: 'string' },
            total_orders: { type: 'integer' },
            total_spent: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        CustomerGroup: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            discount_percent: { type: 'number' },
            customer_count: { type: 'integer' }
          }
        },

        // ==================== SUPPLIER SCHEMAS ====================
        CreateSupplierRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            code: { type: 'string' },
            name: { type: 'string', example: 'Công ty ABC' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: { type: 'string' },
            tax_code: { type: 'string' },
            contact_person: { type: 'string' },
            notes: { type: 'string' }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            tax_code: { type: 'string' },
            contact_person: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ==================== DISCOUNT SCHEMAS ====================
        CreateDiscountRequest: {
          type: 'object',
          required: ['code', 'name', 'discount_type', 'discount_value', 'start_date', 'end_date'],
          properties: {
            code: { type: 'string', example: 'SALE10' },
            name: { type: 'string', example: 'Giảm 10%' },
            discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'] },
            discount_value: { type: 'number' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            min_order_amount: { type: 'number' },
            max_discount_amount: { type: 'number' },
            max_uses: { type: 'integer' },
            is_active: { type: 'boolean', default: true }
          }
        },
        Discount: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            discount_type: { type: 'string' },
            discount_value: { type: 'number' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            min_order_amount: { type: 'number' },
            max_discount_amount: { type: 'number' },
            max_uses: { type: 'integer' },
            used_count: { type: 'integer' },
            is_active: { type: 'boolean' },
            status: { type: 'string', enum: ['active', 'expired', 'upcoming', 'inactive'] }
          }
        },
        DiscountType: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        ValidateDiscountRequest: {
          type: 'object',
          required: ['code'],
          properties: {
            code: { type: 'string' },
            order_amount: { type: 'number' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' }
                }
              }
            }
          }
        },

        // ==================== TRANSACTION/CASHBOOK SCHEMAS ====================
        CreateTransactionRequest: {
          type: 'object',
          required: ['store_id', 'cashbook_type', 'amount'],
          properties: {
            store_id: { type: 'integer' },
            cashbook_type: {
              type: 'string',
              description: 'Code: SALES_INCOME, OTHER_INCOME, PURCHASE_EXPENSE, SALARY_EXPENSE, etc.'
            },
            payment_method: {
              type: 'string',
              description: 'Code: CASH, BANK_TRANSFER, CARD, MOMO, etc.'
            },
            amount: { type: 'number', minimum: 0.01 },
            date_key: { type: 'string', format: 'date' },
            reference_id: { type: 'integer' },
            reference_type: { type: 'string' },
            counterparty_name: { type: 'string' },
            description: { type: 'string' },
            notes: { type: 'string' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            transaction_code: { type: 'string' },
            store_id: { type: 'integer' },
            store_name: { type: 'string' },
            cashbook_type: { type: 'string' },
            type_name: { type: 'string' },
            direction: { type: 'string', enum: ['thu', 'chi'] },
            payment_method: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
            date_key: { type: 'string', format: 'date' },
            description: { type: 'string' },
            created_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        TransactionSummary: {
          type: 'object',
          properties: {
            totals: {
              type: 'object',
              properties: {
                total_income: { type: 'number' },
                total_expense: { type: 'number' },
                net_amount: { type: 'number' }
              }
            },
            by_store: { type: 'array' },
            by_type: { type: 'array' }
          }
        },

        // ==================== SHIPMENT SCHEMAS ====================
        CreateShipmentRequest: {
          type: 'object',
          required: ['order_id', 'sender_store_id', 'recipient_name', 'recipient_phone', 'recipient_address'],
          properties: {
            order_id: { type: 'integer' },
            carrier_id: { type: 'integer' },
            tracking_code: { type: 'string' },
            sender_store_id: { type: 'integer' },
            recipient_name: { type: 'string' },
            recipient_phone: { type: 'string' },
            recipient_address: { type: 'string' },
            recipient_city_id: { type: 'integer' },
            recipient_district: { type: 'string' },
            recipient_ward: { type: 'string' },
            package_weight: { type: 'number' },
            shipping_fee: { type: 'number' },
            cod_amount: { type: 'number' },
            insurance_fee: { type: 'number' },
            estimated_delivery_date: { type: 'string', format: 'date' },
            notes: { type: 'string' }
          }
        },
        Shipment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            shipment_code: { type: 'string' },
            tracking_code: { type: 'string' },
            order_id: { type: 'integer' },
            order_code: { type: 'string' },
            carrier_id: { type: 'integer' },
            carrier_name: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'picking', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled']
            },
            recipient_name: { type: 'string' },
            recipient_phone: { type: 'string' },
            recipient_address: { type: 'string' },
            shipping_fee: { type: 'number' },
            cod_amount: { type: 'number' },
            estimated_delivery_date: { type: 'string', format: 'date' },
            actual_delivery_date: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ShipmentStatus: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Carrier: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },

        // ==================== REPORT SCHEMAS ====================
        DailyReportSummary: {
          type: 'object',
          properties: {
            total_orders: { type: 'integer' },
            total_revenue: { type: 'number' },
            total_items_sold: { type: 'integer' },
            average_order_value: { type: 'number' },
            total_discount: { type: 'number' }
          }
        },
        ActualRevenueReport: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                total_received: { type: 'number' },
                total_pending: { type: 'number' },
                total_refunded: { type: 'number' }
              }
            },
            by_method: { type: 'array' },
            pending: { type: 'object' },
            refunds: { type: 'object' }
          }
        },

        // ==================== POS SCHEMAS ====================
        POSCheckoutRequest: {
          type: 'object',
          required: ['store_id', 'items', 'subtotal', 'payment_method'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  unit_price: { type: 'number' },
                  discount: { type: 'number' }
                }
              }
            },
            subtotal: { type: 'number' },
            discount_code: { type: 'string' },
            discount_amount: { type: 'number' },
            tax_amount: { type: 'number' },
            payment_method: { type: 'string', enum: ['cash', 'card', 'bank_transfer', 'momo', 'vnpay'] },
            amount_paid: { type: 'number' },
            notes: { type: 'string' }
          }
        },
        POSProduct: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            variant_id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            barcode: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            image_url: { type: 'string' }
          }
        },
        POSDraftRequest: {
          type: 'object',
          required: ['store_id', 'items'],
          properties: {
            store_id: { type: 'integer' },
            customer_id: { type: 'integer' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variant_id: { type: 'integer' },
                  quantity: { type: 'integer' },
                  unit_price: { type: 'number' }
                }
              }
            },
            notes: { type: 'string' }
          }
        },
        PaymentMethod: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            is_active: { type: 'boolean' }
          }
        },

        // ==================== BANK ACCOUNT SCHEMAS ====================
        CreateBankAccountRequest: {
          type: 'object',
          required: ['account_name', 'account_number', 'bank_name', 'bank_code'],
          properties: {
            account_name: { type: 'string', example: 'Siêu Thị Mini' },
            account_number: { type: 'string', example: '1234567890' },
            bank_name: { type: 'string', example: 'Vietcombank' },
            bank_code: { type: 'string', example: 'VCB' },
            branch: { type: 'string', example: 'Chi nhánh Quận 1' },
            store_id: { type: 'integer', nullable: true },
            is_default: { type: 'boolean', default: false },
            notes: { type: 'string' }
          }
        },
        BankAccount: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            account_name: { type: 'string' },
            account_number: { type: 'string' },
            bank_name: { type: 'string' },
            bank_code: { type: 'string' },
            branch: { type: 'string' },
            store_id: { type: 'integer' },
            store_name: { type: 'string' },
            is_default: { type: 'boolean' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        PaymentQR: {
          type: 'object',
          properties: {
            bank_code: { type: 'string' },
            bank_name: { type: 'string' },
            account_number: { type: 'string' },
            account_name: { type: 'string' },
            amount: { type: 'number' },
            description: { type: 'string' },
            qr_url: { type: 'string' },
            napas_qr: { type: 'string' }
          }
        },

        // ==================== CHECKOUT (ABANDONED) SCHEMAS ====================
        Checkout: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            checkoutCode: { type: 'string' },
            customerName: { type: 'string' },
            customerContact: { type: 'string' },
            storeId: { type: 'integer' },
            storeName: { type: 'string' },
            createdDate: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            itemCount: { type: 'integer' }
          }
        },
        SendPaymentLinkRequest: {
          type: 'object',
          properties: {
            custom_message: { type: 'string' }
          }
        },
        MassEmailRequest: {
          type: 'object',
          properties: {
            checkout_ids: {
              type: 'array',
              items: { type: 'integer' }
            },
            store_id: { type: 'integer' },
            exclude_already_sent: { type: 'boolean', default: true },
            custom_message: { type: 'string' }
          }
        },

        // ==================== PRODUCT IMAGE SCHEMAS ====================
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            image_url: { type: 'string' },
            alt_text: { type: 'string' },
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
        }
      },
      responses: {
        Success200: {
          description: 'Success - Operation completed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        Success201: {
          description: 'Created - Resource created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Resource created successfully' },
                  data: { type: 'object', description: 'Created resource' }
                }
              }
            }
          }
        },
        ListSuccess: {
          description: 'Success - Retrieved list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' }
            }
          }
        },
        BadRequest400: {
          description: 'Bad Request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid request data' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        UnauthorizedError: {
          description: 'Unauthorized - Token không hợp lệ hoặc hết hạn',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Unauthorized: Token không hợp lệ hoặc đã hết hạn' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Forbidden - Không có quyền thực hiện hành động',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Forbidden: Bạn không có quyền thực hiện hành động này' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Not Found - Không tìm thấy resource',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not Found: Không tìm thấy dữ liệu' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Unprocessable Entity - Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        RateLimitError: {
          description: 'Too Many Requests - Vượt quá rate limit (100 requests/15 min)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Too many requests. Please try again after 15 minutes.' },
                  retryAfter: { type: 'integer', example: 900, description: 'Seconds to wait' }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal Server Error - Lỗi server',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal Server Error: Đã xảy ra lỗi, vui lòng thử lại sau' },
                  errorId: { type: 'string', description: 'Error tracking ID' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/services/*.js'
  ]
};

const specs = swaggerJsdoc(options);

/**
 * Setup Swagger middleware
 * @param {Express} app - Express application
 */
const setupSwagger = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    customCss: `
      .swagger-ui .topbar { 
        display: none 
      }
      .swagger-ui .info { 
        margin: 30px 0;
        border-bottom: 2px solid #2d6a4f;
        padding-bottom: 20px;
      }
      .swagger-ui .info .title { 
        font-size: 2.5em;
        color: #1b4332;
        font-weight: 600;
      }
      .swagger-ui .info .description {
        color: #555;
        line-height: 1.8;
      }
      .swagger-ui .scheme-container {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
      }
      .swagger-ui .operation {
        border-left: 4px solid #52b788;
      }
      .swagger-ui .btn {
        border-radius: 4px;
      }
      .swagger-ui .btn.try-out {
        background-color: #2d6a4f;
      }
    `,
    customSiteTitle: 'Supermarket Management System - API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      displayOperationId: false,
      deepLinking: true,
    }
  };

  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Serve swagger JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(specs);
  });

  // Health check for documentation
  app.get('/api-docs/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'API Documentation is available',
      docs_url: '/api-docs',
      spec_url: '/api-docs.json'
    });
  });

  console.log('📚 Swagger documentation available at: http://localhost:5000/api-docs');
  console.log('📋 OpenAPI spec available at: http://localhost:5000/api-docs.json');
};

module.exports = {
  specs,
  setupSwagger
};

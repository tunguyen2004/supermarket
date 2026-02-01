# 🛒 Backend API - Supermarket Management System# Backend API - Supermarket Management System



**Phiên bản:** 3.0.0  ## 📋 Nội dung

**Cập nhật:** 01/02/2026  

**Tổng số API:** 129 endpoints | 21 ModulesCác API được xây dựng theo 3 module chính:



---### Module 1: Authentication (Xác thực)

- ✅ Đăng nhập

## 📋 Mục Lục- ✅ Đăng xuất  

- ✅ Refresh token

1. [Tổng quan](#-tổng-quan)- ✅ Lấy thông tin user đang đăng nhập

2. [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)

3. [Authentication](#-authentication)### Module 2: Quản lý Profile (Hồ sơ cá nhân)

4. [Response Format](#-response-format)- ✅ Xem thông tin cá nhân

5. [Error Handling](#-error-handling)- ✅ Cập nhật thông tin cá nhân

6. [API Modules](#-api-modules)- ✅ Đổi mật khẩu

7. [Tích hợp Frontend](#-hướng-dẫn-tích-hợp-frontend)- ✅ Upload avatar

8. [File Upload](#-file-upload)

9. [Pagination](#-pagination)### Module 3: Quản lý Nhân viên (Staff)

10. [Best Practices](#-best-practices)- ✅ Danh sách nhân viên

- ✅ Thêm nhân viên

---- ✅ Chi tiết nhân viên

- ✅ Sửa nhân viên

## 🎯 Tổng quan- ✅ Xóa nhân viên

- ✅ Phân quyền nhân viên

### Base URL

```---

Development: http://localhost:5000/api

Production:  https://api.yourdomain.com/api## 🚀 Quick Start

```

### 1. Cài đặt dependencies

### Tech Stack```bash

- **Runtime:** Node.js 18+npm install

- **Framework:** Express.js 4.x```

- **Database:** PostgreSQL 14+

- **Authentication:** JWT (JSON Web Token)### 2. Cấu hình environment

- **Documentation:** Swagger UITạo file `.env` trong thư mục `backend/` với nội dung:

```env

### Swagger DocumentationDB_HOST=localhost

Truy cập Swagger UI để xem chi tiết tất cả API:DB_PORT=5432

```DB_USER=postgres

http://localhost:5000/api/docsDB_PASSWORD=your_password

```DB_NAME=supermarket_db

DB_SSL=false

### Tài khoản Test

| Field | Giá trị |PORT=5000

|-------|--------|NODE_ENV=development

| Username | `admin` |

| Password | `1` |JWT_SECRET=your-super-secret-key-change-this-in-production

```

---

### 3. Khởi động server

## 🚀 Cài đặt & Khởi chạy```bash

npm run dev

### Cách 1: Sử dụng Docker (Khuyến nghị)```



```bashServer sẽ chạy trên `http://localhost:5000`

# Clone project

cd supermarket---



# Khởi chạy tất cả services## 📁 Cấu trúc thư mục

docker compose up -d

```

# Kiểm tra logsbackend/

docker logs minimart_backend -f├── src/

```│   ├── index.js                 # Main application file

│   ├── routes/

### Cách 2: Chạy Local│   │   └── index.js             # Routes definition

│   ├── services/

```bash│   │   ├── authService.js       # Authentication logic

# Cài dependencies│   │   ├── profileService.js    # Profile management logic

cd backend│   │   └── staffService.js      # Staff management logic

npm install│   ├── middleware/

│   │   └── auth.js              # JWT verification middleware

# Tạo file .env│   └── config/

cp .env.example .env│       └── database.js          # Database connection config

├── .env                         # Environment variables

# Chạy development server├── package.json

npm run dev└── README.md

``````



### Environment Variables---

```env

# Database## 🔧 Cài đặt Database

DB_HOST=localhost

DB_PORT=5432### 1. Tạo database

DB_USER=admin```bash

DB_PASSWORD=admin123createdb -U postgres supermarket_db

DB_NAME=minimart_db```

DB_SSL=false

### 2. Chạy schema

# Server```bash

PORT=5000psql -U postgres -d supermarket_db -f ../database/schema.sql

NODE_ENV=development```



# JWT### 3. Chạy seed data (optional)

JWT_SECRET=your-super-secret-key-change-in-production```bash

JWT_EXPIRES_IN=24hpsql -U postgres -d supermarket_db -f ../database/seed.sql

JWT_REFRESH_EXPIRES_IN=7d```

```

---

---

## 📝 Cấu trúc API Response

## 🔐 Authentication

### Success Response (200, 201)

### Login Flow```json

{

```javascript  "status": "OK",

// 1. Đăng nhập để lấy token  "message": "Operation successful",

const response = await fetch('http://localhost:5000/api/auth/login', {  "data": {

  method: 'POST',    // Data here

  headers: { 'Content-Type': 'application/json' },  }

  body: JSON.stringify({}

    username: 'admin',```

    password: '1'

  })### Error Response (400, 401, 404, 500)

});```json

{

const data = await response.json();  "status": "ERROR",

const token = data.data.token;  "message": "Error description",

  "error": "Detailed error message"

// 2. Lưu token vào localStorage hoặc cookie}

localStorage.setItem('token', token);```

```

---

### Sử dụng Token

## 🔐 Authentication

Tất cả API (trừ `/auth/login`) yêu cầu gửi token trong header:

Tất cả các endpoint (trừ login và refresh token) yêu cầu header `Authorization`:

```javascript

const response = await fetch('http://localhost:5000/api/products', {```

  method: 'GET',Authorization: Bearer <JWT_TOKEN>

  headers: {```

    'Content-Type': 'application/json',

    'Authorization': `Bearer ${token}`  // ⚠️ BẮT BUỘCToken được tạo sau khi đăng nhập thành công, hết hạn sau 7 ngày.

  }

});---

```

## 📚 Hướng dẫn Test

### Token Refresh

### Sử dụng Postman

```javascript1. Import file `Supermarket_API.postman_collection.json`

// Khi token sắp hết hạn hoặc đã hết hạn2. Set variable `base_url` = `http://localhost:5000`

const response = await fetch('http://localhost:5000/api/auth/refresh', {3. Đăng nhập để lấy token

  method: 'POST',4. Set variable `token` = token từ login response

  headers: { 'Content-Type': 'application/json' },5. Test các endpoint khác

  body: JSON.stringify({ token: oldToken })

});### Sử dụng cURL

```bash

const data = await response.json();# Login

const newToken = data.data.token;curl -X POST http://localhost:5000/api/auth/login \

```  -H "Content-Type: application/json" \

  -d '{"email":"user@example.com","password":"123456"}'

### Axios Interceptor (Khuyến nghị cho Vue/React)

# Get user info

```javascriptcurl -X GET http://localhost:5000/api/auth/me \

// services/api.js  -H "Authorization: Bearer <token_here>"

import axios from 'axios';```



const api = axios.create({---

  baseURL: 'http://localhost:5000/api',

  timeout: 30000## 🐛 Troubleshooting

});

| Problem | Solution |

// Request interceptor - Tự động gắn token|---------|----------|

api.interceptors.request.use(| Server không chạy | Kiểm tra port 5000 có bị chiếm không, restart server |

  (config) => {| Kết nối database failed | Kiểm tra `.env`, PostgreSQL đang chạy không |

    const token = localStorage.getItem('token');| Token invalid | Đăng nhập lại hoặc dùng refresh endpoint |

    if (token) {| CORS error | Đảm bảo frontend URL được add vào CORS whitelist |

      config.headers.Authorization = `Bearer ${token}`;

    }---

    return config;

  },## 📖 Xem tài liệu chi tiết

  (error) => Promise.reject(error)

);Xem file `API_TEST_GUIDE.md` ở thư mục root để xem hướng dẫn chi tiết từng endpoint



// Response interceptor - Xử lý lỗi token---

api.interceptors.response.use(

  (response) => response,## 💡 Ghi chú

  async (error) => {

    if (error.response?.status === 401) {- Password được hash bằng bcryptjs

      // Token hết hạn - chuyển về trang login- JWT token expires sau 7 ngày

      localStorage.removeItem('token');- Các field optional (phone, address) có thể null

      window.location.href = '/login';- Phân trang mặc định limit=10, offset=0

    }

    return Promise.reject(error);---

  }

);## 🎓 Học thêm



export default api;- JWT: https://jwt.io

```- Express.js: https://expressjs.com

- PostgreSQL: https://www.postgresql.org/docs

---- bcryptjs: https://www.npmjs.com/package/bcryptjs



## 📤 Response Format---



### Thành công (Success Response)**Created:** 19/01/2026  

**Version:** 1.0.0

```json
{
  "status": "OK",
  "message": "Thông báo thành công",
  "data": {
    // Dữ liệu trả về
  }
}
```

Hoặc format thay thế:

```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": {
    // Dữ liệu trả về
  }
}
```

### Lỗi (Error Response)

```json
{
  "status": "ERROR",
  "message": "Mô tả lỗi chi tiết",
  "error": "ERROR_CODE"
}
```

### Với danh sách có phân trang

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Ý nghĩa | Xử lý Frontend |
|------|---------|----------------|
| `200` | OK | Hiển thị data |
| `201` | Created | Hiển thị thông báo thành công |
| `400` | Bad Request | Hiển thị lỗi validation |
| `401` | Unauthorized | Chuyển về login |
| `403` | Forbidden | Thông báo không có quyền |
| `404` | Not Found | Thông báo không tìm thấy |
| `409` | Conflict | Thông báo dữ liệu trùng |
| `422` | Validation Error | Hiển thị chi tiết lỗi |
| `429` | Too Many Requests | Thông báo chờ và thử lại |
| `500` | Server Error | Thông báo lỗi hệ thống |

### Error Messages phổ biến

```javascript
const ERROR_MESSAGES = {
  // Authentication
  'INVALID_CREDENTIALS': 'Sai tên đăng nhập hoặc mật khẩu',
  'TOKEN_EXPIRED': 'Phiên đăng nhập hết hạn',
  'TOKEN_INVALID': 'Token không hợp lệ',
  'ACCOUNT_DISABLED': 'Tài khoản đã bị vô hiệu hóa',
  
  // Validation
  'VALIDATION_ERROR': 'Dữ liệu không hợp lệ',
  'DUPLICATE_ENTRY': 'Dữ liệu đã tồn tại',
  'NOT_FOUND': 'Không tìm thấy dữ liệu',
  
  // Permission
  'PERMISSION_DENIED': 'Không có quyền thực hiện',
  'ADMIN_REQUIRED': 'Chỉ Admin mới có quyền',
  
  // File
  'FILE_TOO_LARGE': 'File vượt quá kích thước cho phép',
  'INVALID_FILE_TYPE': 'Định dạng file không được hỗ trợ'
};
```

---

## 📦 API Modules

### Tổng quan 21 Modules

| # | Module | Endpoint Base | Số API | Mô tả |
|---|--------|---------------|--------|-------|
| 1 | Authentication | `/auth` | 4 | Đăng nhập, đăng xuất, refresh token |
| 2 | Staff | `/staff` | 6 | Quản lý nhân viên |
| 3 | Profile | `/users` | 5 | Quản lý profile cá nhân |
| 4 | Products | `/products` | 10 | Quản lý sản phẩm |
| 5 | Collections | `/collections` | 6 | Quản lý danh mục |
| 6 | Dashboard | `/dashboard` | 7 | Thống kê, báo cáo |
| 7 | Catalog | `/catalogs` | 5 | Quản lý bảng giá |
| 8 | Inventory | `/inventory` | 9 | Quản lý tồn kho |
| 9 | Product Images | `/products/:id/images` | 7 | Quản lý ảnh sản phẩm |
| 10 | Orders | `/orders` | 10 | Quản lý đơn hàng |
| 11 | Customers | `/customers` | 8 | Quản lý khách hàng |
| 12 | Suppliers | `/suppliers` | 5 | Quản lý nhà cung cấp |
| 13 | Discounts | `/discounts` | 8 | Quản lý khuyến mãi |
| 14 | Transactions | `/cashbook` | 7 | Quản lý thu chi |
| 15 | Shipments | `/shipments` | 8 | Quản lý vận chuyển |
| 16 | Order Returns | `/orders/:id/return` | 4 | Đổi trả hàng |
| 17 | Staff Reports | `/reports` | 5 | Báo cáo nhân viên |
| 18 | Inventory Lookup | `/inventory/lookup` | 2 | Tra cứu tồn kho |
| 19 | POS | `/pos` | 10 | Point of Sale |
| 20 | Bank Accounts | `/bank-accounts` | 6 | Quản lý tài khoản ngân hàng |
| 21 | Checkouts | `/checkouts` | 6 | Quản lý thanh toán online |

---

### Module 1: Authentication

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Login | POST | `/auth/login` | ❌ | Đăng nhập |
| Logout | POST | `/auth/logout` | ✅ | Đăng xuất |
| Refresh | POST | `/auth/refresh` | ❌ | Làm mới token |
| Get Roles | GET | `/auth/roles` | ✅ | Danh sách roles |

**Login Request:**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "1"
}
```

**Login Response:**
```json
{
  "status": "OK",
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Administrator",
    "role_id": 1,
    "role_name": "Admin",
    "is_active": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Module 2: Staff Management

| API | Method | Endpoint | Auth | Role | Mô tả |
|-----|--------|----------|------|------|-------|
| List | GET | `/staff` | ✅ | Admin | Danh sách nhân viên |
| Create | POST | `/staff` | ✅ | Admin | Thêm nhân viên |
| Detail | GET | `/staff/:id` | ✅ | Admin | Chi tiết nhân viên |
| Update | PUT | `/staff/:id` | ✅ | Admin | Cập nhật nhân viên |
| Delete | DELETE | `/staff/:id` | ✅ | Admin | Xóa nhân viên |
| Update Role | PUT | `/staff/:id/role` | ✅ | Admin | Phân quyền |

**Roles hệ thống:**
| role_id | Code | Tên | Mô tả |
|---------|------|-----|-------|
| 1 | ADMIN | Admin | Toàn quyền hệ thống |
| 2 | STAFF | Staff | Nhân viên - quyền cơ bản |
| 3 | MANAGER | Manager | Quản lý cấp trung |

**Thêm nhân viên:**
```javascript
POST /api/staff
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "staff1",
  "email": "staff1@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "password": "password123",
  "role_id": 2
}
```

---

### Module 3: Profile Management

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Get Profile | GET | `/users/profile` | ✅ | Xem thông tin cá nhân |
| Update Profile | PUT | `/users/profile` | ✅ | Cập nhật thông tin |
| Change Password | PUT | `/users/change-password` | ✅ | Đổi mật khẩu |
| Upload Avatar | POST | `/users/avatar` | ✅ | Upload ảnh đại diện |
| Delete Avatar | DELETE | `/users/avatar` | ✅ | Xóa ảnh đại diện |

**Cập nhật profile:**
```javascript
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "full_name": "Nguyễn Văn B",
  "phone": "0987654321",
  "date_of_birth": "1990-01-15",
  "gender": "male",      // male | female | other
  "address": "123 Đường ABC, Quận 1"
}
```

**Đổi mật khẩu:**
```javascript
PUT /api/users/change-password
Content-Type: application/json
Authorization: Bearer <token>

{
  "oldPassword": "1",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

---

### Module 4: Products

| API | Method | Endpoint | Auth | Role | Mô tả |
|-----|--------|----------|------|------|-------|
| List | GET | `/products` | ✅ | All | Danh sách sản phẩm |
| Create | POST | `/products` | ✅ | Manager+ | Thêm sản phẩm |
| Detail | GET | `/products/:id` | ✅ | All | Chi tiết sản phẩm |
| Update | PUT | `/products/:id` | ✅ | Manager+ | Sửa sản phẩm |
| Delete | DELETE | `/products/:id` | ✅ | Manager+ | Xóa sản phẩm |
| Bulk Status | PATCH | `/products/bulk-status` | ✅ | Manager+ | Bật/tắt hàng loạt |
| Export | GET | `/products/export` | ✅ | All | Xuất CSV |
| Import | POST | `/products/import` | ✅ | Manager+ | Nhập CSV |
| Brands | GET | `/brands` | ✅ | All | DS thương hiệu |
| Units | GET | `/units` | ✅ | All | DS đơn vị tính |

**Query Parameters:**
```
GET /api/products?search=sữa&category_id=1&brand_id=1&is_active=true&page=1&limit=20
```

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| search | string | - | Tìm theo tên hoặc mã |
| category_id | number | - | Lọc theo danh mục |
| brand_id | number | - | Lọc theo thương hiệu |
| is_active | boolean | - | Lọc trạng thái |
| page | number | 1 | Trang hiện tại |
| limit | number | 10 | Số items/trang |

**Thêm sản phẩm:**
```javascript
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "MILK002",
  "name": "Sữa chua Vinamilk",
  "category_id": 1,
  "brand_id": 1,
  "unit_id": 1,
  "description": "Sữa chua hộp 100g",
  "is_active": true,
  "sku": "MILK002-SKU",
  "barcode": "8934567890789",
  "cost_price": 8000,
  "selling_price": 12000
}
```

---

### Module 5: Collections (Danh mục)

| API | Method | Endpoint | Auth | Role | Mô tả |
|-----|--------|----------|------|------|-------|
| List | GET | `/collections` | ✅ | All | Danh sách danh mục |
| Tree | GET | `/collections/tree` | ✅ | All | Cây danh mục (nested) |
| Create | POST | `/collections` | ✅ | Manager+ | Thêm danh mục |
| Detail | GET | `/collections/:id` | ✅ | All | Chi tiết danh mục |
| Update | PUT | `/collections/:id` | ✅ | Manager+ | Sửa danh mục |
| Delete | DELETE | `/collections/:id` | ✅ | Manager+ | Xóa danh mục |

**Cây danh mục response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "FOOD",
      "name": "Thực phẩm",
      "children": [
        {
          "id": 3,
          "code": "DAIRY",
          "name": "Sữa",
          "children": []
        }
      ]
    }
  ]
}
```

---

### Module 6: Dashboard

| API | Method | Endpoint | Auth | Mô tả |
|-----|--------|----------|------|-------|
| Overview | GET | `/dashboard/overview` | ✅ | Tổng quan |
| Stats | GET | `/dashboard/stats` | ✅ | Thống kê |
| Revenue Chart | GET | `/dashboard/revenue-chart` | ✅ | Biểu đồ doanh thu |
| Top Products | GET | `/dashboard/top-products` | ✅ | SP bán chạy |
| Sales Channels | GET | `/dashboard/sales-channels` | ✅ | Kênh bán hàng |
| Top Customers | GET | `/dashboard/top-customers` | ✅ | KH tiềm năng |
| Low Stock | GET | `/dashboard/low-stock` | ✅ | Tồn kho thấp |

**Query Parameters (Dashboard):**
```
GET /api/dashboard/stats?from=2026-01-01&to=2026-01-31
```

| Param | Type | Mô tả |
|-------|------|-------|
| from | date | Ngày bắt đầu (YYYY-MM-DD) |
| to | date | Ngày kết thúc (YYYY-MM-DD) |
| groupBy | string | Nhóm theo: day, week, month |
| limit | number | Số lượng trả về |

---

### Module 7-8: Catalog & Inventory

**Catalog (Bảng giá):**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/catalogs` | Danh sách bảng giá |
| Detail | GET | `/catalogs/:id` | Chi tiết |
| Update | PUT | `/catalogs/:id` | Cập nhật giá |
| Bulk Update | PATCH | `/catalogs/bulk-update` | Cập nhật hàng loạt |
| Export | GET | `/catalogs/export` | Xuất Excel |

**Inventory (Tồn kho):**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/inventory` | Danh sách tồn kho |
| Detail | GET | `/inventory/:variantId` | Chi tiết theo variant |
| Update | PUT | `/inventory/:variantId` | Cập nhật tồn kho |
| History | GET | `/inventory/:variantId/history` | Lịch sử xuất nhập |
| Receive | POST | `/inventory/receive` | Nhập kho |
| Transfer | POST | `/inventory/transfer` | Chuyển kho |
| Return | POST | `/inventory/return` | Trả nhà cung cấp |

---

### Module 9: Product Images

| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/products/:id/images` | DS ảnh sản phẩm |
| Upload Main | POST | `/products/:id/image` | Upload ảnh chính |
| Delete Main | DELETE | `/products/:id/image` | Xóa ảnh chính |
| Upload Gallery | POST | `/products/:id/images` | Upload nhiều ảnh (max 5) |
| Delete Gallery | DELETE | `/products/:id/images/:imageId` | Xóa 1 ảnh |
| Set Primary | PUT | `/products/:id/images/:imageId/primary` | Đặt ảnh chính |
| Reorder | PUT | `/products/:id/images/reorder` | Sắp xếp thứ tự |

---

### Module 10: Orders

| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/orders` | Danh sách đơn hàng |
| Create | POST | `/orders` | Tạo đơn hàng |
| Detail | GET | `/orders/:id` | Chi tiết đơn |
| Update Status | PUT | `/orders/:id` | Cập nhật trạng thái |
| Cancel | DELETE | `/orders/:id` | Hủy đơn |
| Return | POST | `/orders/:id/return` | Trả hàng |
| Returns List | GET | `/orders/returns` | DS đơn trả |
| Stats Summary | GET | `/orders/stats/summary` | Thống kê tóm tắt |
| Stats Detailed | GET | `/orders/stats/detailed` | Thống kê chi tiết |
| Invoice | GET | `/orders/:id/invoice` | In hóa đơn |

**Order Status Flow:**
```
pending → confirmed → processing → shipping → completed
                                           ↘ cancelled
                                           ↘ returned
```

---

### Module 11-12: Customers & Suppliers

**Customers:**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/customers` | Danh sách khách hàng |
| Search | GET | `/customers/search` | Tìm kiếm nhanh |
| Create | POST | `/customers` | Thêm khách hàng |
| Detail | GET | `/customers/:id` | Chi tiết |
| Update | PUT | `/customers/:id` | Cập nhật |
| Delete | DELETE | `/customers/:id` | Xóa |
| Update Group | PUT | `/customers/:id/group` | Đổi nhóm KH |
| Groups | GET | `/customer-groups` | DS nhóm khách hàng |

**Suppliers:**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/suppliers` | Danh sách NCC |
| Detail | GET | `/suppliers/:id` | Chi tiết |
| Create | POST | `/suppliers` | Thêm NCC |
| Update | PUT | `/suppliers/:id` | Cập nhật |
| Delete | DELETE | `/suppliers/:id` | Xóa |

---

### Module 13-14: Discounts & Transactions

**Discounts (Khuyến mãi):**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/discounts` | Danh sách KM |
| Types | GET | `/discounts/types` | Loại khuyến mãi |
| Detail | GET | `/discounts/:id` | Chi tiết |
| Create | POST | `/discounts` | Tạo KM |
| Update | PUT | `/discounts/:id` | Sửa KM |
| Delete | DELETE | `/discounts/:id` | Xóa |
| Deactivate | PATCH | `/discounts/:id/deactivate` | Tắt KM |
| Validate | POST | `/discounts/validate` | Kiểm tra mã KM |

**Transactions (Thu chi):**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/cashbook` | Danh sách giao dịch |
| Summary | GET | `/cashbook/summary` | Tổng hợp thu chi |
| Detail | GET | `/cashbook/:id` | Chi tiết |
| Create | POST | `/cashbook` | Tạo phiếu |
| Update | PUT | `/cashbook/:id` | Cập nhật |
| Delete | DELETE | `/cashbook/:id` | Xóa |
| Approve | PATCH | `/cashbook/:id/approve` | Duyệt phiếu |

---

### Module 15-16: Shipments & Returns

**Shipments:**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| List | GET | `/shipments` | Danh sách vận chuyển |
| Statuses | GET | `/shipments/statuses` | Trạng thái VC |
| Carriers | GET | `/shipments/carriers` | DS đơn vị VC |
| Detail | GET | `/shipments/:id` | Chi tiết |
| Create | POST | `/shipments` | Tạo phiếu VC |
| Update | PUT | `/shipments/:id` | Cập nhật |
| Delete | DELETE | `/shipments/:id` | Xóa |
| Update Status | PATCH | `/shipments/:id/status` | Cập nhật trạng thái |

---

### Module 17-18: Reports & Lookup

**Staff Reports:**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Daily Report | GET | `/reports/daily` | Báo cáo ngày |
| Print Daily | GET | `/reports/daily/print` | In báo cáo ngày |
| Actual Revenue | GET | `/reports/actual-revenue` | Doanh thu thực |
| Sold Products | GET | `/reports/sold-products` | SP đã bán |
| Staff Report | GET | `/reports/staff` | BC theo nhân viên |

**Inventory Lookup:**
| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Search | GET | `/inventory/lookup/search` | Tìm SP tra cứu tồn |
| Detail | GET | `/inventory/lookup/:productId` | Chi tiết tồn kho |

---

### Module 19: POS (Point of Sale)

| API | Method | Endpoint | Mô tả |
|-----|--------|----------|-------|
| Checkout | POST | `/pos/checkout` | Thanh toán |
| Search Products | GET | `/pos/products/search` | Tìm SP |
| Get Price | GET | `/pos/products/:variantId/price` | Lấy giá |
| Save Draft | POST | `/pos/orders/draft` | Lưu tạm |
| List Drafts | GET | `/pos/orders/drafts` | DS đơn tạm |
| Get Draft | GET | `/pos/orders/drafts/:id` | Chi tiết đơn tạm |
| Delete Draft | DELETE | `/pos/orders/draft/:id` | Xóa đơn tạm |
| Print Receipt | GET | `/pos/orders/:id/receipt` | In hóa đơn |
| Validate Discount | POST | `/pos/discounts/validate` | Kiểm tra KM |
| Payment Methods | GET | `/pos/payment-methods` | Phương thức TT |

---

### Module 20-21: Bank Accounts & Checkouts

**Bank Accounts:**
| API | Method | Endpoint | Role | Mô tả |
|-----|--------|----------|------|-------|
| List | GET | `/bank-accounts` | All | DS tài khoản NH |
| Detail | GET | `/bank-accounts/:id` | All | Chi tiết |
| Create | POST | `/bank-accounts` | Admin | Thêm TK |
| Update | PUT | `/bank-accounts/:id` | Admin | Cập nhật |
| Delete | DELETE | `/bank-accounts/:id` | Admin | Xóa |
| QR Code | GET | `/bank-accounts/:id/qr` | All | Lấy mã QR |

**Checkouts:**
| API | Method | Endpoint | Role | Mô tả |
|-----|--------|----------|------|-------|
| List | GET | `/checkouts` | All | DS checkout |
| Stats | GET | `/checkouts/stats` | All | Thống kê |
| Detail | GET | `/checkouts/:id` | All | Chi tiết |
| Send Link | POST | `/checkouts/:id/send-link` | All | Gửi link TT |
| Mass Email | POST | `/checkouts/mass-email` | Manager+ | Gửi email hàng loạt |
| Delete | DELETE | `/checkouts/:id` | Admin | Xóa |

---

## 🔧 Hướng dẫn Tích hợp Frontend

### 1. Cấu trúc Services (Vue.js/React)

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
});

// Auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// services/authService.js
import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (token) => api.post('/auth/refresh', { token }),
  getRoles: () => api.get('/auth/roles')
};

// services/productService.js
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getBrands: () => api.get('/brands'),
  getUnits: () => api.get('/units')
};
```

### 2. Xử lý Loading & Error State

```javascript
// composables/useApi.js (Vue 3)
import { ref } from 'vue';

export function useApi() {
  const loading = ref(false);
  const error = ref(null);

  const execute = async (apiCall) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiCall();
      return response.data;
    } catch (e) {
      error.value = e.response?.data?.message || 'Có lỗi xảy ra';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, execute };
}

// Usage
const { loading, error, execute } = useApi();
const products = await execute(() => productService.getProducts({ page: 1 }));
```

### 3. Xử lý Pagination

```vue
<template>
  <div>
    <ProductTable :products="products" :loading="loading" />
    
    <Pagination
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total="pagination.total"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { productService } from '@/services/productService';

const products = ref([]);
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const loading = ref(false);

const fetchProducts = async (page = 1) => {
  loading.value = true;
  try {
    const response = await productService.getProducts({ page, limit: 20 });
    products.value = response.data.data.products;
    pagination.value = response.data.data.pagination;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => fetchProducts(page);

onMounted(() => fetchProducts());
</script>
```

---

## 📁 File Upload

### Định dạng hỗ trợ

| Loại | Extensions | Max Size |
|------|------------|----------|
| Avatar | jpg, jpeg, png, gif, webp | 5MB |
| Product Image | jpg, jpeg, png, gif, webp | 10MB |
| CSV Import | csv | 10MB |

### Upload Avatar

```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};
```

### Upload Product Images (Multiple)

```javascript
const uploadProductImages = async (productId, files) => {
  const formData = new FormData();
  
  // Upload nhiều file (max 5)
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Hiển thị ảnh từ Server

```javascript
const getImageUrl = (path) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

// Template
<img :src="getImageUrl(product.image_url)" alt="Product" />
```

---

## 📊 Pagination

### Query Parameters

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 10-20 | Số items/trang |
| `offset` | number | 0 | Bắt đầu từ record thứ n |
| `search` | string | - | Từ khóa tìm kiếm |
| `sort` | string | - | Field để sort |
| `order` | string | asc | asc hoặc desc |

### Response Format

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## ✅ Best Practices

### 1. Debounce Search

```javascript
import { debounce } from 'lodash-es';

const searchProducts = debounce(async (keyword) => {
  const response = await productService.getProducts({ search: keyword });
  products.value = response.data.data.products;
}, 300);
```

### 2. Optimistic Updates

```javascript
const deleteProduct = async (id) => {
  // Optimistic: Xóa khỏi UI trước
  const index = products.value.findIndex(p => p.id === id);
  const removed = products.value.splice(index, 1)[0];
  
  try {
    await productService.deleteProduct(id);
    toast.success('Xóa thành công');
  } catch (error) {
    // Rollback nếu lỗi
    products.value.splice(index, 0, removed);
    toast.error('Xóa thất bại');
  }
};
```

### 3. Error Boundary

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Lỗi không xác định';
    
    // Show toast notification
    toast.error(message);
    
    // Log for debugging
    console.error('API Error:', error);
    
    return Promise.reject(error);
  }
);
```

### 4. Environment Variables

```env
# .env.development
VITE_API_URL=http://localhost:5000/api

# .env.production
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 📁 Cấu trúc thư mục Backend

```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection
│   │   └── swagger.js        # Swagger config
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── authorize.js      # Role-based access
│   │   ├── validate.js       # Request validation
│   │   ├── upload.js         # File upload (multer)
│   │   └── rateLimiter.js    # Rate limiting
│   ├── routes/
│   │   ├── index.js          # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── productRoutes.js
│   │   └── ...
│   ├── services/
│   │   ├── authService.js
│   │   ├── staffService.js
│   │   ├── productService.js
│   │   └── ...
│   ├── validators/
│   │   └── schemas.js        # Joi schemas
│   └── utils/
│       └── responseHelper.js
├── uploads/
│   ├── avatars/
│   └── products/
├── __tests__/                 # Unit tests
├── package.json
└── Dockerfile
```

---

## 🔗 Links

- **Swagger UI:** http://localhost:5000/api/docs
- **Postman Collection:** `supermarket.json` (root folder)
- **Full API Reference:** `API.md`

---

## 📞 Troubleshooting

| Vấn đề | Kiểm tra |
|--------|----------|
| Backend không chạy | `docker logs minimart_backend` |
| 401 Unauthorized | Token hết hạn? Đăng nhập lại |
| CORS Error | Backend đã cấu hình CORS? |
| Connection refused | Backend đang chạy port 5000? |
| Database error | PostgreSQL container running? |

---

**Happy Coding! 🚀**

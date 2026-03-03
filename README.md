# 🛒 Supermarket Management System

<p align="center">
  <img src="https://img.shields.io/badge/version-4.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node">
  <img src="https://img.shields.io/badge/vue-3.x-4FC08D.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/postgresql-14+-336791.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/docker-compose-2496ED.svg" alt="Docker">
</p>

<p align="center">
  Hệ thống quản lý siêu thị mini toàn diện – <strong>150+ REST API</strong> trên <strong>22 modules</strong>
</p>

---

## 📑 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Môi trường & Biến cấu hình](#-môi-trường--biến-cấu-hình)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)

---

## 🎯 Tổng quan

**Supermarket Management System** là ứng dụng quản lý siêu thị mini full-stack được xây dựng với:

- **Frontend:** Vue 3 + Tailwind CSS (SPA)
- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL 14
- **Triển khai:** Docker Compose (3 services)
- **Tài liệu API:** Swagger / OpenAPI 3.0

---

## ✨ Tính năng

### 🔐 Module 1 – Authentication
- Đăng nhập / Đăng xuất với JWT
- Refresh Token (7 ngày)
- Phân quyền 3 cấp: Admin · Manager · Staff

### 👥 Module 2 – Staff Management
- Quản lý tài khoản nhân viên (CRUD)
- Thay đổi role / trạng thái hoạt động

### 🙍 Module 3 – Profile
- Xem & cập nhật thông tin cá nhân
- Đổi mật khẩu, upload ảnh đại diện

### 📦 Module 4 – Products
- Quản lý sản phẩm với biến thể (variants)
- Import / Export CSV hàng loạt
- Upload đa ảnh sản phẩm
- Cập nhật trạng thái hàng loạt

### 📂 Module 5 – Collections (Danh mục)
- Cây danh mục đa cấp
- Thêm / sửa / xóa danh mục

### 📊 Module 6 – Dashboard
- Tổng quan doanh thu, đơn hàng, khách hàng
- Biểu đồ doanh thu theo thời gian
- Top sản phẩm bán chạy, top khách hàng
- Cảnh báo hàng sắp hết

### 💰 Module 7 – Catalogs (Bảng giá)
- Quản lý giá bán & giá vốn từng variant
- Cập nhật giá hàng loạt (cố định / phần trăm)
- Xuất bảng giá ra CSV

### 🏪 Module 8 – Inventory (Tồn kho)
- Nhập kho từ nhà cung cấp
- Chuyển kho giữa các chi nhánh
- Trả hàng nhà cung cấp
- Điều chỉnh tồn kho thủ công
- Lịch sử giao dịch kho chi tiết
- Tra cứu tồn kho theo sản phẩm

### 🛒 Module 9 – Orders (Đơn hàng)
- Tạo & quản lý đơn hàng
- Đơn nháp (Draft) → Chuyển thành đơn chính thức
- Hoàn trả đơn hàng (partial / full)
- In hóa đơn
- Thống kê đơn hàng

### 🧑 Module 10 – Customers
- Quản lý hồ sơ khách hàng
- Tìm kiếm nhanh (dùng cho POS)
- Danh sách tỉnh/thành phố

### 🏷️ Module 11 – Customer Groups
- Phân nhóm khách hàng (VIP, Regular, v.v.)

### 🏭 Module 12 – Suppliers
- Quản lý danh sách nhà cung cấp

### 🎁 Module 13 – Discounts
- Khuyến mại: % giảm giá, giảm cố định, Buy X Get Y, Free Shipping
- Kiểm tra & áp dụng mã giảm giá
- Bật / tắt khuyến mại

### 💳 Module 14 – Transactions (Sổ quỹ)
- Quản lý phiếu thu / phiếu chi
- Thống kê tồn quỹ theo cửa hàng
- Duyệt / từ chối phiếu

### 🚚 Module 15 – Shipments (Vận chuyển)
- Quản lý vận đơn & trạng thái giao hàng
- Tích hợp nhiều đơn vị vận chuyển (carriers)
- Báo cáo dashboard vận chuyển

### 📈 Module 16 – Reports
- Báo cáo doanh thu theo ngày
- Báo cáo thực thu theo phương thức thanh toán
- Danh sách sản phẩm đã bán
- Báo cáo cuối ngày

### 🖥️ Module 17 – POS (Point of Sale)
- Thanh toán tại quầy đầy đủ
- Tìm kiếm sản phẩm nhanh (barcode / SKU / tên)
- Đơn hàng tạm (Draft)
- Tạo mã QR thanh toán (VietQR)
- Webhook tích hợp SePay
- Kiểm tra trạng thái thanh toán QR

### 🏦 Module 18 – Bank Accounts
- Quản lý tài khoản ngân hàng
- Thiết lập tài khoản mặc định

### 🛍️ Module 19 – Checkouts (Đơn chưa hoàn tất)
- Theo dõi abandoned carts
- Gửi link thanh toán qua email

### 🤖 Module 20 – Chatbot AI
- Chatbot hỏi đáp thông tin hệ thống
- Truy vấn doanh thu, tồn kho qua ngôn ngữ tự nhiên
- Lưu lịch sử chat theo session

### 🔍 Module 21 – Search
- Tìm kiếm toàn cục: sản phẩm, khách hàng, đơn hàng

### ⚙️ Module 22 – Utilities
- Brands, Units, Stores
- Loại giao dịch kho, loại thu chi, phương thức thanh toán

---

## 🛠 Công nghệ sử dụng

| Layer | Stack |
|-------|-------|
| **Frontend** | Vue 3, Vue Router, Pinia, Tailwind CSS, Axios |
| **Backend** | Node.js 18+, Express 4, swagger-jsdoc, Joi, JWT |
| **Database** | PostgreSQL 14, node-postgres (pg) |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Tool** | Postman, CloudBeaver (DB GUI) |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────┐  │
│  │  Frontend   │   │   Backend   │   │  PostgreSQL   │  │
│  │  Vue 3      │──▶│  Express    │──▶│  Database     │  │
│  │  :8080      │   │  :5000      │   │  :5432        │  │
│  └─────────────┘   └─────────────┘   └───────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  CloudBeaver (Database GUI)  :8978                  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Request Flow:**
```
User → Frontend (Vue 3 / Nginx) → Backend API (Express) → PostgreSQL
                                       │
                                  JWT Auth Middleware
                                  Rate Limiter
                                  Joi Validator
```

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy
- Git

### Bước 1: Clone dự án

```bash
git clone https://github.com/tunguyen2004/supermarket.git
cd supermarket
```

### Bước 2: Chạy với Docker Compose

```bash
docker compose up --build -d
```

Đợi khoảng **1–2 phút** để các service khởi động và seed dữ liệu.

### Bước 3: Kiểm tra trạng thái

```bash
docker compose ps
```

### Bước 4: Truy cập

| Service | URL | Mô tả |
|---------|-----|-------|
| 🌐 Frontend | http://localhost:8080 | Giao diện người dùng |
| ⚙️ Backend API | http://localhost:5000 | REST API |
| 📚 Swagger UI | http://localhost:5000/api-docs | Tài liệu API tương tác |
| 📋 OpenAPI JSON | http://localhost:5000/api-docs.json | Swagger spec JSON |
| 🗄️ CloudBeaver | http://localhost:8978 | Quản lý Database (GUI) |

### Tài khoản mặc định

**Web / API:**
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Administrator |
| `manager1` | `1` | Manager |
| `staff1` | `1` | Staff |

**CloudBeaver** (http://localhost:8978):
| Email | Password |
|-------|----------|
| `admin@minimart.com` | `admin123` |

---

## 📁 Cấu trúc thư mục

```
supermarket/
├── docker-compose.yml          # Docker orchestration
├── README.md
├── supermarket.json            # Postman collection (150+ APIs)
│
├── backend/                    # Node.js / Express API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # App entry point
│       ├── config/
│       │   ├── database.js     # PostgreSQL connection pool
│       │   └── swagger.js      # Swagger / OpenAPI config
│       ├── middleware/
│       │   ├── auth.js         # JWT verifyToken
│       │   ├── authorize.js    # Role-based authorization
│       │   ├── rateLimiter.js  # Rate limiting
│       │   ├── upload.js       # Multer file upload
│       │   └── validate.js     # Joi request validation
│       ├── routes/             # 22 route modules
│       ├── services/           # Business logic
│       ├── validators/         # Joi schemas
│       └── utils/
│           ├── codeGenerator.js
│           └── responseHelper.js
│
├── frontend/                   # Vue 3 SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/
│       ├── store/              # Pinia stores
│       ├── services/           # Axios API calls
│       ├── views/
│       └── components/
│
└── database/
    ├── init/
    │   ├── 01_schema.sql       # Tạo bảng
    │   ├── 02_seed.sql         # Dữ liệu mẫu
    │   ├── 03_functions.sql    # Stored functions
    │   └── 04_catchup.sql      # Migrations bổ sung
    └── docs/
        ├── SCHEMA_DESIGN.md
        └── DATA_ENGINEERING_GUIDE.md
```

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000/api-docs`

### Xác thực

Tất cả API (trừ `/api/auth/login`) yêu cầu header:

```
Authorization: Bearer <jwt_token>
```

### Response Format chuẩn

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### Module 1 – Auth `/api/auth`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/login` | Đăng nhập, lấy JWT token | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ✅ |
| POST | `/api/auth/refresh` | Làm mới access token | ❌ |
| GET  | `/api/auth/me` | Thông tin user hiện tại | ✅ |

**Login Request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "refreshToken": "...",
    "role_id": 1,
    "role_name": "Admin"
  }
}
```

---

### Module 2 – Staff `/api/staff`

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET    | `/api/staff` | Danh sách nhân viên | Admin |
| POST   | `/api/staff` | Thêm nhân viên mới | Admin |
| GET    | `/api/staff/:id` | Chi tiết nhân viên | Admin |
| PUT    | `/api/staff/:id` | Cập nhật thông tin | Admin |
| DELETE | `/api/staff/:id` | Xóa nhân viên | Admin |
| PATCH  | `/api/staff/:id/role` | Thay đổi role | Admin |

---

### Module 3 – Profile `/api/users`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/users/profile` | Xem thông tin cá nhân |
| PUT    | `/api/users/profile` | Cập nhật thông tin |
| PUT    | `/api/users/change-password` | Đổi mật khẩu |
| POST   | `/api/users/avatar` | Upload ảnh đại diện |
| DELETE | `/api/users/avatar` | Xóa ảnh đại diện |

---

### Module 4 – Products `/api/products`

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET    | `/api/products` | Danh sách sản phẩm | All |
| POST   | `/api/products` | Thêm sản phẩm mới | Manager+ |
| GET    | `/api/products/export` | Xuất CSV | All |
| POST   | `/api/products/import` | Nhập từ CSV | Manager+ |
| PATCH  | `/api/products/bulk-status` | Cập nhật trạng thái loạt | Manager+ |
| GET    | `/api/products/:id` | Chi tiết sản phẩm | All |
| PUT    | `/api/products/:id` | Cập nhật sản phẩm | Manager+ |
| DELETE | `/api/products/:id` | Xóa sản phẩm | Manager+ |
| GET    | `/api/products/:id/images` | Danh sách ảnh | All |
| POST   | `/api/products/:id/images` | Upload 1 ảnh | Manager+ |
| POST   | `/api/products/:id/images/multiple` | Upload nhiều ảnh | Manager+ |
| DELETE | `/api/products/:id/images/:imageId` | Xóa ảnh | Manager+ |
| PATCH  | `/api/products/:id/images/reorder` | Sắp xếp lại ảnh | Manager+ |

**Query params cho GET `/api/products`:**
- `page`, `limit`, `search`, `category_id`, `brand_id`, `is_active`

---

### Module 5 – Collections `/api/collections`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/collections` | Danh sách danh mục |
| POST   | `/api/collections` | Thêm danh mục |
| GET    | `/api/collections/tree` | Cây danh mục (nested) |
| GET    | `/api/collections/:id` | Chi tiết danh mục |
| PUT    | `/api/collections/:id` | Cập nhật danh mục |
| DELETE | `/api/collections/:id` | Xóa danh mục |

---

### Module 6 – Dashboard `/api/dashboard`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/dashboard/overview` | Tổng quan nhanh |
| GET | `/api/dashboard/stats` | Thống kê KPIs |
| GET | `/api/dashboard/revenue-chart` | Biểu đồ doanh thu |
| GET | `/api/dashboard/top-products` | Top sản phẩm bán chạy |
| GET | `/api/dashboard/sales-channels` | Kênh bán hàng |
| GET | `/api/dashboard/top-customers` | Top khách hàng |
| GET | `/api/dashboard/low-stock` | Hàng sắp hết |

**Query params:** `period` (today | week | month | year), `store_id`

---

### Module 7 – Catalogs `/api/catalogs`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET   | `/api/catalogs` | Danh sách bảng giá |
| GET   | `/api/catalogs/export` | Xuất CSV |
| PATCH | `/api/catalogs/bulk-update` | Cập nhật giá hàng loạt |
| GET   | `/api/catalogs/:id` | Chi tiết |
| PUT   | `/api/catalogs/:id` | Cập nhật giá |

---

### Module 8 – Inventory `/api/inventories`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET  | `/api/inventories` | Danh sách tồn kho |
| POST | `/api/inventories/receive` | Nhập kho |
| POST | `/api/inventories/transfer` | Chuyển kho |
| POST | `/api/inventories/return` | Trả hàng NCC |
| GET  | `/api/inventories/transactions` | Lịch sử giao dịch kho |
| GET  | `/api/inventories/transactions/:id` | Chi tiết giao dịch |
| GET  | `/api/inventories/:variantId` | Tồn kho theo variant |
| PUT  | `/api/inventories/:variantId` | Điều chỉnh tồn kho |
| GET  | `/api/inventory/lookup/search` | Tra cứu nhanh |
| GET  | `/api/inventory/lookup/:productId` | Chi tiết tồn kho SP |

---

### Module 9 – Orders `/api/orders`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/orders` | Danh sách đơn hàng |
| POST   | `/api/orders` | Tạo đơn hàng mới |
| GET    | `/api/orders/stats/summary` | Thống kê tổng quan |
| GET    | `/api/orders/stats/detailed` | Thống kê chi tiết |
| GET    | `/api/orders/returns` | Danh sách đơn hoàn trả |
| GET    | `/api/orders/drafts` | Danh sách đơn nháp |
| POST   | `/api/orders/drafts` | Tạo đơn nháp |
| POST   | `/api/orders/drafts/:id/convert` | Chuyển nháp → chính thức |
| DELETE | `/api/orders/drafts/:id` | Xóa đơn nháp |
| GET    | `/api/orders/:id` | Chi tiết đơn hàng |
| PUT    | `/api/orders/:id` | Cập nhật trạng thái |
| DELETE | `/api/orders/:id` | Hủy đơn hàng |
| POST   | `/api/orders/:id/return` | Hoàn trả đơn hàng |
| GET    | `/api/orders/:id/invoice` | Lấy dữ liệu in hóa đơn |

---

### Module 10 – Customers `/api/customers`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET  | `/api/customers` | Danh sách khách hàng |
| GET  | `/api/customers/search` | Tìm kiếm nhanh |
| GET  | `/api/customers/cities` | Danh sách tỉnh/thành |
| POST | `/api/customers` | Thêm khách hàng |
| GET  | `/api/customers/:id` | Chi tiết khách hàng |
| PUT  | `/api/customers/:id` | Cập nhật khách hàng |
| DELETE | `/api/customers/:id` | Xóa khách hàng |
| PUT  | `/api/customers/:id/group` | Chuyển nhóm KH |

---

### Module 11 – Customer Groups `/api/customer-groups`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/customer-groups` | Danh sách nhóm KH |

---

### Module 12 – Suppliers `/api/suppliers`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/suppliers` | Danh sách NCC |
| POST   | `/api/suppliers` | Thêm NCC |
| GET    | `/api/suppliers/:id` | Chi tiết NCC |
| PUT    | `/api/suppliers/:id` | Cập nhật NCC |
| DELETE | `/api/suppliers/:id` | Xóa NCC |

---

### Module 13 – Discounts `/api/discounts`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/discounts` | Danh sách khuyến mại |
| POST   | `/api/discounts` | Tạo khuyến mại |
| GET    | `/api/discounts/types` | Loại khuyến mại |
| POST   | `/api/discounts/validate` | Kiểm tra mã giảm giá |
| GET    | `/api/discounts/:id` | Chi tiết |
| PUT    | `/api/discounts/:id` | Cập nhật |
| PATCH  | `/api/discounts/:id/toggle` | Bật/tắt |
| DELETE | `/api/discounts/:id` | Xóa |

---

### Module 14 – Transactions `/api/transactions`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/transactions` | Danh sách thu chi |
| POST   | `/api/transactions` | Tạo phiếu thu/chi |
| GET    | `/api/transactions/summary` | Thống kê tồn quỹ |
| GET    | `/api/transactions/:id` | Chi tiết giao dịch |
| PUT    | `/api/transactions/:id` | Cập nhật |
| PATCH  | `/api/transactions/:id/status` | Duyệt / từ chối |
| DELETE | `/api/transactions/:id` | Hủy giao dịch |

---

### Module 15 – Shipments `/api/shipments`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/shipments` | Danh sách vận đơn |
| POST   | `/api/shipments` | Tạo vận đơn |
| GET    | `/api/shipments/statuses` | Trạng thái vận đơn |
| GET    | `/api/shipments/carriers` | Đơn vị vận chuyển |
| GET    | `/api/shipments/reports/dashboard` | Báo cáo vận chuyển |
| GET    | `/api/shipments/:id` | Chi tiết vận đơn |
| PUT    | `/api/shipments/:id` | Cập nhật vận đơn |
| PATCH  | `/api/shipments/:id/status` | Cập nhật trạng thái |
| DELETE | `/api/shipments/:id` | Xóa vận đơn |

---

### Module 16 – Reports `/api/reports`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reports/daily` | Báo cáo doanh thu theo ngày |
| GET | `/api/reports/actual-revenue` | Báo cáo thực thu |
| GET | `/api/reports/sold-products` | Sản phẩm đã bán |
| GET | `/api/reports/end-of-day` | Báo cáo cuối ngày |
| GET | `/api/reports/export` | Xuất báo cáo |

**Query params:** `from`, `to`, `staff_id`, `store_id`, `page`, `limit`

---

### Module 17 – POS `/api/pos`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/pos/checkout` | Thanh toán đơn POS |
| GET  | `/api/pos/products/search` | Tìm sản phẩm nhanh |
| GET  | `/api/pos/products/:variantId/price` | Giá & tồn kho variant |
| POST | `/api/pos/orders/draft` | Lưu đơn tạm |
| POST | `/api/pos/orders/draft/create-empty` | Tạo đơn tạm trống |
| GET  | `/api/pos/orders/drafts` | Danh sách đơn tạm |
| GET  | `/api/pos/orders/drafts/:id` | Chi tiết đơn tạm |
| PUT  | `/api/pos/orders/draft/:id` | Cập nhật đơn tạm |
| DELETE | `/api/pos/orders/draft/:id` | Xóa đơn tạm |
| GET  | `/api/pos/orders/:id/receipt` | Dữ liệu hóa đơn in |
| GET  | `/api/pos/discounts/active` | Mã giảm giá đang hoạt động |
| POST | `/api/pos/discounts/validate` | Kiểm tra mã giảm giá |
| GET  | `/api/pos/payment-methods` | Phương thức thanh toán |
| POST | `/api/pos/qr/generate` | Tạo mã QR (VietQR) |
| GET  | `/api/pos/qr/check-payment` | Kiểm tra trạng thái QR |
| POST | `/api/pos/webhook/sepay` | Webhook SePay (public) |

---

### Module 18 – Bank Accounts `/api/bank-accounts`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET    | `/api/bank-accounts` | Danh sách tài khoản NH |
| POST   | `/api/bank-accounts` | Thêm tài khoản NH |
| GET    | `/api/bank-accounts/:id` | Chi tiết tài khoản |
| PUT    | `/api/bank-accounts/:id` | Cập nhật |
| DELETE | `/api/bank-accounts/:id` | Xóa / Vô hiệu hóa |

---

### Module 19 – Checkouts `/api/checkouts`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET  | `/api/checkouts` | Danh sách đơn chưa hoàn tất |
| GET  | `/api/checkouts/stats` | Thống kê abandoned carts |
| GET  | `/api/checkouts/:id` | Chi tiết đơn |
| POST | `/api/checkouts/:id/send-payment-link` | Gửi link thanh toán |

---

### Module 20 – Chatbot `/api/chatbot`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/chatbot/message` | Gửi tin nhắn |
| GET  | `/api/chatbot/suggestions` | Gợi ý câu hỏi |
| GET  | `/api/chatbot/history` | Lịch sử chat |
| DELETE | `/api/chatbot/history` | Xóa lịch sử chat |

**Ví dụ câu hỏi chatbot:**
- `"Doanh thu hôm nay bao nhiêu?"`
- `"Sản phẩm nào sắp hết hàng?"`
- `"Top 5 sản phẩm bán chạy tuần này"`

---

### Module 21 – Search `/api/search`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/search?q=keyword&limit=5` | Tìm kiếm toàn cục |

Kết quả trả về: sản phẩm, khách hàng, đơn hàng phù hợp với từ khóa.

---

### Module 22 – Utilities

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/units` | Đơn vị tính |
| GET | `/api/stores` | Danh sách cửa hàng / kho |
| GET | `/api/transaction-types` | Loại giao dịch kho |
| GET | `/api/cashbook-types` | Loại phiếu thu chi |
| GET | `/api/payment-methods` | Phương thức thanh toán |

---

## 🗄 Database Schema

PostgreSQL database với **30+ bảng** chia thành các nhóm:

```
Core:       employees, roles, stores
Product:    products, product_variants, categories, brands, units
            product_images, catalogs
Inventory:  inventory_transactions, stock_levels
Order:      orders, order_items, order_return_items
Customer:   customers, customer_groups, cities
Financial:  cashbook_transactions, cashbook_types, payment_methods
Shipping:   shipments, shipment_status_history, carriers
Discount:   discounts, discount_usage
Banking:    bank_accounts
Chat:       chatbot_conversations
```

Schema đầy đủ: [`database/init/01_schema.sql`](database/init/01_schema.sql)

Tài liệu thiết kế: [`database/docs/SCHEMA_DESIGN.md`](database/docs/SCHEMA_DESIGN.md)

---

## 🔧 Môi trường & Biến cấu hình

File `.env` trong thư mục `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=supermarket_db
DB_USER=supermarket_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880   # 5MB

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 phút
RATE_LIMIT_MAX=100

# SePay Webhook (tùy chọn)
SEPAY_WEBHOOK_KEY=your_sepay_key
```

---

## 🔍 Troubleshooting

### Container không khởi động được

```bash
# Xem log chi tiết
docker compose logs backend
docker compose logs postgres

# Khởi động lại
docker compose down
docker compose up --build -d
```

### Lỗi database connection

```bash
# Kiểm tra PostgreSQL
docker compose exec postgres psql -U supermarket_user -d supermarket_db -c "\dt"

# Reset database (xóa sạch và tạo lại)
docker compose down -v
docker compose up --build -d
```

### Lỗi port đã được sử dụng

```bash
# Kiểm tra port đang chạy
netstat -ano | findstr :5000
netstat -ano | findstr :8080
```

### Xem logs real-time

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 📮 Test API với Postman

Import file [`supermarket.json`](supermarket.json) vào Postman:

1. Mở Postman → **Import** → chọn file `supermarket.json`
2. Đặt biến `baseUrl = http://localhost:5000/api`
3. Chạy request **1.1 Login** → token sẽ tự động lưu vào collection variable
4. Các request khác sẽ tự động dùng token này

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch feature: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả thay đổi"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### Quy tắc commit message

```
feat:     Tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật tài liệu
refactor: Tái cấu trúc code
test:     Thêm tests
chore:    Các thay đổi khác
```

---

## 📄 License

[MIT](LICENSE) © 2026 Supermarket Management System Team

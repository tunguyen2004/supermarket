# 🛒 Supermarket Management System# 🛒 Supermarket Management System



<p align="center">Hệ thống quản lý siêu thị mini - Dự án môn Mã nguồn mở

  <img src="https://img.shields.io/badge/version-2.1.0-blue.svg" alt="Version">

  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">## 🚀 Chạy dự án với Docker

  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node">

  <img src="https://img.shields.io/badge/vue-3.x-4FC08D.svg" alt="Vue">### Yêu cầu

  <img src="https://img.shields.io/badge/postgresql-14+-336791.svg" alt="PostgreSQL">- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt và đang chạy

</p>

### Bước 1: Clone dự án

Hệ thống quản lý siêu thị mini toàn diện với đầy đủ chức năng quản lý sản phẩm, đơn hàng, tồn kho, nhân viên và báo cáo thống kê.```bash

git clone https://github.com/tunguyen2004/supermarket.git

---cd supermarket

```

## 📑 Mục lục

### Bước 2: Chạy Docker Compose

- [Tổng quan](#-tổng-quan)```bash

- [Tính năng](#-tính-năng)docker-compose up -d --build

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)```

- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)

- [Cài đặt](#-cài-đặt)Đợi khoảng 1-2 phút để các services khởi động.

- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

- [API Documentation](#-api-documentation)### Bước 3: Truy cập

- [Database Schema](#-database-schema)

- [Troubleshooting](#-troubleshooting)| Service | URL | Mô tả |

- [Đóng góp](#-đóng-góp)|---------|-----|-------|

| Frontend | http://localhost:8080 | Giao diện web |

---| Backend API | http://localhost:5000 | REST API |

| CloudBeaver | http://localhost:8978 | Quản lý Database (DBeaver Web) |

## 🎯 Tổng quan

### Tài khoản đăng nhập

**Supermarket Management System** là một hệ thống quản lý siêu thị mini được phát triển với mục tiêu:

**Web/API:**

- 📦 Quản lý sản phẩm, danh mục và thương hiệu| Username | Password | Role |

- 🛒 Xử lý đơn hàng và thanh toán|----------|----------|------|

- 📊 Quản lý tồn kho đa kho hàng| admin | admin123 | Administrator |

- 👥 Quản lý nhân viên và phân quyền

- 📈 Báo cáo thống kê và phân tích doanh thu**CloudBeaver:** http://localhost:8978

- 🖼️ Quản lý hình ảnh sản phẩm| Email | Password |

|-------|----------|

---| admin@minimart.com | admin123 |



## ✨ Tính năng---



### 🔐 Module 1: Authentication## 📋 Kiểm tra trạng thái

- Đăng nhập / Đăng xuất

- JWT Token Authentication```bash

- Refresh Token# Xem các container đang chạy

- Phân quyền theo Role (Admin, Manager, Staff)docker-compose ps



### 👥 Module 2: Staff Management# Xem logs

- CRUD nhân viêndocker-compose logs -f

- Phân quyền theo vai trò

- Quản lý trạng thái hoạt động# Xem logs của service cụ thể

docker-compose logs -f backend

### 👤 Module 3: Profile Managementdocker-compose logs -f frontend

- Xem / Cập nhật thông tin cá nhân```

- Đổi mật khẩu

- Upload / Xóa avatar---



### 📦 Module 4: Product Management## 🛑 Dừng dự án

- CRUD sản phẩm

- Quản lý variants (biến thể)```bash

- Import / Export CSV# Dừng tất cả services

- Bật/tắt trạng thái hàng loạtdocker-compose down

- Quản lý thương hiệu và đơn vị tính

# Dừng và xóa cả database (reset data)

### 📁 Module 5: Collection (Category) Managementdocker-compose down -v

- CRUD danh mục sản phẩm```

- Cấu trúc cây phân cấp (Tree structure)

- Hỗ trợ danh mục cha-con---



### 📊 Module 6: Dashboard & Reports## 📚 API Documentation

- Tổng quan doanh thu

- Biểu đồ doanh thu theo thời gianXem chi tiết tại: [API_DOCS.md](./API_DOCS.md)

- Top sản phẩm bán chạy

- Top khách hàng### Tóm tắt API:

- Thống kê kênh bán hàng

- Cảnh báo sản phẩm sắp hết hàng| Module | Số API | Endpoint gốc |

|--------|--------|--------------|

### 💰 Module 7: Catalog (Price List)| Products (Module 4) | 10 | `/api/products` |

- Quản lý bảng giá| Collections (Module 5) | 6 | `/api/collections` |

- Cập nhật giá đơn lẻ / hàng loạt

- Export bảng giá CSV---



### 📦 Module 8: Inventory Management## 🔧 Troubleshooting

- Quản lý tồn kho đa cửa hàng

- Nhập kho từ nhà cung cấp### Lỗi port đã được sử dụng

- Chuyển kho giữa các chi nhánh```bash

- Trả hàng nhà cung cấp# Kiểm tra port

- Lịch sử xuất nhập khonetstat -ano | findstr :5000

netstat -ano | findstr :8080

### 🖼️ Module 9: Product Images

- Upload ảnh chính sản phẩm# Dừng process đang dùng port (thay PID)

- Gallery ảnh (tối đa 5 ảnh)taskkill /PID <PID> /F

- Đặt ảnh chính```

- Sắp xếp thứ tự ảnh

### Reset lại toàn bộ

### 🛒 Module 10: Order Management```bash

- Tạo đơn hàng mớidocker-compose down -v

- Xem chi tiết đơn hàngdocker-compose up -d --build

- Cập nhật trạng thái đơn hàng```

- Hủy đơn hàng

- Thống kê đơn hàng---



---## 👥 Nhóm phát triển



## 🛠️ Công nghệ sử dụng| Thành viên | Module |

|------------|--------|

### Backend| ... | Module 1-3: Auth, Profile, Staff |

| Công nghệ | Phiên bản | Mô tả || ... | Module 4-5: Products, Collections |

|-----------|-----------|-------|| ... | Module 6-7: ... |

| Node.js | >= 18.x | Runtime environment || ... | Module 8-9: ... |

| Express.js | 4.18.x | Web framework |

| PostgreSQL | 14+ | Database |---

| JWT | 9.x | Authentication |

| bcryptjs | 2.4.x | Password hashing |## 📁 Cấu trúc dự án

| Multer | 2.x | File upload |

| csv-parser | 3.x | CSV processing |```

supermarket/

### Frontend├── backend/                 # Node.js + Express API

| Công nghệ | Phiên bản | Mô tả |│   ├── src/

|-----------|-----------|-------|│   │   ├── config/         # Database config

| Vue.js | 3.x | Frontend framework |│   │   ├── middleware/     # Auth, Upload middleware

| Vue Router | 4.x | Routing |│   │   ├── routes/         # API routes

| Pinia | 3.x | State management |│   │   └── services/       # Business logic

| Element Plus | 2.x | UI Component library |│   ├── Dockerfile

| Tailwind CSS | 3.x | CSS framework |│   └── package.json

| Chart.js | 4.x | Charts & graphs |├── frontend/               # Vue.js 3 + Tailwind

| Axios | 1.x | HTTP client |│   ├── src/

| SweetAlert2 | 11.x | Popup alerts |│   ├── Dockerfile

│   └── package.json

### DevOps├── database/               # SQL scripts

| Công nghệ | Mô tả |│   ├── schema.sql

|-----------|-------|│   └── seed.sql

| Docker | Containerization |├── docker-compose.yml      # Docker orchestration

| Docker Compose | Multi-container orchestration |├── API_DOCS.md            # API documentation

| Nginx | Reverse proxy (Frontend) |└── README.md              # This file

| CloudBeaver | Database management (DBeaver Web) |```


---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                    (Web Browser)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vue.js 3)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │   Views   │  │Components │  │  Router   │  │   Store   │    │
│  │           │  │           │  │           │  │  (Pinia)  │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                         Port: 8080                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Routes   │  │ Services  │  │Middleware │  │  Config   │    │
│  │           │  │           │  │(Auth,CORS)│  │           │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                         Port: 5000                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Snowflake Schema                          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│  │  │  Fact   │  │   Dim   │  │ SubDim  │  │SubSubDim│      │  │
│  │  │ Tables  │  │ Tables  │  │ Tables  │  │ Tables  │      │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         Port: 5432                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cài đặt

### Yêu cầu hệ thống

- **Docker Desktop** >= 4.x
- **Git** >= 2.x
- **RAM** >= 4GB (khuyến nghị 8GB)
- **Disk** >= 5GB trống

### Cách 1: Chạy với Docker (Khuyến nghị)

```bash
# Clone repository
git clone https://github.com/tunguyen2004/supermarket.git
cd supermarket

# Chạy Docker Compose
docker-compose up -d --build

# Đợi 1-2 phút để services khởi động
```

### Cách 2: Chạy thủ công (Development)

```bash
# 1. Clone repository
git clone https://github.com/tunguyen2004/supermarket.git
cd supermarket

# 2. Chạy PostgreSQL bằng Docker
docker-compose up -d postgres

# 3. Cài đặt Backend
cd backend
npm install
cp .env.example .env
# Chỉnh sửa file .env với thông tin database
npm run dev

# 4. Cài đặt Frontend (Terminal mới)
cd frontend
npm install
npm run serve
```

### Truy cập hệ thống

| Service | URL | Mô tả |
|---------|-----|-------|
| 🖥️ Frontend | http://localhost:8080 | Giao diện web |
| ⚙️ Backend API | http://localhost:5000 | REST API |
| 🗄️ CloudBeaver | http://localhost:8978 | Quản lý Database (DBeaver Web) |

### Tài khoản mặc định

**Đăng nhập Web/API:**
| Username | Password | Role |
|----------|----------|------|
| `admin` | `1` | Administrator |

**CloudBeaver:** http://localhost:8978 (tạo admin password khi truy cập lần đầu)

---

## 📁 Cấu trúc thư mục

```
supermarket/
├── 📂 backend/                    # Backend API (Node.js/Express)
│   ├── 📂 src/
│   │   ├── 📂 config/             # Database configuration
│   │   │   └── database.js
│   │   ├── 📂 middleware/         # Express middlewares
│   │   │   ├── auth.js            # JWT authentication
│   │   │   ├── authorize.js       # Role-based authorization
│   │   │   └── upload.js          # File upload (Multer)
│   │   ├── 📂 routes/             # API routes
│   │   │   └── index.js
│   │   ├── 📂 services/           # Business logic
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── inventoryService.js
│   │   │   └── ...
│   │   └── index.js               # Entry point
│   ├── 📂 uploads/                # Uploaded files
│   │   ├── avatars/
│   │   └── products/
│   ├── Dockerfile
│   └── package.json
│
├── 📂 frontend/                   # Frontend (Vue.js 3)
│   ├── 📂 src/
│   │   ├── 📂 assets/             # Static assets
│   │   ├── 📂 components/         # Reusable components
│   │   ├── 📂 composables/        # Vue composables
│   │   ├── 📂 layouts/            # Page layouts
│   │   ├── 📂 router/             # Vue Router config
│   │   ├── 📂 services/           # API services
│   │   ├── 📂 store/              # Pinia stores
│   │   ├── 📂 views/              # Page components
│   │   │   ├── Account/
│   │   │   ├── DashboardOverview.vue
│   │   │   ├── Inventory/
│   │   │   ├── Orders/
│   │   │   ├── Product/
│   │   │   ├── Reports/
│   │   │   └── Users/
│   │   ├── App.vue
│   │   └── main.js
│   ├── 📂 Postman/                # Postman collections
│   │   └── supermarket.json
│   ├── Dockerfile
│   └── package.json
│
├── 📂 database/                   # Database scripts
│   ├── 📂 init/                   # Docker auto-init scripts
│   │   ├── 01_schema.sql          # DDL: tables, indexes, triggers, views
│   │   ├── 02_seed.sql            # DML: seed data
│   │   ├── 03_functions.sql       # Data generator functions
│   │   └── 04_catchup.sql         # Catchup data to today
│   ├── 📂 scripts/                # Backup, health check, reset
│   └── 📂 docs/                   # Schema design & data engineering guide
│
├── docker-compose.yml             # Docker orchestration
├── API.md                         # API documentation
├── DOCKER_GUIDE.md                # Docker guide
└── README.md                      # This file
```

---

## 📚 API Documentation

### Tổng quan API

Hệ thống cung cấp **67 REST APIs** được chia thành **10 modules**:

| Module | Số API | Endpoint gốc | Mô tả |
|--------|--------|--------------|-------|
| Authentication | 5 | `/api/auth` | Đăng nhập, đăng xuất, token |
| Staff | 6 | `/api/staff` | Quản lý nhân viên |
| Profile | 5 | `/api/users` | Thông tin cá nhân |
| Products | 10 | `/api/products` | Quản lý sản phẩm |
| Collections | 7 | `/api/collections` | Danh mục sản phẩm |
| Dashboard | 7 | `/api/dashboard` | Báo cáo, thống kê |
| Catalog | 5 | `/api/catalogs` | Bảng giá |
| Inventory | 9 | `/api/inventories` | Quản lý tồn kho |
| Product Images | 7 | `/api/products/:id/images` | Ảnh sản phẩm |
| Orders | 7 | `/api/orders` | Quản lý đơn hàng |

### Authentication

Tất cả API (trừ login) yêu cầu JWT token trong header:

```
Authorization: Bearer <your_token>
```

### Ví dụ Request

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "1"}'

# Get Products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>"
```

📖 **Xem chi tiết tại:** [API.md](./API.md)

### Postman Collection

Import file `frontend/Postman/supermarket.json` vào Postman để test API.

---

## 🗄️ Database Schema

Database sử dụng **Snowflake Schema** với các bảng chính:

### Sub-Sub Dimensions (Level 3)
- `subdim_regions` - Vùng miền

### Sub-Dimensions (Level 2)
- `subdim_cities` - Thành phố
- `subdim_categories` - Danh mục (cấu trúc cây)
- `subdim_brands` - Thương hiệu
- `subdim_units` - Đơn vị tính
- `subdim_customer_groups` - Nhóm khách hàng
- `subdim_store_types` - Loại cửa hàng
- `subdim_transaction_types` - Loại giao dịch kho
- `subdim_roles` - Vai trò người dùng
- `subdim_permissions` - Quyền hạn

### Dimensions (Level 1)
- `dim_time` - Thời gian
- `dim_stores` - Cửa hàng
- `dim_suppliers` - Nhà cung cấp
- `dim_customers` - Khách hàng
- `dim_products` - Sản phẩm
- `dim_product_variants` - Biến thể sản phẩm
- `dim_users` - Người dùng hệ thống

### Fact Tables
- `fact_orders` - Đơn hàng
- `fact_order_details` - Chi tiết đơn hàng
- `fact_inventory_stocks` - Tồn kho
- `fact_inventory_transactions` - Giao dịch kho

---

## 🔧 Troubleshooting

### Docker Commands

```bash
# Xem trạng thái containers
docker-compose ps

# Xem logs tất cả services
docker-compose logs -f

# Xem logs service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Dừng tất cả services
docker-compose down

# Dừng và xóa data (reset)
docker-compose down -v

# Rebuild và chạy lại
docker-compose up -d --build
```

### Lỗi thường gặp

#### Lỗi port đã sử dụng

```bash
# Windows - Kiểm tra port
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Dừng process (thay <PID>)
taskkill /PID <PID> /F
```

#### Reset database

```bash
docker-compose down -v
docker-compose up -d --build
```

#### Lỗi kết nối database

```bash
# Kiểm tra postgres container
docker-compose logs postgres

# Kết nối trực tiếp vào postgres
docker exec -it minimart_postgres psql -U admin -d minimart_db
```

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📄 License

Dự án được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---

## 👨‍💻 Tác giả

**Tú Nguyễn** - [tunguyen2004](https://github.com/tunguyen2004)

---

## 📞 Liên hệ

- **GitHub:** https://github.com/tunguyen2004/supermarket
- **Issues:** https://github.com/tunguyen2004/supermarket/issues

---

<p align="center">
  <b>⭐ Nếu dự án hữu ích, hãy cho một star trên GitHub! ⭐</b>
</p>

---

**Created:** 19/01/2026  
**Updated:** 28/01/2026  
**Version:** 2.1.0

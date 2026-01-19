# 📚 API Documentation - Module 4 & 5
## Quản lý Sản phẩm (Products) & Danh mục (Collections)

**Thực hiện bởi:** [Tên của bạn]  
**Ngày cập nhật:** 19/01/2026

---

## 🔗 Base URL
```
http://localhost:5000/api
```

---

## 🚀 Hướng dẫn Test với Postman

### Bước 1: Cài đặt Postman
1. Tải Postman tại: https://www.postman.com/downloads/
2. Cài đặt và mở Postman

### Bước 2: Tạo Collection mới
1. Click **Collections** ở sidebar trái
2. Click **+ New Collection**
3. Đặt tên: `Supermarket API - Module 4 & 5`

### Bước 3: Đăng nhập lấy Token (BẮT BUỘC)
1. Click **+ Add request** trong Collection
2. Đặt tên: `Login`
3. Cấu hình:
   - **Method:** `POST`
   - **URL:** `http://localhost:5000/api/auth/login`
   - Tab **Body** → chọn **raw** → chọn **JSON**
   - Nhập:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Click **Send**
5. **COPY token** từ response (phần `"token": "eyJ..."`)

### Bước 4: Thiết lập Authorization cho Collection
1. Click vào tên Collection `Supermarket API - Module 4 & 5`
2. Tab **Authorization**
3. Chọn **Type:** `Bearer Token`
4. Paste token vào ô **Token**
5. Click **Save**

> ⚠️ **Lưu ý:** Mọi request trong Collection sẽ tự động dùng token này!

---

## 📋 Mục Lục

1. [Products (Module 4)](#1-products-module-4) - 10 APIs
2. [Collections (Module 5)](#2-collections-module-5) - 6 APIs

---

## 1. Products (Module 4)

### 1.1 Danh sách sản phẩm
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products`

**Query Parameters (tuỳ chọn):**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| search | string | Tìm theo tên hoặc mã | `?search=sữa` |
| category_id | number | Lọc theo danh mục | `?category_id=1` |
| brand_id | number | Lọc theo thương hiệu | `?brand_id=1` |
| is_active | boolean | Lọc theo trạng thái | `?is_active=true` |
| page | number | Trang (default: 1) | `?page=2` |
| limit | number | Số lượng/trang | `?limit=20` |

**Cách thêm Query Params trong Postman:**
1. Tab **Params**
2. Thêm Key-Value (ví dụ: `search` = `sữa`)

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "code": "MILK001",
        "name": "Sữa tươi Vinamilk",
        "category_name": "Thực phẩm",
        "brand_name": "Vinamilk",
        "unit_name": "Cái",
        "is_active": true,
        "price": "15000.00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "totalPages": 1
    }
  },
  "message": "Lấy danh sách sản phẩm thành công"
}
```

---

### 1.2 Thêm sản phẩm
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/products`
- Tab **Body** → **raw** → **JSON**

**Body mẫu:**
```json
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

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "product": { "id": 7, "code": "MILK002", "name": "Sữa chua Vinamilk" },
    "variant": { "id": 7, "sku": "MILK002-SKU" }
  },
  "message": "Thêm sản phẩm thành công"
}
```

---

### 1.3 Chi tiết sản phẩm
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products/1` (thay `1` bằng ID sản phẩm)

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "MILK001",
    "name": "Sữa tươi Vinamilk",
    "category_name": "Thực phẩm",
    "brand_name": "Vinamilk",
    "unit_name": "Cái",
    "variants": [
      {
        "id": 1,
        "sku": "MILK001-SKU",
        "barcode": "8934567890123",
        "selling_price": "15000.00"
      }
    ]
  }
}
```

---

### 1.4 Sửa sản phẩm
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/products/1` (thay `1` bằng ID)
- Tab **Body** → **raw** → **JSON**

**Body mẫu:**
```json
{
  "name": "Sữa tươi Vinamilk 1L",
  "description": "Sữa tươi tiệt trùng 1 lít",
  "is_active": true
}
```

---

### 1.5 Xóa sản phẩm
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/products/7` (thay `7` bằng ID cần xóa)

**Response mẫu:**
```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

---

### 1.6 Bật/tắt trạng thái hàng loạt
**Postman Setup:**
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/products/bulk-status`
- Tab **Body** → **raw** → **JSON**

**Body mẫu:**
```json
{
  "product_ids": [1, 2, 3],
  "is_active": false
}
```

**Response mẫu:**
```json
{
  "success": true,
  "data": { "updated_count": 3 },
  "message": "Cập nhật trạng thái 3 sản phẩm thành công"
}
```

---

### 1.7 Export CSV
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products/export`

**Response:** File CSV tự động download

**Lưu file trong Postman:**
1. Click **Send and Download**
2. Chọn nơi lưu file

---

### 1.8 Import CSV
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/products/import`
- Tab **Body** → chọn **form-data**
- Thêm Key: `file` | Type: **File** | Value: chọn file CSV

**Định dạng file CSV:**
```csv
code,name,category_code,brand_code,unit_code,description,sku,barcode,cost_price,selling_price
SNACK001,Bánh Oreo,FOOD,MONDELEZ,PCS,Bánh quy Oreo 133g,SNACK001-SKU,8934567890111,15000,22000
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "success": 3,
    "errors": 0,
    "errorDetails": []
  },
  "message": "Import hoàn tất: 3 thành công, 0 lỗi"
}
```

---

### 1.9 Danh sách thương hiệu
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/brands`

---

### 1.10 Danh sách đơn vị tính
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/units`

---

## 2. Collections (Module 5)

### 2.1 Danh sách danh mục
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections`

**Query Parameters (tuỳ chọn):**
| Param | Type | Mô tả |
|-------|------|-------|
| search | string | Tìm theo tên hoặc mã |
| parent_id | number | Lọc theo danh mục cha |

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": 1,
        "code": "FOOD",
        "name": "Thực phẩm",
        "parent_id": null,
        "level": 0,
        "product_count": "3"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2
    }
  }
}
```

---

### 2.2 Cây danh mục (Tree)
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections/tree`

**Response mẫu:**
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

### 2.3 Thêm danh mục
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/collections`
- Tab **Body** → **raw** → **JSON**

**Body mẫu:**
```json
{
  "code": "SNACK",
  "name": "Bánh kẹo",
  "parent_id": null
}
```

Hoặc tạo danh mục con:
```json
{
  "code": "CANDY",
  "name": "Kẹo",
  "parent_id": 3
}
```

---

### 2.4 Chi tiết danh mục
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections/1`

---

### 2.5 Sửa danh mục
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/collections/1`
- Tab **Body** → **raw** → **JSON**

**Body mẫu:**
```json
{
  "name": "Thực phẩm & Đồ uống",
  "parent_id": null
}
```

---

### 2.6 Xóa danh mục
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/collections/3`

> ⚠️ **Lưu ý:** Không thể xóa danh mục đang có sản phẩm hoặc có danh mục con!

---

## 📊 Tổng kết API

| STT | Module | API | Method | Endpoint |
|-----|--------|-----|--------|----------|
| 1 | Products | Danh sách | GET | `/api/products` |
| 2 | Products | Thêm mới | POST | `/api/products` |
| 3 | Products | Chi tiết | GET | `/api/products/:id` |
| 4 | Products | Sửa | PUT | `/api/products/:id` |
| 5 | Products | Xóa | DELETE | `/api/products/:id` |
| 6 | Products | Bulk Status | PATCH | `/api/products/bulk-status` |
| 7 | Products | Export CSV | GET | `/api/products/export` |
| 8 | Products | Import CSV | POST | `/api/products/import` |
| 9 | Products | DS Thương hiệu | GET | `/api/brands` |
| 10 | Products | DS Đơn vị | GET | `/api/units` |
| 11 | Collections | Danh sách | GET | `/api/collections` |
| 12 | Collections | Cây danh mục | GET | `/api/collections/tree` |
| 13 | Collections | Thêm mới | POST | `/api/collections` |
| 14 | Collections | Chi tiết | GET | `/api/collections/:id` |
| 15 | Collections | Sửa | PUT | `/api/collections/:id` |
| 16 | Collections | Xóa | DELETE | `/api/collections/:id` |

---

## 👤 Tài khoản test

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |

---

## 🐳 Chạy dự án

### Cách 1: Chạy với Docker (Khuyến nghị)
```bash
git clone <repo-url>
cd supermarket
docker-compose up -d --build
```

### Cách 2: Chạy thủ công
```bash
# Terminal 1 - Database
docker-compose up -d postgres

# Terminal 2 - Backend
cd backend
npm install
cp .env.example .env
npm start

# Terminal 3 - Frontend (nếu cần)
cd frontend
npm install
npm run serve
```

### Truy cập
- Backend API: http://localhost:5000
- Frontend: http://localhost:8080
- pgAdmin: http://localhost:5050 (admin@minimart.com / admin123)

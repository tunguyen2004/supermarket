# 📚 API Documentation - Supermarket Management System

**Cập nhật:** 01/02/2026  
**Version:** 3.0.0 - Complete API (129 APIs, 21 Modules)

---

## 🔗 Base URL
```
http://localhost:5000/api
```

---

## 🔐 Tài khoản Test

| Field | Giá trị |
|-------|--------|
| **Username** | `admin` |
| **Password** | `1` hoặc `admin123` |
| **Token** | Lấy từ endpoint `/api/auth/login` |

---

## 🚀 Hướng dẫn Test với Postman

### Bước 1: Cài đặt Postman
1. Tải Postman tại: https://www.postman.com/downloads/
2. Cài đặt và mở Postman

### Bước 2: Tạo Collection mới
1. Click **Collections** ở sidebar trái
2. Click **+ New Collection**
3. Đặt tên: `Supermarket API Complete`

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
     "password": "1"
   }
   ```
4. Click **Send**
5. **COPY token** từ response (phần `"token": "eyJ..."`)

### Bước 4: Thiết lập Authorization cho Collection
1. Click vào tên Collection `Supermarket API Complete`
2. Tab **Authorization**
3. Chọn **Type:** `Bearer Token`
4. Paste token vào ô **Token**
5. Click **Save**

> ⚠️ **Lưu ý:** Mọi request trong Collection sẽ tự động dùng token này!

---

## 📋 Mục Lục

1. [Module 1: Authentication](#module-1-authentication) - 4 APIs
2. [Module 2: Staff Management](#module-2-staff-management) - 6 APIs
3. [Module 3: Profile Management](#module-3-profile-management) - 5 APIs
4. [Module 4: Products](#module-4-products) - 10 APIs
5. [Module 5: Collections](#module-5-collections) - 6 APIs
6. [Module 6: Dashboard](#module-6-dashboard) - 7 APIs
7. [Module 7: Catalog (Bảng giá)](#module-7-catalog-bảng-giá) - 5 APIs
8. [Module 8: Inventory (Tồn kho)](#module-8-inventory-quản-lý-tồn-kho) - 9 APIs
9. [Module 9: Product Images (Ảnh sản phẩm)](#module-9-product-images-ảnh-sản-phẩm) - 7 APIs
10. [Module 10: Orders](#module-10-orders) - 7 APIs
11. [Module 11: Customers](#module-11-customers) - 8 APIs
12. [Module 12: Suppliers](#module-12-suppliers) - 5 APIs
13. [Module 13: Discounts](#module-13-discounts) - 8 APIs
14. [Module 14: Transactions](#module-14-transactions) - 7 APIs
15. [Module 15: Shipments](#module-15-shipments) - 8 APIs
16. [Module 16: Order Returns](#module-16-order-returns) - 4 APIs
17. [Module 17: Staff Reports](#module-17-staff-reports) - 5 APIs
18. [Module 18: Inventory Lookup](#module-18-inventory-lookup) - 2 APIs
19. [Module 19: POS Payment](#module-19-pos-payment) - 10 APIs
20. [Module 20: Bank Accounts](#module-20-bank-accounts) - 5 APIs
21. [Module 21: Checkouts](#module-21-checkouts) - 4 APIs

---

## Module 1: Authentication

### 1.1 Đăng nhập
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "username": "admin",
  "password": "1"
}
```

**Response (Success - 200):**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 Đăng xuất
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/logout`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Logout successful",
  "note": "User status has been set to offline"
}
```

---

### 1.3 Refresh Token
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/refresh`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "wasExpired": false
  }
}
```

---

### 1.4 Lấy danh sách Roles
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/auth/roles`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Roles retrieved successfully",
  "data": {
    "roles": {
      "1": {
        "id": 1,
        "code": "ADMIN",
        "name": "Admin",
        "description": "Toàn quyền quản lý hệ thống",
        "permissions": ["manage_staff", "manage_products", "manage_categories", "manage_orders", "view_reports", "manage_settings"]
      },
      "2": {
        "id": 2,
        "code": "STAFF",
        "name": "Staff",
        "description": "Nhân viên thường - quyền cơ bản",
        "permissions": ["view_products", "view_categories", "create_orders", "view_own_orders"]
      },
      "3": {
        "id": 3,
        "code": "MANAGER",
        "name": "Manager",
        "description": "Quản lý cấp trung",
        "permissions": ["manage_products", "manage_categories", "manage_orders", "view_reports"]
      }
    },
    "roleList": [...]
  }
}
```

---

## Module 2: Staff Management

### 2.1 Danh sách nhân viên
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/staff?limit=10&offset=0`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| limit | number | Số bản ghi mỗi trang (default: 10) | `?limit=20` |
| offset | number | Bắt đầu từ bản ghi số mấy (default: 0) | `?offset=10` |

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff list retrieved successfully",
  "data": [
    {
      "id": 2,
      "username": "staff1",
      "email": "staff1@supermarket.com",
      "full_name": "Staff Member 1",
      "phone": "0912345678",
      "avatar_url": "/uploads/avatars/avatar-2-1737450000000-123456789.jpg",
      "is_active": true,
      "created_at": "2026-01-19T10:30:00.000Z",
      "role_id": 2,
      "role_name": "Staff"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "pages": 1
  }
}
```

---

### 2.2 Thêm nhân viên
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/staff`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "username": "staff1",
  "email": "staff1@supermarket.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "password": "password123",
  "role_id": 2
}
```

**Lưu ý:**
- `username`: Duy nhất, không trùng
- `email`: Duy nhất, không trùng
- `password`: Tối thiểu 6 ký tự
- `role_id`: 1=Admin, 2=Staff, 3=Manager

**Response (Success - 201):**
```json
{
  "status": "OK",
  "message": "Staff added successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "is_active": true,
    "created_at": "2026-01-19T11:00:00.000Z"
  }
}
```

---

### 2.3 Chi tiết nhân viên
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/staff/2` (thay `2` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff detail retrieved successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "avatar_url": "/uploads/avatars/avatar-2-1737450000000-123456789.jpg",
    "is_active": true,
    "created_at": "2026-01-19T11:00:00.000Z",
    "role_id": 2,
    "role_name": "Staff"
  }
}
```

---

### 2.4 Cập nhật nhân viên (bao gồm phân quyền)
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/staff/2` (thay `2` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn B",
  "phone": "0987654321",
  "role_id": 3
}
```

**Lưu ý:**
- `role_id` là **optional**, nếu không truyền sẽ giữ nguyên role hiện tại
- Các role_id: 1=Admin, 2=Staff, 3=Manager

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff updated successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn B",
    "phone": "0987654321",
    "role_id": 3,
    "is_active": true,
    "role_name": "Manager"
  }
}
```

---

### 2.5 Xóa nhân viên
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/staff/2` (thay `2` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff deleted successfully"
}
```

---

### 2.6 Phân quyền nhân viên (API riêng)
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/staff/2/role` (thay `2` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "role_id": 3
}
```

**Các role_id có sẵn:**
- `1` = Admin
- `2` = Staff
- `3` = Manager

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Staff role updated successfully",
  "data": {
    "id": 2,
    "username": "staff1",
    "email": "staff1@supermarket.com",
    "full_name": "Nguyễn Văn B",
    "role_id": 3,
    "is_active": true
  }
}
```

---

## Module 3: Profile Management

### 3.1 Xem Profile
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/users/profile`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Administrator",
    "phone": "0987654321",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "avatar_url": "/uploads/avatars/avatar-1-1737450000000-123456789.jpg",
    "role_id": 1,
    "role_name": "Admin",
    "is_active": true,
    "created_at": "2026-01-19T10:30:00.000Z"
  }
}
```

---

### 3.2 Cập nhật Profile
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/users/profile`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "full_name": "Admin Supermarket",
  "phone": "0987654321",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Lưu ý:**
- `full_name`: **Bắt buộc**
- `phone`: Optional
- `date_of_birth`: Optional, định dạng `YYYY-MM-DD`
- `gender`: Optional, chỉ chấp nhận: `male`, `female`, `other`
- `address`: Optional

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@supermarket.com",
    "full_name": "Admin Supermarket",
    "phone": "0987654321",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "avatar_url": "/uploads/avatars/avatar-1-1737450000000-123456789.jpg",
    "is_active": true
  }
}
```

---

### 3.3 Đổi Mật Khẩu
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/users/change-password`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "oldPassword": "1",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Password changed successfully"
}
```

---

### 3.4 Upload Avatar
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/users/avatar`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **form-data**
- Thêm key: `avatar` | Type: `File` | Chọn file ảnh

**Lưu ý:**
- Chỉ chấp nhận file ảnh: **JPG, PNG, GIF, WEBP**
- Kích thước tối đa: **5MB**
- Avatar cũ sẽ tự động bị xóa khi upload avatar mới

**Request (Form Data):**
| Key | Type | Value |
|-----|------|-------|
| avatar | File | Chọn file ảnh |

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "/uploads/avatars/avatar-1-1737450000000-123456789.jpg",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@supermarket.com",
      "full_name": "Administrator",
      "avatar_url": "/uploads/avatars/avatar-1-1737450000000-123456789.jpg"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "status": "ERROR",
  "message": "No file uploaded. Please select an image file (JPG, PNG, GIF, WEBP)"
}
```

**Response (Error - 400 - File không hợp lệ):**
```json
{
  "success": false,
  "message": "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)"
}
```

---

### 3.5 Xóa Avatar
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/users/avatar`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "Avatar deleted successfully"
}
```

---

## Module 4: Products

### 4.1 Danh sách sản phẩm
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| search | string | Tìm theo tên hoặc mã | `?search=sữa` |
| category_id | number | Lọc theo danh mục | `?category_id=1` |
| brand_id | number | Lọc theo thương hiệu | `?brand_id=1` |
| is_active | boolean | Lọc theo trạng thái | `?is_active=true` |
| page | number | Trang (default: 1) | `?page=2` |
| limit | number | Số lượng/trang | `?limit=20` |

**Response (Success - 200):**
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

### 4.2 Thêm sản phẩm
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/products`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
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

**Response (Success - 201):**
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

### 4.3 Chi tiết sản phẩm
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
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

### 4.4 Sửa sản phẩm
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/products/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "name": "Sữa tươi Vinamilk 1L",
  "description": "Sữa tươi tiệt trùng 1 lít",
  "is_active": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cập nhật sản phẩm thành công"
}
```

---

### 4.5 Xóa sản phẩm
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/products/7` (thay `7` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

---

### 4.6 Bật/tắt trạng thái hàng loạt
**Postman Setup:**
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/products/bulk-status`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "product_ids": [1, 2, 3],
  "is_active": false
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": { "updated_count": 3 },
  "message": "Cập nhật trạng thái 3 sản phẩm thành công"
}
```

---

### 4.7 Export CSV
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/products/export`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response:** File CSV tự động download

---

### 4.8 Import CSV
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/products/import`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → chọn **form-data**
- Thêm Key: `file` | Type: **File** | Value: chọn file CSV

**Định dạng file CSV:**
```csv
code,name,category_code,brand_code,unit_code,description,sku,barcode,cost_price,selling_price
SNACK001,Bánh Oreo,FOOD,MONDELEZ,PCS,Bánh quy Oreo 133g,SNACK001-SKU,8934567890111,15000,22000
```

**Response (Success - 200):**
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

### 4.9 Danh sách thương hiệu
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/brands`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "VINAMILK", "name": "Vinamilk" },
    { "id": 2, "code": "KIELBASA", "name": "Kielbasa" }
  ]
}
```

---

### 4.10 Danh sách đơn vị tính
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/units`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "PCS", "name": "Cái" },
    { "id": 2, "code": "KG", "name": "Kilogram" },
    { "id": 3, "code": "L", "name": "Lít" }
  ]
}
```

---

## Module 5: Collections

### 5.1 Danh sách danh mục
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| search | string | Tìm theo tên hoặc mã | `?search=thực phẩm` |
| parent_id | number | Lọc theo danh mục cha | `?parent_id=1` |
| page | number | Trang (default: 1) | `?page=1` |
| limit | number | Số lượng/trang | `?limit=50` |

**Response (Success - 200):**
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

### 5.2 Cây danh mục (Tree View)
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections/tree`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
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

### 5.3 Thêm danh mục
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/collections`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body - Danh mục cấp 1:**
```json
{
  "code": "SNACK",
  "name": "Bánh kẹo",
  "parent_id": null
}
```

**Request Body - Danh mục con:**
```json
{
  "code": "CANDY",
  "name": "Kẹo",
  "parent_id": 3
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Thêm danh mục thành công"
}
```

---

### 5.4 Chi tiết danh mục
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/collections/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "FOOD",
    "name": "Thực phẩm",
    "parent_id": null,
    "level": 0,
    "product_count": "3"
  }
}
```

---

### 5.5 Sửa danh mục
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/collections/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "name": "Thực phẩm & Đồ uống",
  "parent_id": null
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cập nhật danh mục thành công"
}
```

---

### 5.6 Xóa danh mục
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/collections/3` (thay `3` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Xóa danh mục thành công"
}
```

> ⚠️ **Lưu ý:** Không thể xóa danh mục nếu nó đang có sản phẩm hoặc có danh mục con!

---

## Module 6: Dashboard

### 6.1 Dashboard Overview
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/overview`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 156,
    "totalProducts": 42,
    "totalCustomers": 89,
    "recentOrders": [
      {
        "id": 10,
        "order_code": "ORD-2026-010",
        "customer_name": "Lê Thị Hương",
        "total_amount": 280000,
        "status": "completed",
        "created_at": "2026-01-23T16:00:00.000Z"
      }
    ]
  }
}
```

---

### 6.2 Dashboard Stats
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/stats?from=2026-01-01&to=2026-01-24`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| from | date | Ngày bắt đầu (YYYY-MM-DD) | `?from=2026-01-01` |
| to | date | Ngày kết thúc (YYYY-MM-DD) | `?to=2026-01-24` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "current": 15680000,
      "previous": 12500000,
      "change": 25.44
    },
    "orders": {
      "current": 156,
      "previous": 132,
      "change": 18.18
    },
    "newCustomers": {
      "current": 23,
      "previous": 18,
      "change": 27.78
    },
    "avgOrderValue": {
      "current": 100512,
      "previous": 94696,
      "change": 6.14
    }
  }
}
```

---

### 6.3 Revenue Chart
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/revenue-chart?from=2026-01-01&to=2026-01-24&groupBy=day`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| from | date | Ngày bắt đầu (YYYY-MM-DD) | `?from=2026-01-01` |
| to | date | Ngày kết thúc (YYYY-MM-DD) | `?to=2026-01-24` |
| groupBy | string | Nhóm theo: day, week, month | `?groupBy=day` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "labels": ["01/01", "02/01", "03/01", "04/01", "05/01"],
    "datasets": [
      {
        "label": "Doanh thu",
        "data": [850000, 1200000, 980000, 1500000, 1100000]
      },
      {
        "label": "Đơn hàng",
        "data": [12, 18, 15, 22, 17]
      }
    ],
    "summary": {
      "totalRevenue": 5630000,
      "totalOrders": 84,
      "avgDaily": 1126000
    }
  }
}
```

---

### 6.4 Top Products
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/top-products?limit=5&from=2026-01-01&to=2026-01-24`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| limit | number | Số lượng sản phẩm (default: 5) | `?limit=10` |
| from | date | Ngày bắt đầu (YYYY-MM-DD) | `?from=2026-01-01` |
| to | date | Ngày kết thúc (YYYY-MM-DD) | `?to=2026-01-24` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sữa tươi Vinamilk 1L",
      "code": "MILK001",
      "totalSold": 245,
      "revenue": 7350000,
      "image_url": null
    },
    {
      "id": 3,
      "name": "Nước ngọt Coca Cola 330ml",
      "code": "DRINK001",
      "totalSold": 189,
      "revenue": 1890000,
      "image_url": null
    }
  ]
}
```

---

### 6.5 Sales Channels
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/sales-channels?from=2026-01-01&to=2026-01-24`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| from | date | Ngày bắt đầu (YYYY-MM-DD) | `?from=2026-01-01` |
| to | date | Ngày kết thúc (YYYY-MM-DD) | `?to=2026-01-24` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "channel": "POS",
      "orders": 98,
      "revenue": 9800000,
      "percentage": 62.5
    },
    {
      "channel": "Online",
      "orders": 58,
      "revenue": 5880000,
      "percentage": 37.5
    }
  ]
}
```

---

### 6.6 Top Customers
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/top-customers?limit=5&from=2026-01-01&to=2026-01-24`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| limit | number | Số lượng khách hàng (default: 5) | `?limit=10` |
| from | date | Ngày bắt đầu (YYYY-MM-DD) | `?from=2026-01-01` |
| to | date | Ngày kết thúc (YYYY-MM-DD) | `?to=2026-01-24` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn An",
      "phone": "0901234567",
      "totalOrders": 12,
      "totalSpent": 2580000,
      "lastOrder": "2026-01-23T14:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Trần Thị Bình",
      "phone": "0912345678",
      "totalOrders": 9,
      "totalSpent": 1950000,
      "lastOrder": "2026-01-22T10:15:00.000Z"
    }
  ]
}
```

---

### 6.7 Low Stock Products
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/dashboard/low-stock?threshold=20&limit=10`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| threshold | number | Ngưỡng tồn kho thấp (default: 20) | `?threshold=15` |
| limit | number | Số lượng sản phẩm (default: 10) | `?limit=20` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Dầu ăn Neptune 1L",
      "code": "OIL001",
      "currentStock": 8,
      "threshold": 20,
      "status": "critical"
    },
    {
      "id": 8,
      "name": "Gạo ST25 5kg",
      "code": "RICE001",
      "currentStock": 15,
      "threshold": 20,
      "status": "warning"
    }
  ]
}
```

---

## 📊 Tổng kết API

| STT | Module | API | Method | Endpoint |
|-----|--------|-----|--------|----------|
| 1 | Auth | Đăng nhập | POST | `/api/auth/login` |
| 2 | Auth | Lấy thông tin user | GET | `/api/auth/me` |
| 3 | Auth | Đăng xuất | POST | `/api/auth/logout` |
| 4 | Auth | Refresh token | POST | `/api/auth/refresh` |
| 5 | Staff | Danh sách | GET | `/api/staff` |
| 6 | Staff | Thêm mới | POST | `/api/staff` |
| 7 | Staff | Chi tiết | GET | `/api/staff/:id` |
| 8 | Staff | Cập nhật | PUT | `/api/staff/:id` |
| 9 | Staff | Xóa | DELETE | `/api/staff/:id` |
| 10 | Staff | Phân quyền | PUT | `/api/staff/:id/role` |
| 11 | Profile | Xem profile | GET | `/api/users/profile` |
| 12 | Profile | Cập nhật profile | PUT | `/api/users/profile` |
| 13 | Profile | Đổi mật khẩu | PUT | `/api/users/change-password` |
| 14 | Profile | Upload avatar | POST | `/api/users/avatar` |
| 15 | Profile | Xóa avatar | DELETE | `/api/users/avatar` |
| 16 | Products | Danh sách | GET | `/api/products` |
| 17 | Products | Thêm mới | POST | `/api/products` |
| 18 | Products | Chi tiết | GET | `/api/products/:id` |
| 19 | Products | Sửa | PUT | `/api/products/:id` |
| 20 | Products | Xóa | DELETE | `/api/products/:id` |
| 21 | Products | Bulk status | PATCH | `/api/products/bulk-status` |
| 22 | Products | Export CSV | GET | `/api/products/export` |
| 23 | Products | Import CSV | POST | `/api/products/import` |
| 24 | Products | DS Thương hiệu | GET | `/api/brands` |
| 25 | Products | DS Đơn vị | GET | `/api/units` |
| 26 | Collections | Danh sách | GET | `/api/collections` |
| 27 | Collections | Cây danh mục | GET | `/api/collections/tree` |
| 28 | Collections | Thêm mới | POST | `/api/collections` |
| 29 | Collections | Chi tiết | GET | `/api/collections/:id` |
| 30 | Collections | Sửa | PUT | `/api/collections/:id` |
| 31 | Collections | Xóa | DELETE | `/api/collections/:id` |
| 32 | Dashboard | Overview | GET | `/api/dashboard/overview` |
| 33 | Dashboard | Stats | GET | `/api/dashboard/stats` |
| 34 | Dashboard | Revenue Chart | GET | `/api/dashboard/revenue-chart` |
| 35 | Dashboard | Top Products | GET | `/api/dashboard/top-products` |
| 36 | Dashboard | Sales Channels | GET | `/api/dashboard/sales-channels` |
| 37 | Dashboard | Top Customers | GET | `/api/dashboard/top-customers` |
| 38 | Dashboard | Low Stock | GET | `/api/dashboard/low-stock` |

---

## 📖 Complete Test Flow

### Flow 1: Authentication
```
1. POST /api/auth/login → Lấy token
2. GET /api/auth/me → Kiểm tra login
3. POST /api/auth/logout → Đăng xuất
```

### Flow 2: Staff Management
```
1. GET /api/staff → Lấy danh sách
2. POST /api/staff → Thêm mới
3. GET /api/staff/2 → Chi tiết
4. PUT /api/staff/2 → Cập nhật
5. PUT /api/staff/2/role → Phân quyền
6. DELETE /api/staff/2 → Xóa
```

### Flow 3: Profile Management
```
1. GET /api/users/profile → Xem
2. PUT /api/users/profile → Cập nhật
3. PUT /api/users/change-password → Đổi mật khẩu
```

### Flow 4: Product Management
```
1. GET /api/products → Danh sách
2. POST /api/products → Thêm mới
3. GET /api/products/1 → Chi tiết
4. PUT /api/products/1 → Sửa
5. PATCH /api/products/bulk-status → Bulk status
6. POST /api/products/import → Import CSV
7. GET /api/products/export → Export CSV
8. DELETE /api/products/1 → Xóa
```

### Flow 5: Collection Management
```
1. GET /api/collections → Danh sách
2. GET /api/collections/tree → Cây danh mục
3. POST /api/collections → Thêm mới
4. GET /api/collections/1 → Chi tiết
5. PUT /api/collections/1 → Sửa
6. DELETE /api/collections/1 → Xóa
```

### Flow 6: Dashboard & Reports
```
1. GET /api/dashboard/overview → Tổng quan
2. GET /api/dashboard/stats?from=2026-01-01&to=2026-01-24 → Thống kê
3. GET /api/dashboard/revenue-chart?from=2026-01-01&to=2026-01-24&groupBy=day → Biểu đồ doanh thu
4. GET /api/dashboard/top-products?limit=5 → Top sản phẩm bán chạy
5. GET /api/dashboard/sales-channels → Kênh bán hàng
6. GET /api/dashboard/top-customers?limit=5 → Top khách hàng
7. GET /api/dashboard/low-stock?threshold=20 → Sản phẩm sắp hết hàng
```

### Flow 7: Catalog (Bảng giá)
```
1. GET /api/catalogs → Danh sách bảng giá
2. GET /api/catalogs/1 → Chi tiết giá sản phẩm
3. PUT /api/catalogs/1 → Cập nhật giá
4. PATCH /api/catalogs/bulk-update → Cập nhật giá hàng loạt
5. GET /api/catalogs/export → Xuất CSV bảng giá
```

### Flow 8: Inventory (Quản lý tồn kho)
```
1. GET /api/stores → Danh sách cửa hàng/kho
2. GET /api/transaction-types → Danh sách loại giao dịch kho
3. GET /api/inventories → Danh sách tồn kho
4. GET /api/inventories/1 → Chi tiết tồn kho theo variant
5. PUT /api/inventories/1 → Điều chỉnh tồn kho
6. GET /api/inventories/1/history → Lịch sử xuất nhập kho
7. POST /api/inventories/receive → Nhập kho
8. POST /api/inventories/transfer → Chuyển kho
9. POST /api/inventories/return → Trả hàng nhà cung cấp
```

---

## 📦 Module 7: Catalog (Bảng giá)

### 7.1 Danh sách bảng giá
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/catalogs?search=&page=1&limit=10`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Tìm theo mã, tên sản phẩm, SKU |
| page | number | Trang hiện tại (mặc định: 1) |
| limit | number | Số record/trang (mặc định: 10) |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MILK001",
      "name": "Sữa tươi Vinamilk",
      "sku": "MILK001-SKU",
      "barcode": "8934567890123",
      "cost_price": "10000.00",
      "price": "16000.00",
      "unit": "Cái",
      "is_active": true,
      "product_id": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

---

### 7.2 Chi tiết bảng giá
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/catalogs/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "MILK001",
    "name": "Sữa tươi Vinamilk",
    "sku": "MILK001-SKU",
    "barcode": "8934567890123",
    "cost_price": "10000.00",
    "price": "16000.00",
    "unit": "Cái",
    "unit_id": 1,
    "is_active": true,
    "product_id": 1,
    "description": null
  }
}
```

---

### 7.3 Cập nhật giá sản phẩm
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/catalogs/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "cost_price": 10000,
  "selling_price": 16000,
  "is_active": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cập nhật giá thành công",
  "data": {
    "id": 1,
    "sku": "MILK001-SKU",
    "cost_price": "10000.00",
    "price": "16000.00",
    "is_active": true
  }
}
```

---

### 7.4 Cập nhật giá hàng loạt
**Postman Setup:**
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/catalogs/bulk-update`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "variant_ids": [1, 2, 3],
  "price_change_type": "percent",
  "price_change_value": 10
}
```

**Lưu ý:**
- `price_change_type`: `"fixed"` (đặt giá cố định) hoặc `"percent"` (tăng/giảm %)
- `price_change_value`: Giá trị (số dương = tăng, số âm = giảm khi type=percent)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cập nhật giá hàng loạt thành công",
  "updated_count": 3
}
```

---

### 7.5 Xuất bảng giá CSV
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/catalogs/export`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response:** File CSV download

---

## 📦 Module 8: Inventory (Quản lý tồn kho)

### 8.1 Danh sách cửa hàng/kho
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/stores`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "STORE_HN",
      "name": "MiniMart Hà Nội",
      "store_type": "Retail Store",
      "address": "123 Trần Duy Hưng",
      "is_active": true
    },
    {
      "id": 2,
      "code": "STORE_HCM",
      "name": "MiniMart Hồ Chí Minh",
      "store_type": "Retail Store",
      "address": "456 Nguyễn Huệ",
      "is_active": true
    }
  ]
}
```

---

### 8.2 Danh sách loại giao dịch kho
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/transaction-types`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {"id": 1, "code": "PURCHASE", "name": "Nhập hàng từ NCC", "affects_stock": 1},
    {"id": 2, "code": "SALE", "name": "Bán hàng", "affects_stock": -1},
    {"id": 3, "code": "RETURN_IN", "name": "Khách trả hàng", "affects_stock": 1},
    {"id": 4, "code": "RETURN_OUT", "name": "Trả hàng NCC", "affects_stock": -1},
    {"id": 5, "code": "TRANSFER_IN", "name": "Chuyển kho vào", "affects_stock": 1},
    {"id": 6, "code": "TRANSFER_OUT", "name": "Chuyển kho ra", "affects_stock": -1},
    {"id": 7, "code": "ADJUSTMENT", "name": "Điều chỉnh tồn", "affects_stock": 0}
  ]
}
```

---

### 8.3 Danh sách tồn kho
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/inventories?search=&store_id=1&status=&page=1&limit=10`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Tìm theo mã, tên sản phẩm, SKU |
| store_id | number | Lọc theo cửa hàng |
| status | string | `out`, `low`, `normal`, `high` |
| page | number | Trang hiện tại (mặc định: 1) |
| limit | number | Số record/trang (mặc định: 10) |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "store_id": 1,
      "id": 1,
      "code": "MILK001",
      "name": "Sữa tươi Vinamilk",
      "sku": "MILK001-SKU",
      "barcode": "8934567890123",
      "unit": "Cái",
      "location": "MiniMart Hà Nội",
      "store_code": "STORE_HN",
      "stock": "100.000",
      "quantity_reserved": "0.000",
      "quantity_available": "100.000",
      "min_stock_level": "20.000",
      "max_stock_level": "0.000",
      "stock_status": "normal"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 8.4 Chi tiết tồn kho theo variant
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/inventories/1?store_id=`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "variant_info": {
      "id": 1,
      "code": "MILK001",
      "name": "Sữa tươi Vinamilk",
      "sku": "MILK001-SKU",
      "barcode": "8934567890123",
      "cost_price": "10000.00",
      "selling_price": "16000.00",
      "unit": "Cái"
    },
    "stock_by_store": [
      {
        "store_id": 1,
        "store_name": "MiniMart Hà Nội",
        "store_code": "STORE_HN",
        "stock": "100.000",
        "quantity_reserved": "0.000",
        "quantity_available": "100.000",
        "min_stock_level": "20.000",
        "max_stock_level": "0.000"
      }
    ]
  }
}
```

---

### 8.5 Điều chỉnh tồn kho
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/inventories/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "store_id": 1,
  "quantity": 100,
  "adjustment_type": "set",
  "notes": "Kiểm kê điều chỉnh"
}
```

**Lưu ý:**
- `adjustment_type`: `"set"` (đặt số lượng), `"add"` (cộng thêm), `"subtract"` (trừ đi)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Điều chỉnh tồn kho thành công",
  "data": {
    "previous_stock": 50,
    "new_stock": 100,
    "quantity_change": 50,
    "transaction_code": "ADJ-1769331237802"
  }
}
```

---

### 8.6 Lịch sử xuất nhập kho
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/inventories/1/history?store_id=&from=&to=&page=1&limit=20`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| store_id | number | Lọc theo cửa hàng |
| from | string | Từ ngày (YYYY-MM-DD) |
| to | string | Đến ngày (YYYY-MM-DD) |
| page | number | Trang (mặc định: 1) |
| limit | number | Số record/trang (mặc định: 20) |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "transaction_code": "RCV-1769331207885-3",
      "date_key": "2026-01-25T00:00:00.000Z",
      "created_at": "2026-01-25T08:53:27.860Z",
      "transaction_type": "Nhập hàng từ NCC",
      "transaction_type_code": "PURCHASE",
      "store_name": "MiniMart Hà Nội",
      "quantity_change": "50.000",
      "balance_before": "0.000",
      "balance_after": "50.000",
      "reference_type": "RECEIVE",
      "unit_cost": "8000.00",
      "total_value": "400000.00",
      "notes": "Nhập hàng Pepsi",
      "created_by_name": "Admin System"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

---

### 8.7 Nhập kho
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/inventories/receive`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "store_id": 1,
  "items": [
    {"variant_id": 3, "quantity": 50, "unit_cost": 8000},
    {"variant_id": 4, "quantity": 100, "unit_cost": 7500}
  ],
  "notes": "Nhập hàng đợt 1 tháng 1/2026"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Nhập kho thành công 2 sản phẩm",
  "data": {
    "transaction_codes": ["RCV-1769331207885-3", "RCV-1769331207886-4"],
    "items_count": 2
  }
}
```

---

### 8.8 Chuyển kho
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/inventories/transfer`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "from_store_id": 1,
  "to_store_id": 2,
  "items": [
    {"variant_id": 3, "quantity": 20},
    {"variant_id": 4, "quantity": 30}
  ],
  "notes": "Chuyển hàng sang kho HCM"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Chuyển kho thành công 2 sản phẩm",
  "data": {
    "transaction_codes": ["TRF-1769331223258-3", "TRF-1769331223259-4"],
    "items_count": 2
  }
}
```

---

### 8.9 Trả hàng nhà cung cấp
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/inventories/return`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "store_id": 1,
  "items": [
    {"variant_id": 3, "quantity": 10}
  ],
  "notes": "Trả hàng hư hỏng"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Trả hàng thành công 1 sản phẩm",
  "data": {
    "transaction_codes": ["RTN-1769331243875-3"],
    "items_count": 1
  }
}
```

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

---

## ⚠️ Lỗi thường gặp & Cách fix

| Lỗi | Nguyên nhân | Cách fix |
|-----|-----------|---------|
| 400 Bad Request | Input thiếu hoặc format sai | Kiểm tra request body & headers |
| 401 Unauthorized | Token không hợp lệ/hết hạn | Đăng nhập lại để lấy token mới |
| 404 Not Found | Staff/User không tồn tại | Kiểm tra ID có tồn tại trong DB |
| 500 Internal Error | Lỗi server | Kiểm tra logs & database connection |

---

## 🔍 Debug Tips

### Xem logs server:
```bash
cd backend
npm run dev
# Logs sẽ in ra console
```

### Kiểm tra database:
```bash
psql -U admin -d minimart_db

# Xem users
SELECT * FROM dim_users;

# Xem roles
SELECT * FROM subdim_roles;
```

### Format JSON response đẹp:
Dùng tools online như: https://jsonformatter.org

---

## Module 9: Product Images (Ảnh sản phẩm)

> Module quản lý ảnh sản phẩm bao gồm ảnh chính và gallery ảnh phụ.

### 9.1 Lấy danh sách ảnh của sản phẩm

**Endpoint:** `GET /api/products/:id/images`

**Request:**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `id` - ID sản phẩm

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "main_image": "/uploads/products/product-1-main.jpg",
    "gallery": [
      {
        "id": 1,
        "product_id": 1,
        "image_url": "/uploads/products/product-1-1.jpg",
        "alt_text": "Mô tả ảnh",
        "sort_order": 1,
        "is_primary": true,
        "created_at": "2026-01-25T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 9.2 Upload ảnh chính sản phẩm

**Endpoint:** `POST /api/products/:id/image`

**Request:**
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Params:** `id` - ID sản phẩm
- **Body (form-data):** `image` - File ảnh (jpg, png, webp, max 5MB)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "image_url": "/uploads/products/product-1-main-1706172900000.jpg"
  },
  "message": "Upload ảnh sản phẩm thành công"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Vui lòng chọn file ảnh"
}
```

---

### 9.3 Xóa ảnh chính sản phẩm

**Endpoint:** `DELETE /api/products/:id/image`

**Request:**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `id` - ID sản phẩm

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Xóa ảnh sản phẩm thành công"
}
```

---

### 9.4 Upload gallery ảnh (tối đa 5 ảnh)

**Endpoint:** `POST /api/products/:id/images`

**Request:**
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Params:** `id` - ID sản phẩm
- **Body (form-data):** `images` - Mảng file ảnh (tối đa 5 files)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "image_url": "/uploads/products/product-1-1706172900001.jpg",
      "alt_text": null,
      "sort_order": 1,
      "is_primary": false
    },
    {
      "id": 2,
      "product_id": 1,
      "image_url": "/uploads/products/product-1-1706172900002.jpg",
      "alt_text": null,
      "sort_order": 2,
      "is_primary": false
    }
  ],
  "message": "Upload 2 ảnh thành công"
}
```

---

### 9.5 Xóa ảnh trong gallery

**Endpoint:** `DELETE /api/products/:id/images/:imageId`

**Request:**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** 
  - `id` - ID sản phẩm
  - `imageId` - ID ảnh trong gallery

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Xóa ảnh thành công"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Không tìm thấy ảnh"
}
```

---

### 9.6 Đặt ảnh làm ảnh chính

**Endpoint:** `PUT /api/products/:id/images/:imageId/primary`

**Request:**
- **Headers:** `Authorization: Bearer <token>`
- **Params:** 
  - `id` - ID sản phẩm
  - `imageId` - ID ảnh trong gallery

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "product_id": 1,
    "image_url": "/uploads/products/product-1-1706172900002.jpg",
    "is_primary": true
  },
  "message": "Đặt ảnh chính thành công"
}
```

---

### 9.7 Sắp xếp lại thứ tự ảnh

**Endpoint:** `PUT /api/products/:id/images/reorder`

**Request:**
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Params:** `id` - ID sản phẩm
- **Body:**
```json
{
  "imageIds": [3, 1, 2]
}
```
> Mảng `imageIds` chứa ID của các ảnh theo thứ tự mong muốn

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Sắp xếp ảnh thành công"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Danh sách ID ảnh không hợp lệ"
}
```

---

## Module 10: Orders (Quản lý đơn hàng)

### 10.1 Danh sách đơn hàng
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/orders`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| limit | number | Số lượng/trang (max: 100) | `?limit=20` |
| offset | number | Vị trí bắt đầu | `?offset=0` |
| status | string | Lọc theo trạng thái | `?status=completed` |
| payment_status | string | Lọc theo thanh toán | `?payment_status=paid` |
| search | string | Tìm theo mã đơn/tên KH | `?search=ORD001` |
| sort | string | Sắp xếp theo trường | `?sort=created_at` |
| order | string | Thứ tự sắp xếp | `?order=DESC` |

**Giá trị status:** `pending`, `completed`, `cancelled`
**Giá trị payment_status:** `paid`, `unpaid`
**Giá trị sort:** `order_code`, `final_amount`, `status`, `created_at`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_code": "ORD-20260128-001",
      "date": "2026-01-28T10:30:00.000Z",
      "customer": {
        "id": 1,
        "name": "Nguyễn Văn An",
        "phone": "0901234567"
      },
      "store": {
        "id": 1,
        "name": "MiniMart Hà Nội"
      },
      "status": "completed",
      "payment_status": "paid",
      "payment_method": "cash",
      "amount": {
        "subtotal": 150000,
        "discount": 10000,
        "tax": 0,
        "shipping": 0,
        "final": 140000
      },
      "items": 3,
      "notes": {
        "customer": "Giao trước 5h",
        "internal": "Khách VIP"
      },
      "created_by": "Admin System",
      "created_at": "2026-01-28T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 156,
    "totalPages": 16
  }
}
```

---

### 10.2 Tạo đơn hàng mới
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/orders`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "store_id": 1,
  "customer_id": 1,
  "items": [
    {
      "variant_id": 1,
      "quantity": 2,
      "unit_price": 16000,
      "discount_per_item": 0
    },
    {
      "variant_id": 2,
      "quantity": 1,
      "unit_price": 25000,
      "discount_per_item": 5000
    }
  ],
  "subtotal": 57000,
  "discount_amount": 5000,
  "tax_amount": 0,
  "shipping_fee": 0,
  "payment_method": "cash",
  "shipping_address": "123 Trần Duy Hưng, Hà Nội",
  "customer_note": "Giao hàng trước 5h chiều",
  "internal_note": "Khách VIP"
}
```

**Các trường bắt buộc:**
- `store_id`: ID cửa hàng
- `items`: Danh sách sản phẩm
- `subtotal`: Tổng tiền trước giảm giá

**Các trường tùy chọn:**
- `customer_id`: ID khách hàng (nếu có)
- `discount_amount`: Số tiền giảm giá (default: 0)
- `tax_amount`: Thuế (default: 0)
- `shipping_fee`: Phí ship (default: 0)
- `payment_method`: `cash`, `card`, `bank transfer`
- `shipping_address`: Địa chỉ giao hàng
- `customer_note`: Ghi chú của khách
- `internal_note`: Ghi chú nội bộ

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": 157,
    "order_code": "ORD-20260128-157",
    "date": "2026-01-28T14:30:00.000Z",
    "customer_name": "Nguyễn Văn An",
    "store_name": "MiniMart Hà Nội",
    "status": "pending",
    "payment_status": "unpaid",
    "amount": {
      "subtotal": 57000,
      "discount": 5000,
      "tax": 0,
      "shipping": 0,
      "final": 52000
    },
    "items_count": 2,
    "created_at": "2026-01-28T14:30:00.000Z"
  },
  "message": "Tạo đơn hàng thành công"
}
```

---

### 10.3 Chi tiết đơn hàng
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/orders/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_code": "ORD-20260128-001",
    "date": "2026-01-28T10:30:00.000Z",
    "customer": {
      "id": 1,
      "name": "Nguyễn Văn An",
      "phone": "0901234567",
      "email": "an@email.com"
    },
    "store": {
      "id": 1,
      "name": "MiniMart Hà Nội",
      "address": "123 Trần Duy Hưng"
    },
    "status": "completed",
    "payment_status": "paid",
    "payment_method": "cash",
    "amount": {
      "subtotal": 150000,
      "discount": 10000,
      "tax": 0,
      "shipping": 0,
      "final": 140000
    },
    "shipping_address": "456 Nguyễn Trãi, Hà Nội",
    "items": [
      {
        "id": 1,
        "variant_id": 1,
        "product_name": "Sữa tươi Vinamilk",
        "sku": "MILK001-SKU",
        "quantity": 3,
        "unit_price": 16000,
        "discount_per_item": 0,
        "total": 48000
      },
      {
        "id": 2,
        "variant_id": 2,
        "product_name": "Mì Hảo Hảo",
        "sku": "NOODLE001-SKU",
        "quantity": 5,
        "unit_price": 5000,
        "discount_per_item": 500,
        "total": 22500
      }
    ],
    "notes": {
      "customer": "Giao trước 5h chiều",
      "internal": "Khách VIP"
    },
    "created_by": {
      "id": 1,
      "name": "Admin System"
    },
    "created_at": "2026-01-28T10:30:00.000Z",
    "updated_at": "2026-01-28T11:00:00.000Z"
  }
}
```

---

### 10.4 Cập nhật trạng thái đơn hàng
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/orders/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "status": "completed",
  "payment_status": "paid",
  "payment_method": "cash"
}
```

**Các trường có thể cập nhật:**
- `status`: `pending`, `completed`, `cancelled`
- `payment_status`: `paid`, `unpaid`
- `payment_method`: `cash`, `card`, `bank transfer`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_code": "ORD-20260128-001",
    "status": "completed",
    "payment_status": "paid",
    "payment_method": "cash",
    "updated_at": "2026-01-28T15:00:00.000Z"
  },
  "message": "Cập nhật đơn hàng thành công"
}
```

---

### 10.5 Hủy đơn hàng
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/orders/1` (thay `1` bằng ID)
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "reason": "Khách hàng yêu cầu hủy đơn"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_code": "ORD-20260128-001",
    "status": "cancelled",
    "payment_status": "unpaid",
    "cancelled_at": "2026-01-28T15:30:00.000Z",
    "note": "Khách hàng yêu cầu hủy đơn"
  },
  "message": "Hủy đơn hàng thành công"
}
```

> ⚠️ **Lưu ý:** Hủy đơn hàng là soft delete (đặt status = cancelled), không xóa vĩnh viễn dữ liệu.

---

### 10.6 Thống kê đơn hàng (Summary)
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/orders/stats/summary`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "total_orders": 156,
    "by_status": {
      "pending": 23,
      "completed": 120,
      "cancelled": 13
    },
    "by_payment": {
      "paid": 118,
      "unpaid": 38
    },
    "revenue": {
      "total": 15680000,
      "average": 100512
    }
  }
}
```

---

### 10.7 Thống kê chi tiết (Detailed Stats)
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/orders/stats/detailed`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 156,
      "by_status": {
        "pending": 23,
        "completed": 120,
        "cancelled": 13
      },
      "completion_rate": 76.92
    },
    "payment": {
      "by_status": {
        "paid": 118,
        "unpaid": 38
      },
      "payment_rate": 75.64
    },
    "revenue": {
      "total": 15680000,
      "by_status": {
        "pending": 2300000,
        "completed": 12800000,
        "cancelled": 580000
      },
      "average": 100512
    },
    "financials": {
      "total_discount": 890000,
      "total_tax": 0,
      "total_shipping": 250000,
      "total_items": 523
    }
  }
}
```

---

## � Tổng kết API

| STT | Module | API | Method | Endpoint |
|-----|--------|-----|--------|----------|
| 1 | Auth | Đăng nhập | POST | `/api/auth/login` |
| 2 | Auth | Lấy thông tin user | GET | `/api/auth/me` |
| 3 | Auth | Đăng xuất | POST | `/api/auth/logout` |
| 4 | Auth | Refresh token | POST | `/api/auth/refresh` |
| 5 | Auth | Danh sách roles | GET | `/api/auth/roles` |
| 6 | Staff | Danh sách | GET | `/api/staff` |
| 7 | Staff | Thêm mới | POST | `/api/staff` |
| 8 | Staff | Chi tiết | GET | `/api/staff/:id` |
| 9 | Staff | Cập nhật | PUT | `/api/staff/:id` |
| 10 | Staff | Xóa | DELETE | `/api/staff/:id` |
| 11 | Staff | Phân quyền | PUT | `/api/staff/:id/role` |
| 12 | Profile | Xem profile | GET | `/api/users/profile` |
| 13 | Profile | Cập nhật profile | PUT | `/api/users/profile` |
| 14 | Profile | Đổi mật khẩu | PUT | `/api/users/change-password` |
| 15 | Profile | Upload avatar | POST | `/api/users/avatar` |
| 16 | Profile | Xóa avatar | DELETE | `/api/users/avatar` |
| 17 | Products | Danh sách | GET | `/api/products` |
| 18 | Products | Thêm mới | POST | `/api/products` |
| 19 | Products | Chi tiết | GET | `/api/products/:id` |
| 20 | Products | Sửa | PUT | `/api/products/:id` |
| 21 | Products | Xóa | DELETE | `/api/products/:id` |
| 22 | Products | Bulk status | PATCH | `/api/products/bulk-status` |
| 23 | Products | Export CSV | GET | `/api/products/export` |
| 24 | Products | Import CSV | POST | `/api/products/import` |
| 25 | Products | DS Thương hiệu | GET | `/api/brands` |
| 26 | Products | DS Đơn vị | GET | `/api/units` |
| 27 | Collections | Danh sách | GET | `/api/collections` |
| 28 | Collections | Cây danh mục | GET | `/api/collections/tree` |
| 29 | Collections | Thêm mới | POST | `/api/collections` |
| 30 | Collections | Chi tiết | GET | `/api/collections/:id` |
| 31 | Collections | Sửa | PUT | `/api/collections/:id` |
| 32 | Collections | Xóa | DELETE | `/api/collections/:id` |
| 33 | Dashboard | Overview | GET | `/api/dashboard/overview` |
| 34 | Dashboard | Stats | GET | `/api/dashboard/stats` |
| 35 | Dashboard | Revenue Chart | GET | `/api/dashboard/revenue-chart` |
| 36 | Dashboard | Top Products | GET | `/api/dashboard/top-products` |
| 37 | Dashboard | Sales Channels | GET | `/api/dashboard/sales-channels` |
| 38 | Dashboard | Top Customers | GET | `/api/dashboard/top-customers` |
| 39 | Dashboard | Low Stock | GET | `/api/dashboard/low-stock` |
| 40 | Catalog | Danh sách | GET | `/api/catalogs` |
| 41 | Catalog | Chi tiết | GET | `/api/catalogs/:id` |
| 42 | Catalog | Cập nhật giá | PUT | `/api/catalogs/:id` |
| 43 | Catalog | Bulk update | PATCH | `/api/catalogs/bulk-update` |
| 44 | Catalog | Export CSV | GET | `/api/catalogs/export` |
| 45 | Inventory | DS cửa hàng | GET | `/api/stores` |
| 46 | Inventory | DS loại giao dịch | GET | `/api/transaction-types` |
| 47 | Inventory | Danh sách | GET | `/api/inventories` |
| 48 | Inventory | Chi tiết | GET | `/api/inventories/:variantId` |
| 49 | Inventory | Điều chỉnh | PUT | `/api/inventories/:variantId` |
| 50 | Inventory | Lịch sử | GET | `/api/inventories/:variantId/history` |
| 51 | Inventory | Nhập kho | POST | `/api/inventories/receive` |
| 52 | Inventory | Chuyển kho | POST | `/api/inventories/transfer` |
| 53 | Inventory | Trả hàng NCC | POST | `/api/inventories/return` |
| 54 | Product Images | Danh sách ảnh | GET | `/api/products/:id/images` |
| 55 | Product Images | Upload ảnh chính | POST | `/api/products/:id/image` |
| 56 | Product Images | Xóa ảnh chính | DELETE | `/api/products/:id/image` |
| 57 | Product Images | Upload gallery | POST | `/api/products/:id/images` |
| 58 | Product Images | Xóa ảnh gallery | DELETE | `/api/products/:id/images/:imageId` |
| 59 | Product Images | Set ảnh chính | PUT | `/api/products/:id/images/:imageId/primary` |
| 60 | Product Images | Sắp xếp ảnh | PUT | `/api/products/:id/images/reorder` |
| 61 | Orders | Danh sách | GET | `/api/orders` |
| 62 | Orders | Tạo mới | POST | `/api/orders` |
| 63 | Orders | Chi tiết | GET | `/api/orders/:id` |
| 64 | Orders | Cập nhật | PUT | `/api/orders/:id` |
| 65 | Orders | Hủy đơn | DELETE | `/api/orders/:id` |
| 66 | Orders | Thống kê summary | GET | `/api/orders/stats/summary` |
| 67 | Orders | Thống kê detailed | GET | `/api/orders/stats/detailed` |

---

## 📖 Complete Test Flow

### Flow 1: Authentication
```
1. POST /api/auth/login → Lấy token
2. GET /api/auth/me → Kiểm tra login
3. GET /api/auth/roles → Lấy danh sách roles
4. POST /api/auth/logout → Đăng xuất
```

### Flow 2: Staff Management
```
1. GET /api/staff → Lấy danh sách
2. POST /api/staff → Thêm mới
3. GET /api/staff/2 → Chi tiết
4. PUT /api/staff/2 → Cập nhật
5. PUT /api/staff/2/role → Phân quyền
6. DELETE /api/staff/2 → Xóa
```

### Flow 3: Profile Management
```
1. GET /api/users/profile → Xem
2. PUT /api/users/profile → Cập nhật
3. PUT /api/users/change-password → Đổi mật khẩu
4. POST /api/users/avatar → Upload avatar
5. DELETE /api/users/avatar → Xóa avatar
```

### Flow 4: Product Management
```
1. GET /api/products → Danh sách
2. POST /api/products → Thêm mới
3. GET /api/products/1 → Chi tiết
4. PUT /api/products/1 → Sửa
5. PATCH /api/products/bulk-status → Bulk status
6. POST /api/products/import → Import CSV
7. GET /api/products/export → Export CSV
8. DELETE /api/products/1 → Xóa
```

### Flow 5: Collection Management
```
1. GET /api/collections → Danh sách
2. GET /api/collections/tree → Cây danh mục
3. POST /api/collections → Thêm mới
4. GET /api/collections/1 → Chi tiết
5. PUT /api/collections/1 → Sửa
6. DELETE /api/collections/1 → Xóa
```

### Flow 6: Dashboard & Reports
```
1. GET /api/dashboard/overview → Tổng quan
2. GET /api/dashboard/stats?from=2026-01-01&to=2026-01-28 → Thống kê
3. GET /api/dashboard/revenue-chart?from=2026-01-01&to=2026-01-28&groupBy=day → Biểu đồ doanh thu
4. GET /api/dashboard/top-products?limit=5 → Top sản phẩm bán chạy
5. GET /api/dashboard/sales-channels → Kênh bán hàng
6. GET /api/dashboard/top-customers?limit=5 → Top khách hàng
7. GET /api/dashboard/low-stock?threshold=20 → Sản phẩm sắp hết hàng
```

### Flow 7: Catalog (Bảng giá)
```
1. GET /api/catalogs → Danh sách bảng giá
2. GET /api/catalogs/1 → Chi tiết giá sản phẩm
3. PUT /api/catalogs/1 → Cập nhật giá
4. PATCH /api/catalogs/bulk-update → Cập nhật giá hàng loạt
5. GET /api/catalogs/export → Xuất CSV bảng giá
```

### Flow 8: Inventory (Quản lý tồn kho)
```
1. GET /api/stores → Danh sách cửa hàng/kho
2. GET /api/transaction-types → Danh sách loại giao dịch kho
3. GET /api/inventories → Danh sách tồn kho
4. GET /api/inventories/1 → Chi tiết tồn kho theo variant
5. PUT /api/inventories/1 → Điều chỉnh tồn kho
6. GET /api/inventories/1/history → Lịch sử xuất nhập kho
7. POST /api/inventories/receive → Nhập kho
8. POST /api/inventories/transfer → Chuyển kho
9. POST /api/inventories/return → Trả hàng nhà cung cấp
```

### Flow 9: Product Images (Ảnh sản phẩm)
```
1. GET /api/products/1/images → Danh sách ảnh
2. POST /api/products/1/image → Upload ảnh chính
3. DELETE /api/products/1/image → Xóa ảnh chính
4. POST /api/products/1/images → Upload gallery
5. DELETE /api/products/1/images/2 → Xóa ảnh gallery
6. PUT /api/products/1/images/2/primary → Đặt ảnh chính
7. PUT /api/products/1/images/reorder → Sắp xếp ảnh
```

### Flow 10: Orders (Quản lý đơn hàng)
```
1. GET /api/orders → Danh sách đơn hàng
2. POST /api/orders → Tạo đơn hàng mới
3. GET /api/orders/1 → Chi tiết đơn hàng
4. PUT /api/orders/1 → Cập nhật trạng thái
5. DELETE /api/orders/1 → Hủy đơn hàng
6. GET /api/orders/stats/summary → Thống kê tổng quan
7. GET /api/orders/stats/detailed → Thống kê chi tiết
```

### Flow 11: Customers (Quản lý khách hàng)
```
1. GET /api/customers → Danh sách khách hàng
2. POST /api/customers → Thêm khách hàng
3. GET /api/customers/1 → Chi tiết khách hàng
4. PUT /api/customers/1 → Cập nhật khách hàng
5. DELETE /api/customers/1 → Xóa khách hàng
6. GET /api/customers/search?q=xxx → Tìm nhanh
7. GET /api/customer-groups → Danh sách nhóm KH
8. PUT /api/customers/1/group → Cập nhật nhóm KH
```

### Flow 12: Suppliers (Nhà cung cấp)
```
1. GET /api/suppliers → Danh sách NCC
2. POST /api/suppliers → Thêm NCC
3. GET /api/suppliers/1 → Chi tiết NCC
4. PUT /api/suppliers/1 → Cập nhật NCC
5. DELETE /api/suppliers/1 → Xóa NCC
```

### Flow 13: Discounts (Khuyến mại)
```
1. GET /api/discounts → Danh sách khuyến mại
2. POST /api/discounts → Tạo khuyến mại
3. GET /api/discounts/1 → Chi tiết
4. PUT /api/discounts/1 → Cập nhật
5. DELETE /api/discounts/1 → Xóa
6. POST /api/discounts/validate → Kiểm tra mã
7. PUT /api/discounts/1/deactivate → Vô hiệu hóa
8. GET /api/discounts/types → Danh sách loại KM
```

### Flow 14: Transactions (Sổ quỹ)
```
1. GET /api/transactions → Danh sách giao dịch
2. POST /api/transactions → Tạo phiếu thu/chi
3. GET /api/transactions/1 → Chi tiết
4. PUT /api/transactions/1/approve → Duyệt phiếu
5. PUT /api/transactions/1/cancel → Hủy phiếu
6. GET /api/transactions/summary → Báo cáo tổng hợp
7. GET /api/transactions/types → Danh sách loại
```

### Flow 15: Shipments (Vận chuyển)
```
1. GET /api/shipments → Danh sách vận đơn
2. POST /api/shipments → Tạo vận đơn
3. GET /api/shipments/1 → Chi tiết
4. PUT /api/shipments/1/status → Cập nhật trạng thái
5. GET /api/shipments/1/tracking → Theo dõi
6. DELETE /api/shipments/1 → Hủy vận đơn
7. GET /api/shipments/shippers → DS đơn vị VC
8. GET /api/shipments/statuses → DS trạng thái
```

### Flow 16: POS Payment (Thanh toán POS)
```
1. POST /api/pos/checkout → Xử lý thanh toán
2. GET /api/pos/products/search → Tìm SP nhanh
3. GET /api/pos/products/1/price → Lấy giá SP
4. POST /api/pos/orders/draft → Lưu đơn tạm
5. GET /api/pos/orders/drafts → DS đơn tạm
6. GET /api/pos/orders/drafts/1 → Chi tiết đơn tạm
7. DELETE /api/pos/orders/draft/1 → Xóa đơn tạm
8. GET /api/pos/orders/1/receipt → In hóa đơn
9. POST /api/pos/discounts/validate → Kiểm tra mã giảm giá
10. GET /api/pos/payment-methods → DS phương thức TT
```

### Flow 17: Bank Accounts (Tài khoản NH)
```
1. GET /api/bank-accounts → Danh sách TK
2. POST /api/bank-accounts → Thêm TK
3. PUT /api/bank-accounts/1 → Sửa TK
4. DELETE /api/bank-accounts/1 → Xóa TK
5. GET /api/bank-accounts/1/qr → Tạo mã QR
```

### Flow 18: Checkouts (Đơn chưa hoàn tất)
```
1. GET /api/checkouts → DS đơn abandoned
2. GET /api/checkouts/1 → Chi tiết
3. POST /api/checkouts/1/send-link → Gửi link TT
4. POST /api/checkouts/mass-email → Gửi email hàng loạt
```

---

## 📦 Module 20: Bank Accounts (Tài khoản ngân hàng)

### 20.1 Danh sách tài khoản ngân hàng
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/bank-accounts`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| page | number | Trang hiện tại | `?page=1` |
| limit | number | Số lượng/trang | `?limit=20` |
| store_id | number | Lọc theo cửa hàng | `?store_id=1` |
| is_active | boolean | Lọc theo trạng thái | `?is_active=true` |
| search | string | Tìm kiếm | `?search=vietcom` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "account_name": "Siêu Thị Mini",
      "account_number": "1234567890",
      "bank_name": "Vietcombank",
      "bank_code": "VCB",
      "branch": "Chi nhánh Quận 1",
      "store_id": null,
      "store_name": null,
      "is_default": true,
      "is_active": true,
      "created_at": "2026-01-31T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 20.2 Thêm tài khoản ngân hàng
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/bank-accounts`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "account_name": "Siêu Thị Mini",
  "account_number": "9876543210",
  "bank_name": "Techcombank",
  "bank_code": "TCB",
  "branch": "Chi nhánh Quận 3",
  "store_id": null,
  "is_default": false,
  "notes": "Tài khoản dự phòng"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "account_name": "Siêu Thị Mini",
    "account_number": "9876543210",
    "bank_name": "Techcombank",
    "bank_code": "TCB",
    "is_default": false,
    "is_active": true
  },
  "message": "Bank account created successfully"
}
```

---

### 20.3 Cập nhật tài khoản ngân hàng
**Postman Setup:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/bank-accounts/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "branch": "Chi nhánh Quận 1 - Mới",
  "is_default": true
}
```

---

### 20.4 Xóa tài khoản ngân hàng
**Postman Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/bank-accounts/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

---

### 20.5 Tạo mã QR thanh toán
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/bank-accounts/1/qr?amount=500000&description=Thanh%20toan%20don%20hang`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| amount | number | Số tiền | `?amount=500000` |
| description | string | Nội dung | `?description=Don hang 123` |
| order_code | string | Mã đơn hàng | `?order_code=ORD-001` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "bank_code": "VCB",
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "account_name": "Siêu Thị Mini",
    "amount": 500000,
    "description": "Thanh toan don hang",
    "qr_url": "https://img.vietqr.io/image/VCB-1234567890-compact.png?amount=500000&addInfo=Thanh%20toan%20don%20hang",
    "napas_qr": "NAPAS|970436|1234567890|500000|Thanh toan don hang"
  },
  "message": "Payment QR generated successfully"
}
```

---

## 📦 Module 21: Checkouts (Đơn chưa hoàn tất)

### 21.1 Danh sách đơn chưa hoàn tất
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/checkouts`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Query Parameters:**
| Param | Type | Mô tả | Ví dụ |
|-------|------|-------|-------|
| page | number | Trang hiện tại | `?page=1` |
| limit | number | Số lượng/trang | `?limit=20` |
| store_id | number | Lọc theo cửa hàng | `?store_id=1` |
| status | string | Lọc theo trạng thái (draft/abandoned/pending) | `?status=abandoned` |
| search | string | Tìm kiếm | `?search=CK-001` |
| from | date | Từ ngày | `?from=2026-01-01` |
| to | date | Đến ngày | `?to=2026-01-31` |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "checkoutCode": "CK-260201-001",
      "customerName": "Nguyễn Văn A",
      "customerContact": "a@example.com",
      "storeId": 1,
      "storeName": "Cửa hàng HCM",
      "createdDate": "2026-02-01T10:32:00Z",
      "totalAmount": 450000,
      "status": "Chưa liên hệ",
      "itemCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### 21.2 Chi tiết đơn chưa hoàn tất
**Postman Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/checkouts/1`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "checkoutCode": "CK-260201-001",
    "customer": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "a@example.com",
      "phone": "0901234567"
    },
    "store": {
      "id": 1,
      "name": "Cửa hàng HCM"
    },
    "displayStatus": "Chưa liên hệ",
    "totalAmount": 450000,
    "items": [
      {
        "id": 1,
        "variantId": 10,
        "sku": "MILK-001",
        "productName": "Sữa tươi Vinamilk",
        "variantName": "Hộp 1L",
        "quantity": 2,
        "unitPrice": 35000,
        "lineTotal": 70000
      }
    ]
  }
}
```

---

### 21.3 Gửi link thanh toán
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/checkouts/1/send-link`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "custom_message": "Xin chào, đây là link thanh toán cho đơn hàng của bạn"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "checkout_id": 1,
    "checkout_code": "CK-260201-001",
    "payment_link": "https://pay.example.com/checkout/xxx",
    "sent_to": "a@example.com",
    "sent_at": "2026-02-01T11:00:00Z",
    "message": "Payment link has been sent"
  }
}
```

---

### 21.4 Gửi email hàng loạt
**Postman Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/checkouts/mass-email`
- **Header:** `Authorization: Bearer <YOUR_TOKEN>`
- Tab **Body** → **raw** → **JSON**

**Request Body:**
```json
{
  "checkout_ids": [1, 2, 3],
  "store_id": 1,
  "exclude_already_sent": true,
  "custom_message": "Đừng bỏ lỡ giỏ hàng của bạn!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "sent_count": 3,
    "failed_count": 0,
    "sent_checkout_ids": [1, 2, 3],
    "message": "Sent 3 emails, 0 failed"
  }
}
```

---

## 📊 Tổng kết API (129 APIs - 21 Modules)

| STT | Module | Số APIs | Endpoint Base |
|-----|--------|---------|---------------|
| 1 | Authentication | 4 | `/api/auth` |
| 2 | Staff Management | 6 | `/api/staff` |
| 3 | Profile Management | 5 | `/api/users` |
| 4 | Products | 10 | `/api/products` |
| 5 | Collections | 6 | `/api/collections` |
| 6 | Dashboard | 7 | `/api/dashboard` |
| 7 | Catalog | 5 | `/api/catalogs` |
| 8 | Inventory | 9 | `/api/inventories` |
| 9 | Product Images | 7 | `/api/products/:id/images` |
| 10 | Orders | 7 | `/api/orders` |
| 11 | Customers | 8 | `/api/customers` |
| 12 | Suppliers | 5 | `/api/suppliers` |
| 13 | Discounts | 8 | `/api/discounts` |
| 14 | Transactions | 7 | `/api/transactions` |
| 15 | Shipments | 8 | `/api/shipments` |
| 16 | Order Returns | 4 | `/api/orders/returns` |
| 17 | Staff Reports | 5 | `/api/reports` |
| 18 | Inventory Lookup | 2 | `/api/inventory/lookup` |
| 19 | POS Payment | 10 | `/api/pos` |
| 20 | Bank Accounts | 5 | `/api/bank-accounts` |
| 21 | Checkouts | 4 | `/api/checkouts` |

---

## �📚 Tài liệu tham khảo

- Express.js: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs
- JWT: https://jwt.io
- Postman: https://learning.postman.com
- bcryptjs: https://www.npmjs.com/package/bcryptjs
- Multer (File upload): https://github.com/expressjs/multer
- CSV Parser: https://github.com/c2fo/node-csv

---

## ✅ Checklist chuẩn bị

- [ ] Tạo admin account
- [ ] Server chạy: `npm run dev`
- [ ] Database kết nối: Check logs "Database connected"
- [ ] Test login endpoint
- [ ] Lấy token thành công
- [ ] Test staff endpoints
- [ ] Test product endpoints
- [ ] Test collection endpoints
- [ ] Test profile endpoints
- [ ] Test orders endpoints

---

**Created:** 19/01/2026  
**Updated:** 28/01/2026  
**Version:** 2.1.0  
**Status:** ✅ Ready for Testing

**Ghi chú:** Tài liệu này bao gồm đầy đủ các endpoint từ Module 1-10 (67 APIs).

# 📚 API Documentation - Supermarket Management System

**Cập nhật:** 21/01/2026  
**Version:** 1.1.0

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
| 14 | Products | Danh sách | GET | `/api/products` |
| 15 | Products | Thêm mới | POST | `/api/products` |
| 16 | Products | Chi tiết | GET | `/api/products/:id` |
| 17 | Products | Sửa | PUT | `/api/products/:id` |
| 18 | Products | Xóa | DELETE | `/api/products/:id` |
| 19 | Products | Bulk status | PATCH | `/api/products/bulk-status` |
| 20 | Products | Export CSV | GET | `/api/products/export` |
| 21 | Products | Import CSV | POST | `/api/products/import` |
| 22 | Products | DS Thương hiệu | GET | `/api/brands` |
| 23 | Products | DS Đơn vị | GET | `/api/units` |
| 24 | Collections | Danh sách | GET | `/api/collections` |
| 25 | Collections | Cây danh mục | GET | `/api/collections/tree` |
| 26 | Collections | Thêm mới | POST | `/api/collections` |
| 27 | Collections | Chi tiết | GET | `/api/collections/:id` |
| 28 | Collections | Sửa | PUT | `/api/collections/:id` |
| 29 | Collections | Xóa | DELETE | `/api/collections/:id` |

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

## 📚 Tài liệu tham khảo

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

---

**Created:** 19/01/2026  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing

**Ghi chú:** Tài liệu này gộp từ 2 file API_DOCS.md và API_TESTING_GUIDE.md, bao gồm đầy đủ các endpoint từ Module 1-5.
